/**
 * Course terminology. These are hardware concepts, not translations of Verilog
 * identifiers: in particular, declaring `reg` does not necessarily infer a register.
 * `withEnglishTerms` returns plain text. Escape it at the HTML rendering boundary.
 */
export const terminology = [
  { zh: '硬件描述语言', en: 'hardware description language, HDL' },
  { zh: '寄存器传输级', en: 'register-transfer level, RTL' },
  { zh: '数字系统', en: 'digital system' },
  { zh: '组合逻辑', en: 'combinational logic' },
  { zh: '组合电路', en: 'combinational circuit' },
  { zh: '时序逻辑', en: 'sequential logic' },
  { zh: '时序电路', en: 'sequential circuit' },
  { zh: '可综合', en: 'synthesizable' },
  { zh: '逻辑综合', en: 'logic synthesis' },
  { zh: '综合器', en: 'synthesizer' },
  { zh: '综合', en: 'synthesis' },
  { zh: '仿真器', en: 'simulator' },
  { zh: '仿真', en: 'simulation' },
  { zh: '验证', en: 'verification' },
  { zh: '测试平台', en: 'testbench' },
  { zh: '测试向量', en: 'test vector' },
  { zh: '真值表', en: 'truth table' },
  { zh: '波形', en: 'waveform' },
  { zh: '技术映射', en: 'technology mapping' },
  { zh: '布局布线', en: 'placement and routing' },
  { zh: '传播延迟', en: 'propagation delay' },
  { zh: '逻辑门', en: 'logic gate' },
  { zh: '门级', en: 'gate-level' },
  { zh: '与非门', en: 'NAND gate' },
  { zh: '或非门', en: 'NOR gate' },
  { zh: '同或门', en: 'XNOR gate' },
  { zh: '异或门', en: 'XOR gate' },
  { zh: '与门', en: 'AND gate' },
  { zh: '或门', en: 'OR gate' },
  { zh: '非门', en: 'NOT gate' },
  { zh: '缓冲器', en: 'buffer' },
  { zh: '多路选择器', en: 'multiplexer, MUX' },
  { zh: '优先编码器', en: 'priority encoder' },
  { zh: '译码器', en: 'decoder' },
  { zh: '编码器', en: 'encoder' },
  { zh: '比较器', en: 'comparator' },
  { zh: '半加器', en: 'half adder' },
  { zh: '全加器', en: 'full adder' },
  { zh: '加法器', en: 'adder' },
  { zh: '减法器', en: 'subtractor' },
  { zh: '乘法器', en: 'multiplier' },
  { zh: '算术逻辑单元', en: 'arithmetic logic unit, ALU' },
  { zh: '数据通路', en: 'datapath' },
  { zh: '控制单元', en: 'control unit' },
  { zh: '模块例化', en: 'module instantiation' },
  { zh: '子模块', en: 'submodule' },
  { zh: '模块化', en: 'modular design' },
  { zh: '模块', en: 'module' },
  { zh: '输入端口', en: 'input port' },
  { zh: '输出端口', en: 'output port' },
  { zh: '双向端口', en: 'bidirectional port' },
  { zh: '端口', en: 'port' },
  { zh: '线网', en: 'net' },
  { zh: '连续赋值', en: 'continuous assignment' },
  { zh: '过程赋值', en: 'procedural assignment' },
  { zh: '非阻塞赋值', en: 'nonblocking assignment' },
  { zh: '阻塞赋值', en: 'blocking assignment' },
  { zh: '敏感列表', en: 'sensitivity list' },
  { zh: '组合过程', en: 'combinational process' },
  { zh: '时序过程', en: 'sequential process' },
  { zh: '位宽', en: 'bit width' },
  { zh: '位选', en: 'bit-select' },
  { zh: '部分选择', en: 'part-select' },
  { zh: '重复拼接', en: 'replication' },
  { zh: '拼接', en: 'concatenation' },
  { zh: '符号扩展', en: 'sign extension' },
  { zh: '零扩展', en: 'zero extension' },
  { zh: '截断', en: 'truncation' },
  { zh: '参数化', en: 'parameterization' },
  { zh: '逻辑运算', en: 'logical operation' },
  { zh: '按位运算', en: 'bitwise operation' },
  { zh: '归约运算', en: 'reduction operation' },
  { zh: '算术右移', en: 'arithmetic right shift' },
  { zh: '逻辑右移', en: 'logical right shift' },
  { zh: '三目运算符', en: 'conditional operator' },
  { zh: '运算符优先级', en: 'operator precedence' },
  { zh: '无符号数', en: 'unsigned number' },
  { zh: '有符号数', en: 'signed number' },
  { zh: '补码', en: "two’s complement" },
  { zh: '不定态', en: 'unknown state, X' },
  { zh: '高阻态', en: 'high-impedance state, Z' },
  { zh: '移位寄存器', en: 'shift register' },
  { zh: '寄存器堆', en: 'register file' },
  { zh: '寄存器', en: 'register' },
  { zh: '锁存器', en: 'latch' },
  { zh: 'D 触发器', en: 'D flip-flop' },
  { zh: 'D触发器', en: 'D flip-flop' },
  { zh: '触发器', en: 'flip-flop' },
  { zh: '上升沿', en: 'rising edge' },
  { zh: '下降沿', en: 'falling edge' },
  { zh: '时钟边沿', en: 'clock edge' },
  { zh: '时钟使能', en: 'clock enable' },
  { zh: '时钟域', en: 'clock domain' },
  { zh: '时钟', en: 'clock' },
  { zh: '同步复位', en: 'synchronous reset' },
  { zh: '异步复位', en: 'asynchronous reset' },
  { zh: '复位', en: 'reset' },
  { zh: '低电平有效', en: 'active-low' },
  { zh: '高电平有效', en: 'active-high' },
  { zh: '建立时间', en: 'setup time' },
  { zh: '保持时间', en: 'hold time' },
  { zh: '亚稳态', en: 'metastability' },
  { zh: '程序计数器', en: 'program counter, PC' },
  { zh: '计数器', en: 'counter' },
  { zh: '有限状态机', en: 'finite-state machine, FSM' },
  { zh: '状态转移', en: 'state transition' },
  { zh: '当前状态', en: 'current state' },
  { zh: '下一状态', en: 'next state' },
  { zh: '摩尔型', en: 'Moore machine' },
  { zh: '米利型', en: 'Mealy machine' },
  { zh: '独热编码', en: 'one-hot encoding' },
  { zh: '三态总线', en: 'tri-state bus' },
  { zh: '总线', en: 'bus' },
  { zh: '只读存储器', en: 'read-only memory, ROM' },
  { zh: '随机存取存储器', en: 'random-access memory, RAM' },
  { zh: '存储器', en: 'memory' },
  { zh: '操作码', en: 'opcode' },
  { zh: '流水线', en: 'pipeline' },
  { zh: '吞吐率', en: 'throughput' },
  { zh: '关键路径', en: 'critical path' },
];

// A trie makes the longest phrase at a position win without replacement-order
// effects. It also avoids annotating a short term inside a longer matched term.
const phraseTrie = new Map();
for (const term of terminology) {
  let branch = phraseTrie;
  for (const char of term.zh) {
    if (!branch.has(char)) branch.set(char, new Map());
    branch = branch.get(char);
  }
  branch.term = term;
}

function longestTermAt(text, start) {
  let branch = phraseTrie;
  let result;
  for (let i = start; i < text.length; i++) {
    branch = branch.get(text[i]);
    if (!branch) break;
    if (branch.term) {
      const candidate = branch.term;
      // In “与门级模型一致”, 与 means “with” and 门级 means gate-level.
      // Do not misread the conjunction as part of 与门 (AND gate). A gate
      // followed by 级联 still means cascaded gates and keeps its annotation.
      const conjunctionBeforeGateLevel = (candidate.zh === '与门' || candidate.zh === '或门')
        && text[i + 1] === '级' && text[i + 2] !== '联';
      // “把门与门连接起来” uses 与 as a conjunction between two gates;
      // likewise 门或门. The first 与门 in “与门与门” remains a gate name.
      // Include an already-annotated preceding gate to keep this idempotent.
      const conjunctionBetweenGates = (candidate.zh === '与门' || candidate.zh === '或门')
        && /门(?:[（(][^()（）\n]*[A-Za-z][^()（）\n]*[)）])?$/.test(text.slice(Math.max(0, start - 256), start));
      if (!conjunctionBeforeGateLevel && !conjunctionBetweenGates) result = candidate;
    }
  }
  return result;
}

function isEscaped(text, index) {
  let slashes = 0;
  while (index > 0 && text[--index] === '\\') slashes++;
  return slashes % 2 === 1;
}

// Preserve single/multiple backtick spans, including Markdown fenced code.
function codeSpanEnd(text, start) {
  let count = 1;
  while (text[start + count] === '`') count++;
  let cursor = start + count;
  while (cursor < text.length) {
    const next = text.indexOf('`', cursor);
    if (next < 0) return text.length;
    let run = 1;
    while (text[next + run] === '`') run++;
    if (run === count && !isEscaped(text, next)) return next + run;
    cursor = next + run;
  }
  return text.length;
}

// Keep an existing translation or acronym exactly as authored. Looking for a
// Latin letter also recognizes "MUX", "RTL" and alternative English wordings.
function existingEnglishEnd(text, start) {
  let cursor = start;
  while (/\s/.test(text[cursor] || '') && cursor < text.length) cursor++;
  const opening = text[cursor];
  if (opening !== '(' && opening !== '（') return start;
  const closing = opening === '(' ? ')' : '）';
  const end = text.indexOf(closing, cursor + 1);
  if (end < 0) return start;
  const content = text.slice(cursor + 1, end);
  if (/[()（）\n]/.test(content) || !/[A-Za-z]/.test(content)) return start;
  return end + 1;
}

/**
 * Append an English counterpart to the first prose occurrence of each concept.
 * Inline code and pre-existing English translations are preserved byte-for-byte.
 * Calling this again produces exactly the same result. No HTML is generated.
 */
export function withEnglishTerms(text) {
  if (text === null || text === undefined) return '';
  text = String(text);
  const seen = new Set();
  const output = [];
  let cursor = 0;
  while (cursor < text.length) {
    if (text[cursor] === '`' && !isEscaped(text, cursor)) {
      const end = codeSpanEnd(text, cursor);
      output.push(text.slice(cursor, end));
      cursor = end;
      continue;
    }
    const term = longestTermAt(text, cursor);
    if (!term) {
      output.push(text[cursor++]);
      continue;
    }
    const termEnd = cursor + term.zh.length;
    const englishEnd = existingEnglishEnd(text, termEnd);
    // Alias spellings (D触发器 / D 触发器) represent the same glossary concept.
    if (englishEnd > termEnd) {
      output.push(text.slice(cursor, englishEnd));
      seen.add(term.en);
      cursor = englishEnd;
      continue;
    }
    output.push(term.zh);
    if (!seen.has(term.en)) output.push(`（${term.en}）`);
    seen.add(term.en);
    cursor = termEnd;
  }
  return output.join('');
}
