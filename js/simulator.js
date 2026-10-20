/**
 * Bounded, unsigned Verilog combinational interpreter for teaching.
 * This parses the submitted source into an AST; it never uses eval/Function and
 * never compares source text with a reference solution. It is NOT a synthesis
 * tool or a replacement for an IEEE-compliant HDL simulator. Supported:
 * one module, ANSI/non-ANSI input/output/wire declarations, continuous assigns,
 * unsigned expressions, concatenation, bit/constant part selects. No procedural
 * blocks, signed arithmetic, X/Z, delays, parameters, instances, or memories.
 * Widths are capped at 256 bits, source at 40,000 chars, and tests at 512 vectors.
 * Output/declared-wire truncation and expression assignment contexts are applied.
 * Values larger than Number.MAX_SAFE_INTEGER are returned as decimal strings.
 */

const MAX_WIDTH = 256;
const MAX_SOURCE = 40000;
const MAX_TOKENS = 12000;
const MAX_VECTORS = 512;
const MAX_AST_DEPTH = 160;
const UNSUPPORTED = new Set(['always', 'always_comb', 'always_ff', 'always_latch', 'initial', 'generate', 'parameter', 'localparam', 'function', 'task', 'reg', 'logic', 'integer', 'inout', 'tri', 'supply0', 'supply1']);
const MASK = width => (1n << BigInt(width)) - 1n;
const clip = (value, width) => value & MASK(width);
const diagnostic = (severity, line, message) => ({ severity, line: line || 1, message });
class HDLFailure extends Error {
  constructor(message, line = 1) { super(message); this.line = line; }
}
const fail = (token, message) => { throw new HDLFailure(message, token?.line || 1); };

function lex(code) {
  if (typeof code !== 'string') throw new HDLFailure('代码必须是文本。');
  if (code.length > MAX_SOURCE) throw new HDLFailure(`代码超过 ${MAX_SOURCE} 字符的教学解释器上限。`);
  const tokens = [];
  let pos = 0, line = 1;
  const add = (type, value, startLine) => {
    tokens.push({ type, value, line: startLine });
    if (tokens.length > MAX_TOKENS) throw new HDLFailure('代码过于复杂，超过词法单元数量上限。', startLine);
  };
  while (pos < code.length) {
    const c = code[pos];
    if (/\s/.test(c)) { if (c === '\n') line++; pos++; continue; }
    if (code.startsWith('//', pos)) { while (pos < code.length && code[pos] !== '\n') pos++; continue; }
    if (code.startsWith('/*', pos)) {
      const startLine = line; pos += 2;
      while (pos < code.length && !code.startsWith('*/', pos)) { if (code[pos++] === '\n') line++; }
      if (pos >= code.length) throw new HDLFailure('块注释没有用 */ 结束。', startLine);
      pos += 2; continue;
    }
    const startLine = line;
    if (/[A-Za-z_$]/.test(c)) {
      const start = pos++;
      while (pos < code.length && /[A-Za-z0-9_$]/.test(code[pos])) pos++;
      add('id', code.slice(start, pos), startLine); continue;
    }
    if (/[0-9']/.test(c)) {
      const start = pos;
      while (pos < code.length && /[0-9_]/.test(code[pos])) pos++;
      if (code[pos] === "'") {
        pos++;
        if (/[sS]/.test(code[pos] || '')) throw new HDLFailure('暂不支持 signed 有符号字面量；请使用无符号二进制、十六进制或十进制常量。', startLine);
        if (!/[bBoOdDhH]/.test(code[pos] || '')) throw new HDLFailure("常量中的单引号后应为 b、o、d 或 h；不支持 SystemVerilog 的 '0 / '1。", startLine);
        const radix = code[pos].toLowerCase(); pos++;
        const digitStart = pos;
        // Decimal digits cannot contain '?': 2'd0?x:y is a ternary without
        // optional whitespace. Other bases may spell unknown digits as '?'
        // and must be rejected as unsupported four-state values explicitly.
        while (pos < code.length && (/[A-Za-z0-9_]/.test(code[pos]) || (radix !== 'd' && code[pos] === '?'))) pos++;
        if (pos === digitStart) throw new HDLFailure('进制常量缺少数字。', startLine);
      }
      add('number', code.slice(start, pos), startLine); continue;
    }
    const op = ['===', '!==', '<<<', '>>>', '&&', '||', '==', '!=', '<=', '>=', '<<', '>>', '**', '~^', '^~', '~&', '~|'].find(value => code.startsWith(value, pos));
    if (op) {
      if (['===', '!==', '<<<', '>>>', '**'].includes(op)) throw new HDLFailure(`暂不支持运算符 ${op}。${op.includes('==') ? '本解释器只有 0/1 两态值，可使用 == 或 !=。' : ''}`, line);
      add('symbol', op, line); pos += op.length; continue;
    }
    if ('()[]{}:;,=~!&|^+-*<>?'.includes(c)) { add('symbol', c, line); pos++; continue; }
    if (c === '@') throw new HDLFailure('暂不支持 always 的 @ 事件控制；当前解释器只运行组合电路的 assign 连续赋值。', line);
    if (c === '`') throw new HDLFailure('暂不支持预处理指令、宏或 `timescale；请只提交当前组合模块。', line);
    if (c === '#') throw new HDLFailure('暂不支持 # 延时或参数化模块。', line);
    throw new HDLFailure(`无法识别字符“${c}”；请检查是否使用了中文标点或不支持的语法。`, line);
  }
  add('eof', '<EOF>', line);
  return tokens;
}

function numberValue(token) {
  const clean = token.value.replaceAll('_', '');
  const parts = clean.match(/^(\d*)'([bBoOdDhH])(.+)$/);
  if (!parts) {
    if (!/^\d+$/.test(clean)) fail(token, '十进制常量格式错误。');
    const value = BigInt(clean);
    if (value.toString(2).length > MAX_WIDTH) fail(token, `常量超过 ${MAX_WIDTH} 位上限。`);
    return { value, width: Math.max(32, value.toString(2).length) };
  }
  const [, size, base, digits] = parts;
  if (/[xXzZ?]/.test(digits)) fail(token, '本解释器只支持 0/1 两态逻辑，不能把 X、Z 或 ? 当作确定值模拟。');
  const validators = { b: /^[01]+$/, o: /^[0-7]+$/, d: /^\d+$/, h: /^[0-9a-fA-F]+$/ };
  if (!validators[base.toLowerCase()].test(digits)) fail(token, `${base} 进制常量含有无效数字。`);
  const prefix = { b: '0b', o: '0o', d: '', h: '0x' }[base.toLowerCase()];
  const value = BigInt(prefix + digits);
  const width = size ? Number(size) : Math.max(32, value.toString(2).length);
  if (!Number.isInteger(width) || width < 1 || width > MAX_WIDTH) fail(token, `常量位宽必须在 1–${MAX_WIDTH} 之间。`);
  return { value: clip(value, width), width, originalValue: value };
}

const PRECEDENCE = { '||': 1, '&&': 2, '|': 3, '^': 4, '~^': 4, '^~': 4, '&': 5, '==': 6, '!=': 6, '<': 7, '>': 7, '<=': 7, '>=': 7, '<<': 8, '>>': 8, '+': 9, '-': 9, '*': 10 };
const REDUCTIONS = new Set(['&', '|', '^', '~&', '~|', '~^', '^~']);
class Parser {
  constructor(tokens) {
    this.tokens = tokens; this.pos = 0; this.signals = new Map(); this.assignments = [];
    this.headerNames = []; this.ansi = false; this.diagnostics = [];
  }
  peek(offset = 0) { return this.tokens[Math.min(this.pos + offset, this.tokens.length - 1)]; }
  take(value) { if (this.peek().value === value) return this.tokens[this.pos++]; return null; }
  expect(value, message) { const token = this.take(value); if (!token) fail(this.peek(), message || `这里应为“${value}”，实际为“${this.peek().value}”。`); return token; }
  identifier() {
    const t = this.peek();
    if (t.type !== 'id' || ['module', 'endmodule', 'assign', 'wire', 'input', 'output', 'signed', 'unsigned', ...UNSUPPORTED].includes(t.value)) fail(t, `这里需要信号名称，实际为“${t.value}”。`);
    this.pos++; return t;
  }
  range() {
    if (!this.take('[')) return { width: 1, msb: 0, lsb: 0 };
    const msbNode = this.expression(); this.expect(':', '信号声明需要完整位宽，例如 [3:0]。');
    const lsbNode = this.expression(); this.expect(']');
    const msb = constantInteger(msbNode), lsb = constantInteger(lsbNode);
    const width = Math.abs(msb - lsb) + 1;
    if (width > MAX_WIDTH || msb > 65535 || lsb > 65535) fail(msbNode, `信号位宽不能超过 ${MAX_WIDTH} 位，位索引不能超过 65535。`);
    return { width, msb, lsb };
  }
  qualifier() {
    this.take('wire');
    if (['signed', 'unsigned'].includes(this.peek().value)) fail(this.peek(), '暂不支持 signed / unsigned 声明；本解释器仅支持普通无符号 wire。');
    if (['reg', 'logic'].includes(this.peek().value)) fail(this.peek(), '当前练习仅支持连续赋值 wire；reg / logic 和过程赋值需要完整 HDL 仿真器。');
  }
  declare(name, direction, range, fromHeader = false) {
    if (this.signals.has(name.value)) fail(name, `信号 ${name.value} 被重复声明。`);
    this.signals.set(name.value, { name: name.value, direction, ...range, line: name.line, fromHeader });
  }
  parse() {
    this.expect('module', '请提交一个完整的 Verilog module（从 module 到 endmodule）。');
    this.moduleName = this.identifier().value;
    if (this.take('(')) {
      this.ansi = ['input', 'output', 'inout'].includes(this.peek().value);
      let inherited = null;
      if (!this.take(')')) {
        do {
          if (this.ansi) {
            if (['input', 'output'].includes(this.peek().value)) {
              const direction = this.tokens[this.pos++].value; this.qualifier();
              inherited = { direction, range: this.range() };
            }
            if (!inherited) fail(this.peek(), 'ANSI 端口需要 input 或 output 声明。');
            const name = this.identifier(); this.declare(name, inherited.direction, inherited.range, true); this.headerNames.push(name.value);
          } else { this.headerNames.push(this.identifier().value); }
        } while (this.take(','));
        this.expect(')');
      }
    }
    this.expect(';', 'module 端口声明后缺少分号 ;。');
    while (this.peek().value !== 'endmodule' && this.peek().type !== 'eof') {
      const t = this.peek();
      if (['input', 'output', 'wire'].includes(t.value)) {
        this.pos++; const direction = t.value === 'wire' ? 'wire' : t.value; this.qualifier(); const range = this.range();
        do {
          const name = this.identifier(); this.declare(name, direction, range);
          if (this.take('=')) {
            if (direction !== 'wire') fail(name, '输入/输出端口声明不能带初值；请使用独立的 assign 语句。');
            this.assignments.push({ target: { type: 'id', name: name.value, line: name.line }, expr: this.expression(), line: name.line });
          }
        } while (this.take(','));
        this.expect(';', '信号声明末尾缺少分号 ;。'); continue;
      }
      if (this.take('assign')) {
        do {
          const target = this.expression(11); this.expect('=', '连续赋值应使用 assign 目标 = 表达式；比较相等请使用 ==。');
          const expr = this.expression(); this.assignments.push({ target, expr, line: target.line });
        } while (this.take(','));
        this.expect(';', 'assign 语句末尾缺少分号 ;。'); continue;
      }
      if (UNSUPPORTED.has(t.value)) fail(t, `暂不支持 ${t.value}：当前解释器只运行无符号组合电路的 assign 连续赋值。时序电路请使用 Icarus Verilog / Verilator 等完整工具。`);
      if (t.value === 'signed') fail(t, '暂不支持 signed 有符号运算。');
      fail(t, `不支持的模块语句“${t.value}”。只接受 input / output / wire 声明和 assign 连续赋值；不支持子模块实例。`);
    }
    this.expect('endmodule', '模块没有用 endmodule 结束。');
    if (this.peek().type !== 'eof') fail(this.peek(), '只支持一个 module；endmodule 后还有多余内容。');
    if (new Set(this.headerNames).size !== this.headerNames.length) throw new HDLFailure('module 端口列表含有重复名称。');
    if (!this.ansi) for (const name of this.headerNames) {
      const signal = this.signals.get(name);
      if (!signal || !['input', 'output'].includes(signal.direction)) throw new HDLFailure(`端口 ${name} 缺少 input / output 声明。`);
    }
    for (const signal of this.signals.values()) if (['input', 'output'].includes(signal.direction) && !this.headerNames.includes(signal.name)) {
      throw new HDLFailure(`端口 ${signal.name} 未出现在 module 的端口列表中。`, signal.line);
    }
    if (this.assignments.length > 1024) throw new HDLFailure('连续赋值数量超过教学解释器上限。');
    return this;
  }
  expression(min = 0, depth = 0) {
    if (depth > MAX_AST_DEPTH) fail(this.peek(), '表达式嵌套过深，请拆分为中间 wire。');
    let left;
    const token = this.peek();
    if (['~', '!', '+', '-', ...REDUCTIONS].includes(token.value)) { this.pos++; left = { type: 'unary', op: token.value, arg: this.expression(11, depth + 1), line: token.line }; }
    else if (this.take('(')) { left = this.expression(0, depth + 1); this.expect(')'); }
    else if (this.take('{')) {
      const parts = [this.expression(0, depth + 1)];
      if (this.peek().value === '{') fail(this.peek(), '暂不支持重复连接 {N{...}}；可显式列出每个连接项。');
      while (this.take(',')) parts.push(this.expression(0, depth + 1));
      this.expect('}', '连接表达式应以 } 结束。'); left = { type: 'concat', parts, line: token.line };
    } else if (token.type === 'number') { this.pos++; left = { type: 'number', ...numberValue(token), raw: token.value, line: token.line }; }
    else if (token.type === 'id') {
      const name = this.identifier(); left = { type: 'id', name: name.value, line: name.line };
    } else fail(token, `这里缺少表达式，实际为“${token.value}”。`);
    while (this.take('[')) {
      const hi = this.expression(0, depth + 1);
      if (this.take(':')) { const lo = this.expression(0, depth + 1); this.expect(']'); left = { type: 'slice', arg: left, hi, lo, line: left.line }; }
      else { this.expect(']'); left = { type: 'select', arg: left, index: hi, line: left.line }; }
    }
    while (PRECEDENCE[this.peek().value] !== undefined && PRECEDENCE[this.peek().value] >= min) {
      const op = this.tokens[this.pos++]; const right = this.expression(PRECEDENCE[op.value] + 1, depth + 1);
      left = { type: 'binary', op: op.value, left, right, line: op.line };
    }
    if (min === 0 && this.take('?')) {
      const yes = this.expression(0, depth + 1); this.expect(':', '条件选择应写为 条件 ? 为真时的值 : 为假时的值。');
      const no = this.expression(0, depth + 1); left = { type: 'ternary', cond: left, yes, no, line: left.line };
    }
    return left;
  }
}

function constantInteger(node) {
  if (!isConstantInteger(node)) fail(node, '位宽和固定切片边界必须是非负整型常量；暂不支持 parameter。');
  const value = constantUnsignedValue(node, { signals: new Map() });
  if (value < 0n || value > 65535n) fail(node, '位索引必须是 0–65535 范围内的非负整数。');
  return Number(value);
}

function isConstantInteger(node) {
  return node.type === 'number'
    || (node.type === 'unary' && ['+', '-'].includes(node.op) && isConstantInteger(node.arg))
    || (node.type === 'binary' && ['+', '-', '*', '<<', '>>'].includes(node.op) && isConstantInteger(node.left) && isConstantInteger(node.right));
}

function constantUnsignedValue(node, model, context = 0) {
  const width = Math.max(nodeWidth(node, model), context);
  if (node.type === 'number') return node.value;
  if (node.type === 'unary') {
    const value = constantUnsignedValue(node.arg, model, width);
    return clip(node.op === '-' ? -value : value, width);
  }
  const a = constantUnsignedValue(node.left, model, width);
  const shift = ['<<', '>>'].includes(node.op);
  const b = constantUnsignedValue(node.right, model, shift ? 0 : width);
  if (node.op === '+') return clip(a + b, width);
  if (node.op === '-') return clip(a - b, width);
  if (node.op === '*') return clip(a * b, width);
  return b >= BigInt(width) ? 0n : clip(node.op === '<<' ? a << b : a >> b, width);
}

function walk(node, callback) {
  callback(node);
  for (const key of ['arg', 'left', 'right', 'cond', 'yes', 'no', 'hi', 'lo', 'index']) if (node[key]) walk(node[key], callback);
  if (node.parts) for (const part of node.parts) walk(part, callback);
}
const isBool = op => ['==', '!=', '<', '>', '<=', '>=', '&&', '||'].includes(op);
function nodeWidth(node, model) {
  if (node.width !== undefined) return node.width;
  let width;
  switch (node.type) {
    case 'id': {
      const signal = model.signals.get(node.name);
      if (!signal) fail(node, `信号 ${node.name} 未声明。请检查拼写，并在使用前声明 input / output / wire。`);
      width = signal.width; break;
    }
    case 'unary': width = node.op === '!' || REDUCTIONS.has(node.op) ? 1 : nodeWidth(node.arg, model); break;
    case 'binary': width = isBool(node.op) ? 1 : ['<<', '>>'].includes(node.op) ? nodeWidth(node.left, model) : Math.max(nodeWidth(node.left, model), nodeWidth(node.right, model)); break;
    case 'ternary': width = Math.max(nodeWidth(node.yes, model), nodeWidth(node.no, model)); break;
    case 'concat': width = node.parts.reduce((sum, part) => sum + nodeWidth(part, model), 0); break;
    case 'select': width = 1; break;
    case 'slice': width = Math.abs(constantInteger(node.hi) - constantInteger(node.lo)) + 1; break;
    default: fail(node, '未知的表达式节点。');
  }
  if (width < 1 || width > MAX_WIDTH) fail(node, `表达式位宽为 ${width}，超过 ${MAX_WIDTH} 位上限；请拆分连接。`);
  node.width = width; return width;
}
function selectPosition(arg, index, model, node) {
  nodeWidth(arg, model);
  const range = arg.type === 'id' ? model.signals.get(arg.name) : { msb: nodeWidth(arg, model) - 1, lsb: 0 };
  if (index < Math.min(range.msb, range.lsb) || index > Math.max(range.msb, range.lsb)) fail(node, `位选择 [${index}] 超出 ${arg.name || '表达式'} 的 [${range.msb}:${range.lsb}] 范围。`);
  return range.msb >= range.lsb ? index - range.lsb : range.lsb - index;
}
function slicePositions(node, model) {
  const hi = constantInteger(node.hi), lo = constantInteger(node.lo);
  const hiPos = selectPosition(node.arg, hi, model, node), loPos = selectPosition(node.arg, lo, model, node);
  if (hiPos < loPos) fail(node, '固定切片方向与信号声明相反；[7:0] 信号需要形如 [5:2] 的降序切片。');
  return { offset: loPos, width: hiPos - loPos + 1 };
}
function targets(node, model, sourceOffset = 0) {
  if (node.type === 'concat') {
    let offset = sourceOffset; const all = [];
    for (const part of [...node.parts].reverse()) { all.push(...targets(part, model, offset)); offset += nodeWidth(part, model); }
    return all;
  }
  let id = node, offset = 0, width;
  if (node.type === 'slice') { id = node.arg; ({ offset, width } = slicePositions(node, model)); }
  else if (node.type === 'select') { id = node.arg; offset = selectPosition(id, constantInteger(node.index), model, node); width = 1; }
  if (id.type !== 'id') fail(node, 'assign 左侧只能是信号、固定切片或它们的连接，不能是运算表达式。');
  const signal = model.signals.get(id.name);
  if (!signal) fail(id, `赋值目标 ${id.name} 未声明。`);
  if (signal.direction === 'input') fail(id, `输入 ${id.name} 由外部测试向量驱动，不能在模块内部赋值。`);
  width ??= signal.width;
  return Array.from({ length: width }, (_, bit) => ({ name: id.name, bit: offset + bit, sourceBit: sourceOffset + bit }));
}

function buildNetlist(model) {
  const nodes = [], edges = []; let next = 0;
  for (const signal of model.signals.values()) nodes.push({ id: `signal:${signal.name}`, label: signal.width === 1 ? signal.name : `${signal.name} [${signal.msb}:${signal.lsb}]`, kind: signal.direction === 'wire' ? 'wire' : signal.direction });
  const visit = node => {
    if (node.type === 'id') return `signal:${node.name}`;
    const id = `expr:${next++}`;
    const label = node.type === 'number' ? node.raw : node.type === 'concat' ? '{连接}' : node.type === 'ternary' ? '? : 选择器' : node.type === 'slice' ? `[${constantInteger(node.hi)}:${constantInteger(node.lo)}]` : node.type === 'select' ? '[位选择]' : node.op;
    nodes.push({ id, label, kind: node.type === 'number' ? 'constant' : node.type === 'ternary' ? 'mux' : 'operator' });
    if (node.type === 'ternary') for (const [key, label] of [['cond', '条件'], ['yes', '1'], ['no', '0']]) edges.push({ from: visit(node[key]), to: id, label });
    else if (node.type === 'concat') for (const [i, part] of node.parts.entries()) edges.push({ from: visit(part), to: id, label: `${i + 1}` });
    else for (const key of ['arg', 'left', 'right', 'index']) if (node[key]) edges.push({ from: visit(node[key]), to: id, ...(key === 'index' ? { label: '索引' } : {}) });
    return id;
  };
  for (const assignment of model.assignments) {
    const from = visit(assignment.expr), names = [...new Set(assignment.bits.map(bit => bit.name))];
    for (const name of names) edges.push({ from, to: `signal:${name}`, label: `${assignment.width} 位赋值 · L${assignment.line}` });
  }
  return { nodes, edges };
}

// Derive dependencies per bit so y={y[0],a} is a feed-forward circuit, while
// y=~y remains a real feedback error. Arithmetic bit n only needs bits 0..n.
// A dynamic index and either MUX branch are conservatively considered possible.
function bitDependencies(node, bit, context, model) {
  const natural = nodeWidth(node, model), width = Math.max(natural, context);
  if (bit < 0 || bit >= width) return [];
  const key = `${bit}:${context}`;
  node.bitDependencyCache ??= new Map();
  if (node.bitDependencyCache.has(key)) return node.bitDependencyCache.get(key);
  if (--model.analysisBudget < 0) fail(node, '位级依赖分析超过教学解释器的资源上限；请缩短或拆分组合表达式。');
  const one = (arg, index, ctx = 0) => bitDependencies(arg, index, ctx, model);
  const low = (arg, count, ctx = 0) => Array.from({ length: Math.min(count, Math.max(nodeWidth(arg, model), ctx)) }, (_, i) => one(arg, i, ctx)).flat();
  const all = (arg, ctx = 0) => low(arg, Math.max(nodeWidth(arg, model), ctx), ctx);
  let refs = [];
  switch (node.type) {
    case 'number': break;
    case 'id': if (bit < natural) refs = [{ name: node.name, bit, line: node.line }]; break;
    case 'concat': {
      let offset = 0;
      for (const part of [...node.parts].reverse()) {
        const size = nodeWidth(part, model);
        if (bit >= offset && bit < offset + size) { refs = one(part, bit - offset); break; }
        offset += size;
      }
      break;
    }
    case 'slice': if (bit < natural) refs = one(node.arg, slicePositions(node, model).offset + bit); break;
    case 'select':
      if (bit === 0) refs = isConstantInteger(node.index)
        ? one(node.arg, selectPosition(node.arg, constantInteger(node.index), model, node))
        : [...all(node.arg), ...all(node.index)];
      break;
    case 'ternary': refs = [...all(node.cond), ...one(node.yes, bit, width), ...one(node.no, bit, width)]; break;
    case 'unary':
      if (node.op === '!' || REDUCTIONS.has(node.op)) { if (bit === 0) refs = all(node.arg); }
      else refs = node.op === '-' ? low(node.arg, bit + 1, width) : one(node.arg, bit, width);
      break;
    case 'binary':
      if (isBool(node.op)) {
        const ctx = ['&&', '||'].includes(node.op) ? 0 : Math.max(nodeWidth(node.left, model), nodeWidth(node.right, model));
        if (bit === 0) refs = [...all(node.left, ctx), ...all(node.right, ctx)];
      } else if (['<<', '>>'].includes(node.op)) {
        if (isConstantInteger(node.right)) {
          const fullAmount = constantUnsignedValue(node.right, model);
          const amount = fullAmount >= BigInt(width) ? width : Number(fullAmount), sourceBit = node.op === '<<' ? bit - amount : bit + amount;
          refs = sourceBit < 0 || sourceBit >= width ? [] : one(node.left, sourceBit, width);
        } else refs = [...all(node.left, width), ...all(node.right)];
      } else if (['+', '-', '*'].includes(node.op)) refs = [...low(node.left, bit + 1, width), ...low(node.right, bit + 1, width)];
      else refs = [...one(node.left, bit, width), ...one(node.right, bit, width)];
      break;
  }
  refs = [...new Map(refs.map(ref => [`${ref.name}:${ref.bit}`, ref])).values()];
  node.bitDependencyCache.set(key, refs); return refs;
}

function compile(code) {
  const model = new Parser(lex(code)).parse();
  model.drivers = new Map();
  model.analysisBudget = 250000;
  model.evaluationBudget = 1000000;
  for (const assignment of model.assignments) {
    // Validate every branch, including branches not taken by current vectors.
    for (const root of [assignment.target, assignment.expr]) walk(root, node => {
      nodeWidth(node, model);
      if (node.type === 'slice') slicePositions(node, model);
      if (node.type === 'select' && isConstantInteger(node.index)) selectPosition(node.arg, constantInteger(node.index), model, node);
      if (node.type === 'number' && node.originalValue > MASK(node.width)) model.diagnostics.push(diagnostic('warning', node.line, `常量 ${node.raw} 超出自身位宽，其高位会被截断。`));
    });
    assignment.width = nodeWidth(assignment.target, model);
    assignment.bits = targets(assignment.target, model);
    for (const bit of assignment.bits) {
      const key = `${bit.name}:${bit.bit}`;
      if (model.drivers.has(key)) fail(assignment.target, `信号 ${bit.name} 的第 ${bit.bit} 个存储位存在多个驱动；同一位只能由一条连续赋值驱动。`);
      model.drivers.set(key, { assignment, sourceBit: bit.sourceBit });
    }
  }
  const dependencies = new Map();
  for (const [key, driver] of model.drivers) dependencies.set(key, bitDependencies(driver.assignment.expr, driver.sourceBit, driver.assignment.width, model));
  const needed = new Set([...dependencies.values()].flatMap(refs => refs.map(ref => `${ref.name}:${ref.bit}`)));
  for (const signal of model.signals.values()) {
    if (signal.direction === 'input') continue;
    for (let bit = 0; bit < signal.width; bit++) {
      if ((signal.direction === 'output' || needed.has(`${signal.name}:${bit}`)) && !model.drivers.has(`${signal.name}:${bit}`)) throw new HDLFailure(`信号 ${signal.name} 没有完整驱动（缺少第 ${bit} 个存储位的 assign）；本解释器不能把悬空值当作 0。`, signal.line);
    }
  }
  const state = new Map();
  const detect = (key, path) => {
    if (state.get(key) === 'visiting') throw new HDLFailure(`检测到组合反馈环：${path.join(' → ')}。连续赋值不会按代码顺序执行；请用输入或寄存器打断反馈。`, model.drivers.get(key).assignment.line);
    if (state.get(key) === 'done') return;
    state.set(key, 'visiting');
    for (const ref of dependencies.get(key)) {
      const source = `${ref.name}:${ref.bit}`;
      if (model.drivers.has(source)) detect(source, [...path, `${ref.name}[位${ref.bit}]`]);
    }
    state.set(key, 'done');
  };
  for (const key of model.drivers.keys()) detect(key, [key.replace(':', '[位') + ']']);
  model.netlist = buildNetlist(model); return model;
}

function parseExternalValue(value, width, label, line = 1) {
  let number;
  if (typeof value === 'boolean') number = value ? 1n : 0n;
  else if (typeof value === 'bigint') number = value;
  else if (typeof value === 'number' && Number.isSafeInteger(value)) number = BigInt(value);
  else if (typeof value === 'string' && /^(?:\d+|0[bB][01]+|0[xX][0-9a-fA-F]+|0[oO][0-7]+)$/.test(value)) number = BigInt(value);
  else throw new HDLFailure(`${label} 必须是非负安全整数，或十进制 / 0b / 0x 整数字符串。`, line);
  if (number < 0n || number > MASK(width)) throw new HDLFailure(`${label}=${String(value)} 超出 ${width} 位无符号范围 0–${MASK(width)}。`, line);
  return number;
}
const exportValue = value => value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : value.toString();

function runModel(model, inputs) {
  if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) throw new HDLFailure('测试向量的 inputs 必须是 {信号名: 数值}。');
  const inputValues = new Map();
  for (const signal of model.signals.values()) if (signal.direction === 'input') {
    if (!Object.hasOwn(inputs, signal.name)) throw new HDLFailure(`测试向量缺少输入 ${signal.name}；每个输入都必须有明确的 0/1 数值。`, signal.line);
    inputValues.set(signal.name, parseExternalValue(inputs[signal.name], signal.width, `输入 ${signal.name}`, signal.line));
  }
  for (const name of Object.keys(inputs)) if (model.signals.get(name)?.direction !== 'input') throw new HDLFailure(`测试向量中的 ${name} 不是模块输入；请检查端口名。`);
  const bitCache = new Map(), active = new Set();
  const evalBit = (name, bit) => {
    if (inputValues.has(name)) return (inputValues.get(name) >> BigInt(bit)) & 1n;
    const key = `${name}:${bit}`;
    if (bitCache.has(key)) return bitCache.get(key);
    const driver = model.drivers.get(key);
    if (!driver) throw new HDLFailure(`信号 ${name} 缺少连续赋值驱动。`, model.signals.get(name).line);
    if (active.has(key)) throw new HDLFailure(`计算时发现 ${name} 的第 ${bit} 个存储位存在组合反馈环。`, driver.assignment.line);
    active.add(key);
    const value = evaluateBit(driver.assignment.expr, driver.sourceBit, driver.assignment.width);
    active.delete(key); bitCache.set(key, value); return value;
  };
  const evalSignal = name => {
    if (inputValues.has(name)) return inputValues.get(name);
    let value = 0n;
    for (let bit = 0; bit < model.signals.get(name).width; bit++) value |= evalBit(name, bit) << BigInt(bit);
    return value;
  };
  const lowValue = (node, count, context = 0) => {
    let value = 0n;
    for (let bit = 0; bit < Math.min(count, Math.max(nodeWidth(node, model), context)); bit++) value |= evaluateBit(node, bit, context) << BigInt(bit);
    return value;
  };
  const expressionBits = new WeakMap();
  const evaluateBit = (node, bit, context = 0) => {
    const natural = nodeWidth(node, model), width = Math.max(natural, context);
    if (bit < 0 || bit >= width) return 0n;
    let cached = expressionBits.get(node);
    if (!cached) { cached = new Map(); expressionBits.set(node, cached); }
    const key = `${bit}:${context}`;
    if (cached.has(key)) return cached.get(key);
    if (--model.evaluationBudget < 0) fail(node, '组合电路计算超过教学解释器的资源上限；请减少向量、位宽或表达式复杂度。');
    let value;
    if (node.type === 'number') value = (node.value >> BigInt(bit)) & 1n;
    else if (node.type === 'id') value = bit >= natural ? 0n : evalBit(node.name, bit);
    else if (node.type === 'concat') {
      value = 0n; let offset = 0;
      for (const part of [...node.parts].reverse()) {
        const size = nodeWidth(part, model);
        if (bit >= offset && bit < offset + size) { value = evaluateBit(part, bit - offset); break; }
        offset += size;
      }
    } else if (node.type === 'select' || node.type === 'slice') {
      value = 0n;
      if (bit < natural) {
        const index = node.type === 'slice' ? 0n : evaluate(node.index);
        if (index > 65535n) fail(node, '动态位选择的索引超过信号范围。');
        const offset = node.type === 'slice' ? slicePositions(node, model).offset : selectPosition(node.arg, Number(index), model, node);
        value = evaluateBit(node.arg, offset + bit);
      }
    } else if (node.type === 'ternary') value = evaluateBit(evaluate(node.cond) !== 0n ? node.yes : node.no, bit, width);
    else if (node.type === 'unary' && !REDUCTIONS.has(node.op) && node.op !== '!') {
      if (node.op === '~') value = 1n - evaluateBit(node.arg, bit, width);
      else if (node.op === '+') value = evaluateBit(node.arg, bit, width);
      else value = (clip(-lowValue(node.arg, bit + 1, width), width) >> BigInt(bit)) & 1n;
    } else if (node.type === 'binary' && !isBool(node.op)) {
      if (['<<', '>>'].includes(node.op)) {
        const amount = evaluate(node.right);
        if (amount >= BigInt(width)) value = 0n;
        else value = evaluateBit(node.left, node.op === '<<' ? bit - Number(amount) : bit + Number(amount), width);
      } else if (['+', '-', '*'].includes(node.op)) {
        const a = lowValue(node.left, bit + 1, width), b = lowValue(node.right, bit + 1, width);
        const full = node.op === '+' ? a + b : node.op === '-' ? a - b : a * b;
        value = (clip(full, width) >> BigInt(bit)) & 1n;
      } else {
        const a = evaluateBit(node.left, bit, width), b = evaluateBit(node.right, bit, width);
        value = node.op === '&' ? a & b : node.op === '|' ? a | b : node.op === '^' ? a ^ b : 1n - (a ^ b);
      }
    } else value = bit === 0 ? evaluate(node) : 0n;
    cached.set(key, value); return value;
  };
  const evaluate = (node, context = 0) => {
    const natural = nodeWidth(node, model), width = Math.max(natural, context);
    if (node.type === 'number') return node.value;
    if (node.type === 'id') return evalSignal(node.name);
    if (node.type === 'concat') {
      let value = 0n;
      for (const part of node.parts) value = (value << BigInt(nodeWidth(part, model))) | clip(evaluate(part), nodeWidth(part, model));
      return value;
    }
    if (node.type === 'select' || node.type === 'slice') {
      let offset, size;
      if (node.type === 'slice') ({ offset, width: size } = slicePositions(node, model));
      else {
        const index = evaluate(node.index);
        if (index > 65535n) fail(node, '动态位选择的索引超过信号范围。');
        offset = selectPosition(node.arg, Number(index), model, node); size = 1;
      }
      if (node.arg.type === 'id') {
        let value = 0n;
        for (let bit = 0; bit < size; bit++) value |= evalBit(node.arg.name, offset + bit) << BigInt(bit);
        return value;
      }
      return (evaluate(node.arg) >> BigInt(offset)) & MASK(size);
    }
    if (node.type === 'unary') {
      if (REDUCTIONS.has(node.op)) {
        const value = clip(evaluate(node.arg), nodeWidth(node.arg, model));
        let reduction;
        if (node.op.includes('&')) reduction = value === MASK(nodeWidth(node.arg, model)) ? 1n : 0n;
        else if (node.op.includes('|')) reduction = value !== 0n ? 1n : 0n;
        else {
          reduction = 0n;
          for (let bit = value; bit; bit >>= 1n) reduction ^= bit & 1n;
        }
        return node.op.includes('~') ? 1n - reduction : reduction;
      }
      const a = evaluate(node.arg, node.op === '!' ? 0 : width);
      if (node.op === '!') return a === 0n ? 1n : 0n;
      if (node.op === '~') return clip(~a, width);
      return clip(node.op === '-' ? -a : a, width);
    }
    if (node.type === 'ternary') return clip(evaluate(evaluate(node.cond) !== 0n ? node.yes : node.no, width), width);
    if (node.type === 'binary') {
      const comparison = isBool(node.op), shift = ['<<', '>>'].includes(node.op), logical = ['&&', '||'].includes(node.op);
      const operandWidth = comparison ? Math.max(nodeWidth(node.left, model), nodeWidth(node.right, model)) : width;
      const a = evaluate(node.left, logical ? 0 : operandWidth), b = evaluate(node.right, shift || logical ? 0 : operandWidth);
      switch (node.op) {
        case '+': return clip(a + b, width);
        case '-': return clip(a - b, width);
        case '*': return clip(a * b, width);
        case '&': return clip(a & b, width);
        case '|': return clip(a | b, width);
        case '^': return clip(a ^ b, width);
        case '~^': case '^~': return clip(~(a ^ b), width);
        case '<<': return b >= BigInt(width) ? 0n : clip(a << b, width);
        case '>>': return b >= BigInt(width) ? 0n : clip(a >> b, width);
        case '==': return a === b ? 1n : 0n;
        case '!=': return a !== b ? 1n : 0n;
        case '<': return a < b ? 1n : 0n;
        case '>': return a > b ? 1n : 0n;
        case '<=': return a <= b ? 1n : 0n;
        case '>=': return a >= b ? 1n : 0n;
        case '&&': return a !== 0n && b !== 0n ? 1n : 0n;
        case '||': return a !== 0n || b !== 0n ? 1n : 0n;
      }
    }
    fail(node, '表达式求值失败。');
  };
  const actual = {};
  for (const signal of model.signals.values()) if (signal.direction === 'output') actual[signal.name] = exportValue(evalSignal(signal.name));
  return actual;
}

function validatePorts(model, config) {
  for (const [key, direction] of [['inputs', 'input'], ['outputs', 'output']]) {
    if (config[key] === undefined) continue;
    if (!Array.isArray(config[key])) throw new HDLFailure(`练习配置 ${key} 必须是端口数组。`);
    const seen = new Set();
    for (const port of config[key]) {
      if (!port || typeof port.name !== 'string') throw new HDLFailure(`练习配置 ${key} 的端口缺少名称。`);
      if (seen.has(port.name)) throw new HDLFailure(`练习配置中的端口 ${port.name} 重复。`);
      seen.add(port.name);
      const signal = model.signals.get(port.name);
      if (!signal || signal.direction !== direction) throw new HDLFailure(`练习要求 ${direction === 'input' ? '输入' : '输出'} ${port.name}，但提交模块没有相应端口。`, signal?.line);
      if (port.width !== undefined && signal.width !== port.width) throw new HDLFailure(`端口 ${port.name} 应为 ${port.width} 位，你声明了 ${signal.width} 位。`, signal.line);
    }
    for (const signal of model.signals.values()) if (signal.direction === direction && !seen.has(signal.name)) throw new HDLFailure(`提交模块多出了练习未定义的${direction === 'input' ? '输入' : '输出'}端口 ${signal.name}。`, signal.line);
  }
}

function errorDiagnostic(error) {
  if (error instanceof HDLFailure) return diagnostic('error', error.line, error.message);
  // Keep malformed user input from breaking the host UI, without exposing stacks.
  if (error instanceof RangeError) return diagnostic('error', 1, '表达式过深或数值过大，超过教学解释器的资源上限；请拆分代码。');
  return diagnostic('error', 1, `解释器无法处理这段代码：${error?.message || '未知错误'}。`);
}

/** Run actual submitted logic against a finite set of expected vectors. */
export function simulate(code, config = {}) {
  const result = { ok: false, passed: 0, total: Array.isArray(config?.vectors) ? config.vectors.length : 0, results: [], diagnostics: [], netlist: { nodes: [], edges: [] } };
  let model;
  try {
    if (!config || typeof config !== 'object') throw new HDLFailure('练习配置必须是对象。');
    if (!Array.isArray(config.vectors) || !config.vectors.length) throw new HDLFailure('没有测试向量；至少需要一组 inputs 与 expected 才能判题。');
    if (config.vectors.length > MAX_VECTORS) throw new HDLFailure(`一次最多运行 ${MAX_VECTORS} 组测试向量。`);
    model = compile(code); result.netlist = model.netlist; result.diagnostics = [...model.diagnostics]; validatePorts(model, config);
    const outputPorts = [...model.signals.values()].filter(signal => signal.direction === 'output');
    if (!outputPorts.length) throw new HDLFailure('模块没有 output，无法进行结果比较。');
    for (const [index, vector] of config.vectors.entries()) {
      const row = { inputs: vector?.inputs || {}, expected: vector?.expected || {}, actual: {}, pass: false };
      result.results.push(row);
      try {
        if (!vector || !vector.expected || typeof vector.expected !== 'object' || Array.isArray(vector.expected)) throw new HDLFailure('expected 必须是 {输出名: 期望值}。');
        for (const port of outputPorts) if (!Object.hasOwn(vector.expected, port.name)) throw new HDLFailure(`缺少输出 ${port.name} 的期望值，不能只比较部分输出。`, port.line);
        for (const name of Object.keys(vector.expected)) if (model.signals.get(name)?.direction !== 'output') throw new HDLFailure(`期望值中的 ${name} 不是模块输出。`);
        const expected = new Map(outputPorts.map(port => [port.name, parseExternalValue(vector.expected[port.name], port.width, `期望输出 ${port.name}`, port.line)]));
        row.actual = runModel(model, vector.inputs);
        row.pass = outputPorts.every(port => BigInt(row.actual[port.name]) === expected.get(port.name));
        if (row.pass) result.passed++;
      } catch (error) {
        const d = errorDiagnostic(error); d.message = `测试 ${index + 1}：${d.message}`; result.diagnostics.push(d);
      }
    }
    if (result.passed !== result.total && !result.diagnostics.some(d => d.severity === 'error')) result.diagnostics.push(diagnostic('warning', model.assignments[0]?.line || 1, `${result.total - result.passed} 组输入的实际输出与期望不同。请逐行检查反例；运算符、位宽、选择条件或连接顺序可能有误。`));
    result.ok = result.passed === result.total && !result.diagnostics.some(d => d.severity === 'error');
  } catch (error) { result.diagnostics.push(errorDiagnostic(error)); }
  return result;
}

/** Evaluate one input state without grading, e.g. for interactive switches. */
export function evaluateCircuit(code, inputs, portConfig = {}) {
  try {
    const model = compile(code); validatePorts(model, portConfig);
    const actual = runModel(model, inputs);
    return { ok: true, actual, outputs: actual, diagnostics: model.diagnostics, netlist: model.netlist };
  } catch (error) { return { ok: false, actual: {}, outputs: {}, diagnostics: [errorDiagnostic(error)], netlist: { nodes: [], edges: [] } }; }
}
