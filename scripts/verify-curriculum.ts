import {HIGH_SCHOOL_CURRICULUM} from '../server/curriculum.ts';
import {writeFileSync,mkdirSync} from 'node:fs';
const rows=['question_id,lesson_id,format,status,review_note'];let count=0;let errors=0;
const seen=new Set<string>();
for(const g of HIGH_SCHOOL_CURRICULUM)for(const c of g.chapters)for(const l of c.lessons)for(const [format,questions] of Object.entries(l.exercises))for(const q of questions){
 count++;if(seen.has(q.id)){console.error('Duplicate id',q.id);errors++;}seen.add(q.id);
 if('options' in q){if(q.options.length!==4||new Set(q.options.map((o:{content:string})=>o.content.trim())).size!==4||new Set(q.options.map((o:{key:string})=>o.key)).size!==4||!q.options.some((o:{key:string})=>o.key===q.correctAnswer)){console.error('Invalid options',q.id);errors++;}}
 if('correctValue' in q && (q.correctValue===undefined||q.correctValue===null)){console.error('Missing answer',q.id);errors++;}
 rows.push([q.id,l.id,format,'PENDING_TEACHER_REVIEW',q.id==='10-c3-b1-mc1'?'Duplicate equivalent option removed; teacher must verify':'Structural validation only; not mathematical approval'].join(','));
}
mkdirSync('docs',{recursive:true});writeFileSync('docs/CURRICULUM_REVIEW.csv',rows.join('\n')+'\n');
console.log(`${count} questions; ${errors} structural errors. Mathematical review PENDING, no automatic approval.`);if(errors)process.exitCode=1;
