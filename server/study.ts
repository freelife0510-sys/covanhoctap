import {createHash} from 'node:crypto';
import type { Identity } from './auth.ts';
import { checked, supabase } from './auth.ts';
import { HIGH_SCHOOL_CURRICULUM } from './curriculum.ts';
import { HttpError } from './http.ts';
import { gradeShortAnswer, stableShuffle } from './grading.ts';
import { z } from 'zod';
import { uuid } from '../shared/contracts.ts';
export const questionHash=(q:unknown)=>createHash('sha256').update(JSON.stringify(q)).digest('hex');
export const lessons = HIGH_SCHOOL_CURRICULUM.flatMap(g=>g.chapters.flatMap(c=>c.lessons.map(l=>({...l,grade:g.grade,chapter:c.title}))));
export function publicCurriculum() {return lessons.map(l=>({id:l.id,title:l.title,grade:l.grade,chapter:l.chapter,theory:l.theory}));}
export async function createAttempt(identity: Identity, value: unknown) {
  const input=z.object({id:uuid,lessonId:z.string(),format:z.enum(['multiple_choice','true_false','short_answer']),assignmentId:uuid.optional()}).strict().parse(value);
  const lesson=lessons.find(l=>l.id===input.lessonId);if(!lesson) throw new HttpError(404,'LESSON_NOT_FOUND','Không tìm thấy bài học.');
  const admin=supabase(undefined,true);
  const existing=checked(await admin.from('attempts').select('*').eq('id',input.id).maybeSingle());
  if(existing) {if(existing.owner_id!==identity.id) throw new HttpError(409,'CONFLICT','Mã lượt làm đã được sử dụng.');return safeAttempt(existing);}
  const reviews=checked(await identity.db.from('question_reviews').select('question_id,content_hash').eq('status','reviewed'));
  const allowed=new Map((reviews||[]).map(r=>[r.question_id,r.content_hash]));
  const all=input.format==='multiple_choice'?lesson.exercises.multipleChoice:input.format==='true_false'?lesson.exercises.trueFalse:lesson.exercises.shortAnswer;
  const questions=all.filter(q=>allowed.get(q.id)===questionHash(q)).map(q=>('options' in q ? {...q,version:questionHash(q),options:stableShuffle(q.options,`${input.id}:${q.id}`)} : {...q,version:questionHash(q)}));
  if(!questions.length) throw new HttpError(422,'CONTENT_REVIEW_REQUIRED','Chưa có câu hỏi đã được giáo viên thẩm định cho dạng này.');
  if(input.assignmentId) {
    const assignment=checked(await identity.db.from('assignments').select('*').eq('id',input.assignmentId).maybeSingle());
    if(!assignment || assignment.lesson_id!==input.lessonId || (assignment.deadline && new Date(assignment.deadline)<new Date())) throw new HttpError(403,'ASSIGNMENT_UNAVAILABLE','Nhiệm vụ không hợp lệ hoặc đã hết hạn.');
  }
  const row={id:input.id,owner_id:identity.id,lesson_id:input.lessonId,format:input.format,data:{questions,assignmentId:input.assignmentId,answers:{},submitted:false,version:1}};
  checked(await admin.from('attempts').insert(row));return safeAttempt(row);
}
function safeAttempt(row: {id:string;format:string;data:Record<string,any>}) {return {id:row.id,format:row.format,submitted:row.data.submitted,result:row.data.result,questions:row.data.questions.map((q:any)=>({id:q.id,prompt:q.question||q.context||q.problem,options:q.options,statements:q.statements?.map((s:any)=>({subId:s.subId,content:s.content}))}))};}
export async function submitAttempt(identity: Identity,value:unknown) {
  const input=z.object({id:uuid,answers:z.record(z.string(),z.union([z.string().max(200),z.record(z.string(),z.boolean())]))}).strict().parse(value);
  const admin=supabase(undefined,true);const row=checked(await admin.from('attempts').select('*').eq('id',input.id).eq('owner_id',identity.id).maybeSingle());
  if(!row) throw new HttpError(404,'ATTEMPT_NOT_FOUND','Không tìm thấy lượt làm.');
  if(row.data.submitted) return row.data.result;
  const details=row.data.questions.map((q:any)=>{
    const answer=input.answers[q.id];let correct:boolean|null=null;
    if(row.format==='multiple_choice') correct=typeof answer==='string' ? answer===q.correctAnswer : null;
    else if(row.format==='true_false') correct=answer && typeof answer==='object' && q.statements.every((s:any)=>typeof answer[s.subId]==='boolean') ? q.statements.every((s:any)=>answer[s.subId]===s.isCorrect) : null;
    else correct=typeof answer==='string' ? gradeShortAnswer(answer,q) : null;
    return {questionId:q.id,correct,explanation:q.explanation||q.overallExplanation||q.statements?.map((s:any)=>`${s.subId}: ${s.explanation}`).join('\n')};
  });
  const completed=details.filter((d:any)=>d.correct!==null).length;
  const correct=details.filter((d:any)=>d.correct===true).length;
  const result={details,correct,total:details.length,answered:completed,score:Number((correct/details.length*10).toFixed(1)),label:'Điểm luyện tập trên toàn bộ câu trong lượt làm; không phải điểm thi chính thức',durationSeconds:Math.max(0,Math.round((Date.now()-new Date(row.created_at).getTime())/1000))};
  const saved=checked(await admin.rpc('submit_attempt',{p_id:input.id,p_owner:identity.id,p_answers:input.answers,p_result:result}));
  return saved;
}
