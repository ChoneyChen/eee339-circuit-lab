import {esc,icon,codeBlock,renderNetlist,waveform} from './ui.js';
import {withEnglishTerms} from './terminology.js';
import {simulate} from './simulator.js';
const prose=text=>esc(withEnglishTerms(text??'')).replace(/`([^`]+)`/g,'<code class="inline-code">$1</code>');
export const exerciseType=type=>({choice:'知识判断 · Check',fill:'代码填空 · Fill in',code:'写代码 · Build',debug:'改错 · Debug'}[type]||'练习 · Practice');
function fillTokens(value){
 const source=String(value??'');
 const token=/\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|\d[\d_]*\s*'[sS]?[bBoOdDhH]\s*[\da-fA-F_xXzZ?]+|[\p{L}_$][\p{L}\p{N}_$]*|\d[\d_]*|===|!==|<<<|>>>|<=|>=|==|!=|&&|\|\||<<|>>|\+\+|--|\*\*|~\^|\^~|~&|~\||[^\s]/gu;
 const tokens=[];
 for(const match of source.matchAll(token)){
  const text=match[0];if(/^\s+$/.test(text)||text.startsWith('//')||text.startsWith('/*'))continue;
  tokens.push(/^\d[\d_]*\s*'/.test(text)?text.replace(/\s+/g,''):text);
 }
 if(tokens.at(-1)===';')tokens.pop();
 return tokens;
}
export function checkAnswer(exercise,answer){
 if(exercise.options?.length)return Number.isInteger(answer)&&answer>=0&&answer<exercise.options.length&&answer===exercise.answer;
 const tokens=fillTokens(answer);if(!tokens.length)return false;
 const normalized=JSON.stringify(tokens);
 return (exercise.accepted||[exercise.solution]).filter(x=>typeof x==='string'&&x.trim()).some(x=>JSON.stringify(fillTokens(x))===normalized);
}
const signals=values=>Object.entries(values||{}).map(([k,v])=>`${k}=${v}`).join(', ')||'—';
export function mountExercise(root,e,ctx,{standalone=false,nextUrl='',continueLabel=''}={}){
 const hasCode=e.engine==='comb',hasOptions=!!e.options?.length;
 let choice=null,hint=0;
 const saved=ctx.state().drafts[e.id];
 if(hasOptions&&/^choice:\d+$/.test(saved||'')){const n=Number(saved.slice(7));if(n<e.options.length)choice=n;}
 root.className=`guided-exercise ${standalone?'full-exercise':''}`;
 root.dataset.exerciseId=e.id;
 root.innerHTML=`<div class="guided-exercise-head"><div><span class="tag green">${esc(exerciseType(e.type))}</span>${standalone?'':`<h4>${prose(e.title)}</h4>`}</div><span class="attempt-tag tag ${ctx.state().attempts[e.id]?.lastPass?'green':'neutral'}">${ctx.state().attempts[e.id]?.lastPass?'✓ 已通过':ctx.state().attempts[e.id]?'待订正':'动手练习'}</span></div><p class="guided-prompt">${prose(e.prompt)}</p><div class="exercise-workspace"><div class="exercise-answer-area">${hasCode?`<div class="editor-shell"><div class="editor-head"><span>${esc(e.id)}.v</span><span>Verilog · 草稿自动保存</span></div><div class="editor-body"><div class="line-numbers" data-part="lines" aria-hidden="true"></div><textarea class="code-editor" data-part="code" aria-label="${esc(e.title)} Verilog代码" autocapitalize="off" autocomplete="off" spellcheck="false">${esc(saved??e.starter??'')}</textarea></div><div class="editor-foot"><span>⌘ / Ctrl + Enter</span><button class="btn primary" data-action="submit">${icon('play')}运行测试 Run</button></div></div>`:hasOptions?`<div class="exercise-options">${e.options.map((o,i)=>`<button class="choice-option ${choice===i?'selected':''}" data-option="${i}" aria-pressed="${choice===i}"><i>${String.fromCharCode(65+i)}</i><span>${prose(o)}</span></button>`).join('')}</div><button class="btn primary" data-action="submit">检查答案 Check ${icon('arrow')}</button>`:`${e.starter?codeBlock(e.starter):''}<label class="fill-label">只填写空缺 ___ 的内容<input class="text-answer" data-part="fill" aria-label="${esc(e.title)} 填空答案" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(saved??'')}" placeholder="输入关键字、运算符或代码片段…"></label><button class="btn primary" data-action="submit">检查答案 Check ${icon('arrow')}</button>`}<div class="exercise-tools"><button class="btn text small" data-action="hint">提示 Hint</button>${hasCode?`<button class="btn text small" data-action="reset">重置 Reset</button><button class="btn text small" data-action="download">下载 .v</button>`:''}<span class="exercise-status" role="status"></span></div><div data-part="hints"></div><details class="solution-panel"><summary>参考解答与解析 · Solution</summary>${e.solution?codeBlock(e.solution):`<p>${prose(hasOptions?e.options[e.answer]:(e.accepted||[])[0]||'见解析')}</p>`}<p>${prose(e.explanation)}</p></details></div><div class="exercise-feedback" data-part="feedback" ${standalone?'':'hidden'} aria-live="polite">${standalone?'<div class="empty">运行后，直接在这里查看结果与反例。</div>':''}</div></div><a class="btn text practice-continue" data-part="continue" href="${esc(nextUrl)}" hidden>${esc(continueLabel||(standalone?'回到本节代码 Return':'下一题 Next'))} ${icon('arrow')}</a>`;
 const $=selector=>root.querySelector(selector),code=$('[data-part="code"]'),fill=$('[data-part="fill"]');
 function saveDraft(value){ctx.state().drafts[e.id]=value;ctx.save();}
 function record(pass){ctx.record(e.id,pass);const tag=$('.attempt-tag');tag.className=`attempt-tag tag ${pass?'green':'amber'}`;tag.textContent=pass?'✓ 已通过':'待订正';$('.exercise-status').textContent=pass?'✓ 正确 · Passed':'再检查一下 · Try again';const next=$('[data-part="continue"]');next.hidden=!pass||!nextUrl;}
 function submit(){
  if(!hasCode&&hasOptions&&choice===null){ctx.toast('请先选择一个答案。');return;}
  if(!hasCode&&!hasOptions&&!fill.value.trim()){ctx.toast('请先填写答案。');fill.focus();return;}
  const feedback=$('[data-part="feedback"]');feedback.hidden=false;root.classList.add('has-feedback');
  if(hasCode){
   saveDraft(code.value);
   const r=simulate(code.value,{inputs:e.inputs,outputs:e.outputs,vectors:e.vectors});
   record(r.ok);const bad=r.results?.find(row=>!row.pass);
   feedback.innerHTML=`<div class="result-summary ${r.ok?'':'fail'}"><b>${r.ok?'✓ 测试通过 · Passed':'需要修改 · Try again'}</b><span>${r.passed} / ${r.total}</span></div>${(r.diagnostics||[]).map(d=>`<div class="diag">${d.line?`Line ${d.line} · `:''}${prose(d.message)}</div>`).join('')}${bad?`<div class="answer-explanation error"><b>反例 Counterexample</b><br>输入 Input：${esc(signals(bad.inputs))}<br>期望 Expected：${esc(signals(bad.expected))}<br>实际 Actual：${esc(signals(bad.actual))}</div>`:''}${r.ok?`<div class="answer-explanation">${prose(e.explanation)}</div>`:''}${r.netlist?.nodes?.length?`<details class="exercise-circuit" open><summary>这段代码的电路 · Expression graph</summary>${renderNetlist(r.netlist)}</details>`:''}${r.results?.length?`<details class="exercise-tests"><summary>查看测试向量与波形 · Test vectors</summary><div class="table-wrap"><table><thead><tr><th>输入 Input</th><th>期望 Expected</th><th>实际 Actual</th><th>结果</th></tr></thead><tbody>${r.results.slice(0,60).map(row=>`<tr class="${row.pass?'pass':'fail'}"><td>${esc(signals(row.inputs))}</td><td>${esc(signals(row.expected))}</td><td>${esc(signals(row.actual))}</td><td>${row.pass?'✓':'✕'}</td></tr>`).join('')}</tbody></table></div>${r.results.length>60?`<p class="tip">显示前 60 项，已执行全部 ${r.total} 项。</p>`:''}${waveform(r.results.slice(0,14).map(row=>({...row.inputs,...row.actual})),[...e.inputs.map(p=>p.name),...e.outputs.map(p=>p.name)])}</details>`:''}`;
  }else{
   if(fill)saveDraft(fill.value);
   const pass=checkAnswer(e,hasOptions?choice:fill.value);record(pass);
   feedback.innerHTML=`<div class="result-summary ${pass?'':'fail'}"><b>${pass?'✓ 回答正确 · Correct':'再想一步 · Try again'}</b></div><div class="answer-explanation ${pass?'':'error'}">${prose(e.explanation)}</div>${pass?'':'<p class="tip">已加入错题本。订正后会自动移出。</p>'}`;
  }
 }
 $('[data-action="submit"]').onclick=submit;
 root.querySelectorAll('[data-option]').forEach(button=>button.onclick=()=>{choice=Number(button.dataset.option);saveDraft(`choice:${choice}`);root.querySelectorAll('[data-option]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});});
 $('[data-action="hint"]').onclick=()=>{if(hint<(e.hints||[]).length)$('[data-part="hints"]').insertAdjacentHTML('beforeend',`<div class="hint-box">Hint ${hint+1} · ${prose(e.hints[hint++])}</div>`);else ctx.toast('已显示全部提示，可回看上方代码讲解。');};
 if(code){
  const lines=()=>{$('[data-part="lines"]').textContent=Array.from({length:code.value.split('\n').length},(_,i)=>i+1).join('\n');};lines();
  code.oninput=()=>{saveDraft(code.value);lines();};code.onscroll=()=>{$('[data-part="lines"]').scrollTop=code.scrollTop;};
  code.onkeydown=event=>{if(event.key==='Tab'){event.preventDefault();code.setRangeText('  ',code.selectionStart,code.selectionEnd,'end');code.dispatchEvent(new Event('input'));}if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();submit();}};
  $('[data-action="reset"]').onclick=()=>{code.value=e.starter||'';code.dispatchEvent(new Event('input'));};
  $('[data-action="download"]').onclick=()=>ctx.download(code.value,`${e.id}.v`,'text/plain');
 }else if(fill){fill.oninput=()=>saveDraft(fill.value);fill.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();submit();}};}
 return {submit};
}
