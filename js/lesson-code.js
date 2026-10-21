import {esc} from './ui.js';
export function highlightedVerilog(code){
 const token=/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|\b(?:module|endmodule|input|output|inout|wire|reg|integer|parameter|localparam|assign|always|initial|begin|end|if|else|case|endcase|default|posedge|negedge|for|while|repeat|forever|generate|endgenerate|genvar|function|endfunction|task|endtask|casez|casex)\b|\b\d+(?:'[sS]?[bBoOdDhH][\da-fA-F_xXzZ?]+)?\b/g;
 let html='',last=0;for(const match of String(code).matchAll(token)){const value=match[0];html+=esc(code.slice(last,match.index));const type=value.startsWith('//')||value.startsWith('/*')?'comment':value.startsWith('"')?'string':/^\d/.test(value)?'number':'keyword';html+=`<span class="v-${type}">${esc(value)}</span>`;last=match.index+value.length;}return html+esc(code.slice(last));
}
export function numberedCode(code){
 const lines=String(code||'').split('\n');
 return `<div class="lesson-code-block"><div class="lesson-code-head"><span>VERILOG</span><span>只读示例 · Read the code</span></div><pre class="code-block numbered-code"><code>${lines.map((line,i)=>`<span class="code-line"><span class="code-line-number" aria-hidden="true">${i+1}</span><span>${highlightedVerilog(line)||' '}</span></span>`).join('')}</code></pre></div>`;
}
export function codeLineRange(source,fragment){const at=source.indexOf(fragment);if(at<0)return '';const start=source.slice(0,at).split('\n').length,end=start+fragment.split('\n').length-1;return start===end?`L${start}`:`L${start}–${end}`;}
