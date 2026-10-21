import assert from 'node:assert/strict';
import test from 'node:test';
import { terminology, withEnglishTerms } from '../js/terminology.js';

test('course glossary has unique Chinese entries and precise assignment terms', () => {
  assert.ok(terminology.length >= 70 && terminology.length <= 120);
  assert.equal(new Set(terminology.map(term => term.zh)).size, terminology.length);
  assert.equal(terminology.find(term => term.zh === '非阻塞赋值').en, 'nonblocking assignment');
  assert.equal(terminology.find(term => term.zh === '阻塞赋值').en, 'blocking assignment');
  assert.equal(terminology.find(term => term.zh === '线网').en, 'net');
});

test('connects code-oriented Chinese explanations to course English terms', () => {
  assert.equal(
    withEnglishTerms('用连续赋值描述组合逻辑；由真值表检查多路选择器。'),
    '用连续赋值（continuous assignment）描述组合逻辑（combinational logic）；由真值表（truth table）检查多路选择器（multiplexer, MUX）。',
  );
  assert.equal(
    withEnglishTerms('非阻塞赋值更新寄存器，阻塞赋值用于本例的组合过程。'),
    '非阻塞赋值（nonblocking assignment）更新寄存器（register），阻塞赋值（blocking assignment）用于本例的组合过程（combinational process）。',
  );
});

test('longest phrase wins without nested or overlapping translations', () => {
  assert.equal(
    withEnglishTerms('同步复位和异步复位不同；复位恢复初始值。移位寄存器连接寄存器。'),
    '同步复位（synchronous reset）和异步复位（asynchronous reset）不同；复位（reset）恢复初始值。移位寄存器（shift register）连接寄存器（register）。',
  );
  assert.equal(withEnglishTerms('模块化使用子模块和模块例化。'), '模块化（modular design）使用子模块（submodule）和模块例化（module instantiation）。');
  assert.equal(withEnglishTerms('与非门、或非门、同或门、异或门。'), '与非门（NAND gate）、或非门（NOR gate）、同或门（XNOR gate）、异或门（XOR gate）。');
  assert.equal(withEnglishTerms('综合器和仿真器分别处理代码。'), '综合器（synthesizer）和仿真器（simulator）分别处理代码。');
  assert.equal(withEnglishTerms('这与门级模型一致；与门级联。'), '这与门级（gate-level）模型一致；与门（AND gate）级联。');
});

test('pre-existing translation and acronym preserve the whole phrase', () => {
  const text = '同步复位（synchronous reset）与异步复位 (asynchronous reset)；多路选择器（MUX）和多路选择器。';
  assert.equal(withEnglishTerms(text), text);
  assert.equal(withEnglishTerms('同步复位（Synchronous Reset）然后同步复位。'), '同步复位（Synchronous Reset）然后同步复位。');
  assert.equal(withEnglishTerms('复位（恢复初始值）'), '复位（reset）（恢复初始值）');
});

test('Chinese conjunctions between gate references are not gate names', () => {
  assert.equal(withEnglishTerms('1.4 结构描述：把门与门连接起来'), '1.4 结构描述：把门与门连接起来');
  assert.equal(withEnglishTerms('输入与输出'), '输入与输出');
  assert.equal(withEnglishTerms('门或门之间的连接'), '门或门之间的连接');
  assert.equal(withEnglishTerms('与门和或门'), '与门（AND gate）和或门（OR gate）');
  assert.equal(withEnglishTerms('或门与门连接起来'), '或门（OR gate）与门连接起来');
  assert.equal(withEnglishTerms('与门与门连接起来'), '与门（AND gate）与门连接起来');
  for (const text of ['把门与门连接起来', '与门与门连接起来', '或门与门连接起来']) {
    const once = withEnglishTerms(text);
    assert.equal(withEnglishTerms(once), once);
  }
});

test('only first prose occurrence is annotated, including alias spellings', () => {
  assert.equal(withEnglishTerms('时钟和时钟；D触发器与D 触发器。'), '时钟（clock）和时钟；D触发器（D flip-flop）与D 触发器。');
  assert.equal(withEnglishTerms('时钟（clock）和时钟。'), '时钟（clock）和时钟。');
});

test('single and multiple backtick code spans remain exact', () => {
  const text = '`assign 时钟 = 复位;` 使用时钟。``value = `寄存器`;`` 后接寄存器。';
  assert.equal(withEnglishTerms(text), '`assign 时钟 = 复位;` 使用时钟（clock）。``value = `寄存器`;`` 后接寄存器（register）。');
  const fenced = '```verilog\n// 时钟和寄存器\nreg q;\n```\n时钟驱动寄存器。';
  assert.equal(withEnglishTerms(fenced), '```verilog\n// 时钟和寄存器\nreg q;\n```\n时钟（clock）驱动寄存器（register）。');
  assert.equal(withEnglishTerms('`unclosed 时钟'), '`unclosed 时钟');
});

test('returns plain text and preserves escaping, punctuation and newlines', () => {
  const text = '<b>& " \\n \\t \\ \\`word\\`\n🙂 = <= && || &lt;';
  assert.equal(withEnglishTerms(text), text);
  assert.equal(withEnglishTerms('<em>复位</em> & `q <= d;`'), '<em>复位（reset）</em> & `q <= d;`');
  assert.equal(withEnglishTerms(null), '');
  assert.equal(withEnglishTerms(undefined), '');
  assert.equal(withEnglishTerms(12), '12');
});

test('annotation is idempotent for every glossary term and realistic mixtures', () => {
  const examples = [
    ...terminology.map(term => `${term.zh}；${term.zh}`),
    '同步复位（synchronous reset）要求时钟边沿；异步复位不等待边沿。',
    '非阻塞赋值用于时序过程，`reg` 不保证构成寄存器。',
    '模块化包含模块例化、子模块以及输入端口和输出端口。',
    '`寄存器` + 寄存器；D触发器和D 触发器。',
  ];
  for (const text of examples) {
    const once = withEnglishTerms(text);
    assert.equal(withEnglishTerms(once), once, text);
  }
});
