import assert from 'node:assert/strict';
import {earlyLessons} from '../js/lessons-early.js';
import {lateLessons} from '../js/lessons-late.js';
import {customLessons} from '../js/lessons-custom.js';
import {simulate} from '../js/simulator.js';
const lessons=[...new Map([...earlyLessons,...lateLessons,...customLessons].map(l=>[l.id,l])).values()].sort((a,b)=>a.id-b.id),ids=new Set(),sectionIds=new Set(),exerciseIds=new Set(),errors=[];
let sectionCount=0,exerciseCount=0,codeCount=0,vectorCount=0,checkCount=0,chars=0;
assert.ok(Array.from({length:15},(_,i)=>i+1).every(id=>lessons.some(l=>l.id===id)),'Initial lecture slots 1–15 must be preserved');
function check(condition,msg){if(!condition)errors.push(msg);}
for(const l of lessons){
 check(!ids.has(l.id),`duplicate lesson ${l.id}`);ids.add(l.id);
 check(l.title&&l.summary,`L${l.id} missing title/summary`);
 if(!l.available){check(l.id===10,`unexpected unavailable L${l.id}`);continue;}
 check(l.sourceFile&&l.sourcePages>0,`L${l.id} missing provenance`);
 check(l.sections.length>=6,`L${l.id} needs >=6 detailed sections`);
 check(l.exercises.length>=6,`L${l.id} needs >=6 exercises`);
 for(const s of l.sections){sectionCount++;chars+=s.body.join('').length;
  check(!sectionIds.has(s.id),`duplicate section ${s.id}`);sectionIds.add(s.id);
  check(typeof s.pages==='string'&&/\d/.test(s.pages),`${s.id} missing source page range`);
  check(s.body.length>=3&&s.body.join('').length>=180,`${s.id} insufficient reading detail`);
  check(s.pitfalls?.length>0,`${s.id} missing pitfalls`);
  check(s.check&&Number.isInteger(s.check.answer)&&s.check.answer>=0&&s.check.answer<s.check.options.length,`${s.id} invalid checkpoint`);checkCount++;
 }
 for(const e of l.exercises){exerciseCount++;
  check(!exerciseIds.has(e.id),`duplicate exercise ${e.id}`);exerciseIds.add(e.id);
  check(l.sections.some(s=>s.id===e.sectionId),`${e.id} missing linked section ${e.sectionId}`);
  check(e.explanation?.length>10,`${e.id} missing explanation`);
  check(['choice','fill','code','debug'].includes(e.type),`${e.id} invalid type`);
  if(e.options)check(Number.isInteger(e.answer)&&e.answer>=0&&e.answer<e.options.length,`${e.id} invalid choice answer`);
  if(e.type==='fill')check(e.accepted?.length>0&&e.accepted.every(a=>typeof a==='string'&&a.length>0),`${e.id} missing accepted fill`);
  if(e.engine==='comb'){
   codeCount++;check(e.vectors?.length>0,`${e.id} no tests`);vectorCount+=e.vectors?.length||0;
   const r=simulate(e.solution,{inputs:e.inputs,outputs:e.outputs,vectors:e.vectors});
   check(r.ok,`${e.id} reference failed: ${JSON.stringify(r.diagnostics)} counterexample ${JSON.stringify(r.results.find(v=>!v.pass))}`);
   const starter=simulate(e.starter,{inputs:e.inputs,outputs:e.outputs,vectors:e.vectors});
   check(!starter.ok,`${e.id} starter already passes; cannot meaningfully practice`);
  }
 }
}
console.log(JSON.stringify({lectures:lessons.length,available:lessons.filter(l=>l.available).length,sections:sectionCount,inlineChecks:checkCount,exercises:exerciseCount,codeExercises:codeCount,testVectors:vectorCount,chineseReadingCharacters:chars},null,2));
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('PASS: schema, unique IDs, source anchors, knowledge links, reference solutions and unfinished starters.');
