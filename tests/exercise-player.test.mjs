import test from 'node:test';
import assert from 'node:assert/strict';
import {checkAnswer} from '../js/exercise-player.js';
import {highlightedVerilog,numberedCode,codeLineRange} from '../js/lesson-code.js';
test('choice answer zero is valid, and unanswered/invalid choices cannot pass',()=>{
 const e={options:['A','B'],answer:0};assert.equal(checkAnswer(e,0),true);for(const v of [null,undefined,'0',-1,2])assert.equal(checkAnswer(e,v),false);
});
test('fill checking preserves Verilog case and operators, ignoring whitespace/final semicolon',()=>{
 const e={accepted:['endmodule','a & b']};assert.equal(checkAnswer(e,' endmodule; '),true);assert.equal(checkAnswer(e,'a&b'),true);for(const v of ['ENDMODULE','a&&b','',null])assert.equal(checkAnswer(e,v),false);
});
test('code viewer escapes source, adds line references and does not annotate HDL source',()=>{
 const code='module t;\n// <b>comment</b>\nassign y = a & b;\nendmodule';const html=numberedCode(code);assert.ok(html.includes('&lt;b&gt;'));assert.ok(!html.includes('<b>comment</b>'));assert.equal((html.match(/class="code-line"/g)||[]).length,4);assert.equal(codeLineRange(code,'assign y = a & b;'),'L3');assert.equal(codeLineRange(code,'missing'),'');assert.ok(highlightedVerilog('wire y;').includes('v-keyword'));
});

test('fill whitespace never joins identifiers or a multi-character Verilog operator',()=>{
 assert.equal(checkAnswer({accepted:['endmodule']},'end module'),false);
 assert.equal(checkAnswer({accepted:['<=']},'< ='),false);
 assert.equal(checkAnswer({accepted:['&&']},'& &'),false);
 assert.equal(checkAnswer({accepted:['a + b']},'a+b'),true);
 assert.equal(checkAnswer({accepted:['endmodule']},'endmodule /* okay */;'),true);
 assert.equal(checkAnswer({accepted:['endmodule']},'end/* split */module'),false);
 assert.equal(checkAnswer({accepted:['"a b"']},'"ab"'),false);
});
