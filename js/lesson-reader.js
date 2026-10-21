import {esc,icon} from './ui.js';
import {withEnglishTerms} from './terminology.js';
import {numberedCode,codeLineRange} from './lesson-code.js';
import {mountExercise,exerciseType} from './exercise-player.js?v=question-pages-3';
import {lessonPageUrl} from './lesson-pagination.js';

const prose=text=>esc(withEnglishTerms(text??'')).replace(/`([^`]+)`/g,'<code class="inline-code">$1</code>');

// Render only the current question. Drafts and attempts use the same stable IDs as the bank.
export function mountLessonReader(root,lesson,pages,index,ctx){
 const page=pages[index],section=page.section,state=ctx.state();
 const sectionPages=pages.filter(p=>p.section.id===section.id);
 const previous=pages[index-1],next=pages[index+1];
 const url=p=>lessonPageUrl(lesson.id,p.id);
 const navLink=(p,label,kind)=>p
  ?`<a class="btn ${kind==='next'?'primary':''}" data-page-${kind} href="${esc(url(p))}">${label}</a>`
  :`<button class="btn" data-page-${kind} disabled>${label}</button>`;
 const pager=position=>`<nav class="question-pager ${position}" aria-label="${position==='top'?'页首':'页尾'}题目翻页">
  ${navLink(previous,'← 上一题 Previous','previous')}
  <label class="question-jump"><span>第 <b>${index+1}</b> / ${pages.length} 页 <small>· 一页一题</small></span><select data-page-jump aria-label="${position==='top'?'页首':'页尾'}跳转题目">${lesson.sections.map(s=>`<optgroup label="${esc(withEnglishTerms(s.title))}">${pages.filter(p=>p.section.id===s.id).map(p=>`<option value="${esc(p.id)}" ${p.id===page.id?'selected':''}>${pages.indexOf(p)+1}. ${esc(withEnglishTerms(p.exercise.title))}</option>`).join('')}</optgroup>`).join('')}</select></label>
  ${navLink(next,'下一题 Next →','next')}
 </nav>`;
 const walkthrough=(section.walkthrough||[]).map(step=>`<div class="walkthrough-step"><span class="line-ref">${esc(codeLineRange(section.code,step.code))}</span><div><code class="walkthrough-code">${esc(step.code)}</code><p>${prose(step.explanation)}</p></div></div>`).join('');
 root.innerHTML=`<div class="reader-grid guided-reader question-reader"><article>
  <header class="reader-head"><div class="eyebrow">LECTURE ${String(lesson.id).padStart(2,'0')} / ONE QUESTION AT A TIME</div><h1>${prose(lesson.title)}</h1><p class="guided-intro">读这页的 Verilog，理解关键行，再完成一道题。随时翻页，草稿自动保存。</p><div class="btn-row"><span class="tag green">${pages.length} 页 · ${lesson.sections.length} 个知识点</span><span class="tag" data-lesson-answered></span><button class="source-btn" data-source="${esc(lesson.sourceFile)}" data-pages="1">${esc(lesson.sourceFile)} ↗</button></div></header>
  ${pager('top')}
  <section class="reader-section code-centered question-page" id="section-${esc(section.id)}" data-question-page="${esc(page.id)}">
   <div class="section-meta"><span class="eyebrow">UNIT ${String(page.sectionIndex+1).padStart(2,'0')} / QUESTION ${page.questionIndex+1} OF ${sectionPages.length}</span><button class="source-btn" data-source="${esc(lesson.sourceFile)}" data-pages="${esc(section.pages)}">课件 p.${esc(section.pages)} ↗</button><button class="icon-btn ${state.bookmarks.includes(section.id)?'mark-done':''}" data-bookmark="${esc(section.id)}" aria-label="${state.bookmarks.includes(section.id)?'取消收藏':'收藏本节'}">${icon('bookmark')}</button></div>
   <h2>${prose(section.title)}</h2>
   ${numberedCode(section.code||'// 本节代码待更新')}
   <p class="code-brief">${prose(section.brief||section.body?.[0])}</p>
   ${walkthrough?`<div class="code-walkthrough">${walkthrough}</div>`:''}
   ${section.hardware?`<div class="hardware-note compact-hardware"><b>构造了什么 · Hardware</b>${prose(section.hardware)}</div>`:''}
   ${section.pitfalls?.length?`<p class="code-caution"><b>注意 · Watch out</b> ${prose(section.pitfalls[0])}</p>`:''}
   <div class="inline-practice-heading"><span class="eyebrow">${page.kind==='check'?'READ & PREDICT / 代码理解':'YOUR TURN / 动手练习'}</span><span>第 ${index+1} 题 · ${prose(exerciseType(page.exercise.type))}</span></div>
   <div data-current-exercise></div>
   ${section.experiment?`<details class="code-experiment question-extension"><summary>代码延伸 · Try this</summary><p>${prose(section.experiment.action)}</p><p><b>预期变化 · Expected behavior</b><br>${prose(section.experiment.expected)}</p></details>`:''}
   <div class="section-actions"><button class="btn small ${state.read.includes(section.id)?'mark-done':''}" data-read="${esc(section.id)}">${icon('check')}${state.read.includes(section.id)?'已读懂本节':'标记已读'}</button><a class="btn text" href="#practice?lecture=${lesson.id}&section=${encodeURIComponent(section.id)}">复习本知识点 Review ${icon('arrow')}</a></div>
  </section>
  ${pager('bottom')}
  ${!next?`<div class="lecture-finish"><div><span class="eyebrow">END OF LECTURE</span><h3>已到本讲最后一题</h3><p><span data-lesson-answered></span>。可回看题目、继续订正，或进入下一讲。</p></div><div class="btn-row"><a class="btn" href="#practice?lecture=${lesson.id}">复习本讲</a>${ctx.nextLesson?`<a class="btn primary" href="#lesson/${ctx.nextLesson.id}">下一讲 Next lecture ${icon('arrow')}</a>`:`<a class="btn primary" href="#courses">返回课程目录 ${icon('arrow')}</a>`}</div></div>`:''}
  <details class="panel mobile-lesson-note"><summary>本讲学习笔记 · Notes</summary><textarea class="note-field" data-lesson-note aria-label="手机端本讲学习笔记" placeholder="记下仍没想明白的一行代码…">${esc(state.notes[lesson.id]||'')}</textarea><p class="tip">自动保存 · Autosaved</p></details>
 </article><aside class="reader-aside"><div class="panel toc question-toc"><div class="question-toc-head"><h3>本讲题目 · Questions</h3><span>实心圆表示已通过</span></div><div class="question-toc-list">${lesson.sections.map((s,i)=>`<div class="toc-unit ${s.id===section.id?'current-unit':''}"><a class="toc-unit-heading ${state.read.includes(s.id)?'done':''}" data-section="${esc(s.id)}" href="#lesson/${lesson.id}/${esc(s.id)}">${String(i+1).padStart(2,'0')} ${prose(s.title)}</a><div class="question-dots">${pages.filter(p=>p.section.id===s.id).map(p=>`<a class="question-nav-link ${p.id===page.id?'current':''}" data-question-id="${esc(p.id)}" href="${esc(url(p))}" ${p.id===page.id?'aria-current="page"':''} title="${esc(withEnglishTerms(p.exercise.title))}" aria-label="第 ${pages.indexOf(p)+1} 题：${esc(withEnglishTerms(p.exercise.title))}">${pages.indexOf(p)+1}</a>`).join('')}</div></div>`).join('')}</div><div class="progress-track" id="reader-progress"><i style="width:${100*lesson.sections.filter(s=>state.read.includes(s.id)).length/lesson.sections.length}%"></i></div><p class="read-time" id="reader-progress-count">${lesson.sections.filter(s=>state.read.includes(s.id)).length} / ${lesson.sections.length} 小节已读</p></div><div class="panel lesson-notes"><details><summary>学习笔记 · Notes</summary><textarea class="note-field" data-lesson-note aria-label="本讲学习笔记" placeholder="记下代码里仍没想明白的一行…">${esc(state.notes[lesson.id]||'')}</textarea><p class="tip">自动保存 · Autosaved</p></details></div><div class="panel source-panel"><button class="btn small" data-connect-pdf>${icon('book')}连接本地 PDF</button><p class="tip" style="margin:9px 0 0">每页均可对照原课件。</p></div></aside></div>`;

 function updateAnswers(){
  const attempts=ctx.state().attempts,passed=pages.filter(p=>attempts[p.id]?.lastPass).length;
  root.querySelectorAll('[data-lesson-answered]').forEach(el=>el.textContent=`${passed} / ${pages.length} 题已通过`);
  root.querySelectorAll('[data-question-id]').forEach(el=>{const attempt=attempts[el.dataset.questionId];el.classList.toggle('passed',!!attempt?.lastPass);el.classList.toggle('needs-work',!!attempt&&!attempt.lastPass);});
 }
 mountExercise(root.querySelector('[data-current-exercise]'),page.exercise,{...ctx,record(id,pass){ctx.record(id,pass);updateAnswers();}},{nextUrl:next?url(next):'',continueLabel:'下一题 Next'});
 root.querySelectorAll('[data-page-jump]').forEach(select=>select.onchange=()=>{location.hash=url(pages.find(p=>p.id===select.value));});
 root.querySelectorAll('[data-lesson-note]').forEach(field=>field.oninput=()=>{ctx.state().notes[lesson.id]=field.value;root.querySelectorAll('[data-lesson-note]').forEach(other=>{if(other!==field)other.value=field.value;});ctx.save();});
 root.querySelector('[data-connect-pdf]').onclick=ctx.connectPDF;
 updateAnswers();
}
