import assert from 'node:assert/strict';
import test from 'node:test';
import { simulate, evaluateCircuit } from '../js/simulator.js';

const grade = (code, inputs, outputs, vectors) => simulate(code, { inputs, outputs, vectors });
const port = (name, width = 1) => ({ name, width });
const vector = (inputs, expected) => ({ inputs, expected });
const checkError = (code, pattern, inputs = {}, ports = {}) => {
  const result = evaluateCircuit(code, inputs, ports);
  assert.equal(result.ok, false);
  assert.ok(result.diagnostics.some(d => d.severity === 'error' && pattern.test(d.message)), JSON.stringify(result.diagnostics));
  assert.ok(result.diagnostics.every(d => Number.isInteger(d.line) && d.line > 0));
  return result;
};

test('exhaustive AND truth table passes, a submitted XOR fails real counterexamples', () => {
  const vectors = [0, 1].flatMap(a => [0, 1].map(b => vector({ a, b }, { y: a & b })));
  const code = 'module gate(input a,b,output y); assign y=a & b; endmodule';
  const result = grade(code, [port('a'), port('b')], [port('y')], vectors);
  assert.equal(result.ok, true); assert.equal(result.passed, 4);
  const wrong = grade(code.replace('a & b', 'a ^ b'), [port('a'), port('b')], [port('y')], vectors);
  assert.equal(wrong.ok, false); assert.equal(wrong.passed, 1);
  assert.equal(wrong.results[1].actual.y, 1);
  assert.ok(wrong.netlist.nodes.some(n => n.label === '^'));
  assert.ok(!wrong.netlist.nodes.some(n => n.label === '&'));
});

test('non-ANSI ports, inherited vector widths, and intermediate wires', () => {
  const code = `module mux(a,b,s,y);
    input [3:0] a,b; input s; output [3:0] y;
    wire [3:0] inverted, selected;
    assign inverted = ~a;
    assign selected = s ? b : inverted;
    assign y = selected;
  endmodule`;
  const result = grade(code, [port('a', 4), port('b', 4), port('s')], [port('y', 4)], [vector({ a: 10, b: 6, s: 0 }, { y: 5 }), vector({ a: 10, b: 6, s: 1 }, { y: 6 })]);
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.ok(result.netlist.nodes.some(n => n.kind === 'mux'));
  assert.ok(result.netlist.edges.some(e => e.to === 'signal:inverted'));
});

test('five-bit assignment context preserves a four-bit adder carry', () => {
  const code = `module adder(input [3:0] a,b,input cin,output [3:0] sum,output cout);
  assign {cout,sum} = a + b + cin;
  endmodule`;
  const vectors = [];
  for (let a = 0; a < 16; a++) for (let b = 0; b < 16; b++) for (let cin = 0; cin < 2; cin++) vectors.push(vector({ a, b, cin }, { sum: (a + b + cin) & 15, cout: (a + b + cin) >> 4 }));
  const result = grade(code, [port('a', 4), port('b', 4), port('cin')], [port('sum', 4), port('cout')], vectors);
  assert.equal(result.ok, true, JSON.stringify(result.diagnostics)); assert.equal(result.passed, 512);
});

test('intermediate wire truncation happens before later wider assignments', () => {
  const code = `module adder(input [3:0] a,b,output [4:0] y);
  wire [3:0] sum; assign sum=a+b; assign y=sum; endmodule`;
  const result = evaluateCircuit(code, { a: 15, b: 1 });
  assert.equal(result.ok, true); assert.equal(result.actual.y, 0);
});

test('unsigned comparisons, logical operators, precedence and nested ternary', () => {
  const code = `module compare(input [3:0] a,b,output [5:0] y);
  assign y = {(a==b),(a!=b),(a<b),(a>b),(a<=b),(a>=b)}; endmodule`;
  assert.deepEqual(evaluateCircuit(code, { a: 3, b: 7 }).actual, { y: 26 });
  assert.deepEqual(evaluateCircuit(code, { a: 3, b: 3 }).actual, { y: 35 });
  assert.deepEqual(evaluateCircuit('module m(input [3:0] a,b,output y); assign y= !a || b && a; endmodule', { a: 0, b: 0 }).actual, { y: 1 });
  assert.deepEqual(evaluateCircuit('module m(input a,b,output [1:0] y); assign y= a ? b ? 2\'d3 : 2\'d2 : 2\'d1; endmodule', { a: 1, b: 0 }).actual, { y: 2 });
  assert.deepEqual(evaluateCircuit("module m(input [1:0] a,output y);assign y=a==2'd0?1'b1:1'b0;endmodule", { a: 0 }).actual, { y: 1 });
  assert.deepEqual(evaluateCircuit('module m(input [3:0] a,b,output [3:0] y); assign y= a | b & 4\'b0011 ^ 4\'b1000; endmodule', { a: 1, b: 7 }).actual, { y: 11 });
});

test('shifts, hex/binary/decimal literals, part selects and concatenation', () => {
  const code = `module shift(input [7:0] a,input [2:0] n,output [7:0] y);
  assign y = {a[3:0],4'b0000} ^ ((8'hA5 >> n) & 8'd255); endmodule`;
  assert.deepEqual(evaluateCircuit(code, { a: 0xab, n: 2 }).actual, { y: 0xb0 ^ (0xa5 >> 2) });
  assert.deepEqual(evaluateCircuit('module m(input [3:0] a,output [3:0] y);assign y=a << 32\'d255;endmodule', { a: 15 }).actual, { y: 0 });
  assert.deepEqual(evaluateCircuit('module m(input [3:0] a,output [3:0] y);assign y=a << 32\'d100000;endmodule', { a: 15 }).actual, { y: 0 });
  assert.deepEqual(evaluateCircuit('module m(input [3:0] a,output [3:0] y);assign y=a << (4\'d15+4\'d1);endmodule', { a: 15 }).actual, { y: 15 });
  assert.deepEqual(evaluateCircuit('module m(input [3:0] a,input [1:0] n,output y);assign y=a[n];endmodule', { a: 10, n: 3 }).actual, { y: 1 });
});

test('ascending and nonzero-based declarations preserve declared bit numbering', () => {
  assert.deepEqual(evaluateCircuit('module m(input [0:3] a,output [1:0] y);assign y=a[0:1];endmodule', { a: 10 }).actual, { y: 2 });
  assert.deepEqual(evaluateCircuit('module m(input [7:4] a,output y);assign y=a[4];endmodule', { a: 1 }).actual, { y: 1 });
  checkError('module m(input [0:3] a,output [1:0] y);assign y=a[2:1];endmodule', /切片方向/);
});

test('independent partial assignments and wire declaration assignment work', () => {
  const code = 'module m(input a,b,output [1:0] y); wire k=a^b; assign y[0]=k; assign y[1]=~k; endmodule';
  assert.deepEqual(evaluateCircuit(code, { a: 1, b: 0 }).actual, { y: 1 });
  assert.deepEqual(evaluateCircuit('module m(input a,output [1:0] y);assign y[0]=a;assign y[1]=y[0];endmodule', { a: 1 }).actual, { y: 3 });
  assert.deepEqual(evaluateCircuit('module m(input a,output y);wire [3:0] x;assign x[0]=a;assign y=x[0];endmodule', { a: 1 }).actual, { y: 1 });
});

test('bit-level dependencies distinguish feed-forward bus wiring from feedback', () => {
  for (const a of [0, 1]) {
    assert.deepEqual(evaluateCircuit('module m(input a,output [1:0] y);assign y={y[0],a};endmodule', { a }).actual, { y: a * 3 });
    assert.deepEqual(evaluateCircuit("module m(input a,output [3:0] y);assign y=(y << 1) | {3'b0,a};endmodule", { a }).actual, { y: a * 15 });
    assert.deepEqual(evaluateCircuit("module m(input a,output [3:0] y);assign y=(y << 1) + a;endmodule", { a }).actual, { y: a * 15 });
    assert.deepEqual(evaluateCircuit('module m(input a,output [3:0] y);assign y={a,y[3:1]};endmodule', { a }).actual, { y: a * 15 });
  }
  checkError('module m(input a,output [1:0] y);assign y={a,y[0]};endmodule', /反馈环/);
  checkError('module m(input a,output [3:0] y);assign y=~y;endmodule', /反馈环/);
  checkError("module m(input a,output [3:0] y);assign y=y << (4'd15+4'd1);endmodule", /反馈环/);
});

test('multiplication, subtraction and unary negation truncate at the declared width', () => {
  assert.deepEqual(evaluateCircuit('module m(input [3:0] a,b,output [7:0] y);assign y=a*b;endmodule', { a: 15, b: 15 }).actual, { y: 225 });
  assert.deepEqual(evaluateCircuit('module m(input [3:0] a,b,output [3:0] y);assign y=a-b;endmodule', { a: 0, b: 1 }).actual, { y: 15 });
  assert.deepEqual(evaluateCircuit('module m(input [3:0] a,output [3:0] y);assign y=-a;endmodule', { a: 1 }).actual, { y: 15 });
});

test('large 64-bit values use exact BigInt math and decimal-string transport', () => {
  const code = "module m(input [63:0] a,output [63:0] y); assign y=a+64'd1; endmodule";
  assert.deepEqual(evaluateCircuit(code, { a: '9007199254740992' }).actual, { y: '9007199254740993' });
});

test('reduction AND/OR/XOR and complemented reductions are one-bit values', () => {
  const code = 'module m(input [3:0] a,output [5:0] y);assign y={&a,|a,^a,~&a,~|a,~^a};endmodule';
  for (let a = 0; a < 16; a++) {
    const and = a === 15 ? 1 : 0, or = a !== 0 ? 1 : 0, parity = [...a.toString(2)].filter(bit => bit === '1').length % 2;
    const expected = (and << 5) | (or << 4) | (parity << 3) | ((1 - and) << 2) | ((1 - or) << 1) | (1 - parity);
    assert.deepEqual(evaluateCircuit(code, { a }).actual, { y: expected });
  }
  assert.deepEqual(evaluateCircuit('module m(input [3:0] a,b,output [3:0] y);assign y=a~^b;endmodule', { a: 10, b: 12 }).actual, { y: 9 });
  // Assignment context cannot widen a reduction operand before reducing it.
  assert.deepEqual(evaluateCircuit('module m(input [3:0] a,output [7:0] y);assign y=&a;endmodule', { a: 15 }).actual, { y: 1 });
});

test('undefined identifiers, multiple drivers, feedback and undriven signals are errors', () => {
  checkError('module m(input a,output y);assign y=a & typo;endmodule', /typo.*未声明/);
  checkError('module m(input a,output y);assign y=a;assign y=~a;endmodule', /多个驱动/);
  checkError('module m(input a,output y);wire x;assign x=y;assign y=x^a;endmodule', /反馈环/);
  checkError('module m(input a,output y);wire x;assign y=x;endmodule', /没有完整驱动/);
  checkError('module m(input a,output y);endmodule', /没有完整驱动/);
  checkError('module m(input a,output y);assign a=1;assign y=a;endmodule', /输入.*不能/);
});

test('syntax errors point at the relevant source line', () => {
  const result = checkError('module m(input a,output y);\nassign y = a & ;\nendmodule', /缺少表达式/);
  assert.equal(result.diagnostics[0].line, 2);
  checkError('module m(input a,output y);assign y=a endmodule', /分号/);
  checkError('module m(input a,output y);assign y=a;', /endmodule/);
  checkError('module m(input a,output y);assign y=a;endmodule module n();endmodule', /只支持一个/);
  checkError('module m(input a,output y);assign y=a；endmodule', /无法识别/);
  checkError('module m(input a,output y);assign y=a; /* unclosed', /注释/);
});

test('unsupported HDL features fail explicitly rather than pretending to simulate', () => {
  checkError('module m(input a,output y);always @(*) y=a;endmodule', /always/);
  checkError("module m(input a,output y);assign y=1'bx;endmodule", /X、Z/);
  checkError("module m(input a,output y);assign y=1'b2;endmodule", /无效数字/);
  checkError("module m(input a,output y);assign y=4'sd2;endmodule", /signed/);
  checkError('module m(input signed [3:0] a,output y);assign y=a[0];endmodule', /signed/);
  checkError('module m(input a,output [3:0] y);assign y={4{a}};endmodule', /重复连接/);
  checkError('module m(input a,output y);assign y=a === a;endmodule', /运算符/);
});

test('out-of-range bit selections are errors, even in unused ternary branches', () => {
  checkError('module m(input [3:0] a,input s,output y);assign y=s?a[7]:a[0];endmodule', /超出/);
  checkError('module m(input [3:0] a,input s,output y);assign y=s?a[3+4]:a[0];endmodule', /超出/);
  checkError('module m(input [3:0] a,input [3:0] n,output y);assign y=a[n];endmodule', /超出/, { a: 0, n: 7 });
});

test('test configuration and vectors are validated instead of silently coerced', () => {
  const code = 'module m(input [3:0] a,output [3:0] y);assign y=a;endmodule';
  assert.equal(simulate(code, { vectors: [] }).ok, false);
  const absent = grade(code, [port('a', 4)], [port('y', 4)], [vector({}, { y: 0 })]);
  assert.match(absent.diagnostics[0].message, /缺少输入 a/); assert.equal(absent.results[0].pass, false);
  assert.match(grade(code, [port('a', 4)], [port('y', 4)], [vector({ a: 16 }, { y: 0 })]).diagnostics[0].message, /超出 4 位/);
  assert.match(grade(code, [port('a', 4)], [port('y', 4)], [vector({ a: 0 }, {})]).diagnostics[0].message, /缺少输出/);
  assert.match(grade(code, [port('a', 8)], [port('y', 4)], [vector({ a: 0 }, { y: 0 })]).diagnostics[0].message, /应为 8 位/);
  assert.match(grade(code, [port('a', 4)], [port('y', 4)], [vector({ a: 0, typo: 1 }, { y: 0 })]).diagnostics[0].message, /不是模块输入/);
  assert.equal(grade(code, [port('a', 4)], [port('y', 4)], [vector({ a: '0xf' }, { y: 15 })]).ok, true);
});

test('comments, whitespace and variable renaming do not affect judging', () => {
  const code = `/* 中文注释 */ module renamed( input wire [3:0] lhs, rhs, output wire [3:0] answer );
    // this is actual submitted logic
    assign answer = lhs ^ rhs;
  endmodule`;
  assert.deepEqual(evaluateCircuit(code, { lhs: 12, rhs: 10 }).actual, { answer: 6 });
});

test('every netlist edge points to an existing node and preserves submitted operator topology', () => {
  const result = evaluateCircuit('module m(input a,b,c,output y);wire x;assign x=a&b;assign y=x|c;endmodule', { a: 1, b: 1, c: 0 });
  const ids = new Set(result.netlist.nodes.map(n => n.id));
  assert.equal(ids.size, result.netlist.nodes.length);
  assert.ok(result.netlist.edges.every(e => ids.has(e.from) && ids.has(e.to)));
  const and = result.netlist.nodes.find(n => n.label === '&');
  const or = result.netlist.nodes.find(n => n.label === '|');
  assert.ok(result.netlist.edges.some(e => e.from === and.id && e.to === 'signal:x'));
  assert.ok(result.netlist.edges.some(e => e.from === 'signal:x' && e.to === or.id));
});

test('resource bounds and malformed input are controlled diagnostics', () => {
  checkError('module m(input [256:0] a,output y);assign y=a[0];endmodule', /位宽/);
  checkError('x'.repeat(40001), /字符/);
  assert.equal(simulate(null, { vectors: [vector({}, {})] }).ok, false);
  assert.equal(simulate('module m();endmodule', null).ok, false);
});
