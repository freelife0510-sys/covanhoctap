import test from 'node:test';import assert from 'node:assert/strict';
import {numericValue,gradeShortAnswer,stableShuffle} from '../../server/grading.ts';
import {validateAI,classifyProviderError} from '../../server/ai.ts';
import {chatRequestSchema,studentCreateSchema} from '../../shared/contracts.ts';
import {inspectFile} from '../../server/files.ts';
import {PDFDocument} from 'pdf-lib';
const reply={chatReply:'Em hãy kiểm tra điều kiện xác định.',verdict:'inconclusive',errorCategory:null,errorEvidence:[],keyInsight:'',theorySummary:'',formulasNeeded:[],socraticQuestions:[],pedagogicalAdvice:'',followUpProblems:[]};
test('numeric parser accepts equivalent fractions, comma decimals and zero; rejects code/ambiguous input',()=>{
 for(const v of ['2','2.0','2,0','4/2','２'])assert.equal(numericValue(v),2);
 for(const v of ['1/0','NaN','1,000,000','alert(1)','2m','0x10','1e309'])assert.equal(numericValue(v),null);
 assert.equal(gradeShortAnswer('0',{correctValue:0,acceptableAnswers:[]}),true);
 assert.equal(gradeShortAnswer('2 m',{correctValue:2,acceptableAnswers:[],unit:'m'}),true);
 assert.equal(gradeShortAnswer('2 kg',{correctValue:2,acceptableAnswers:[],unit:'m'}),null);
 assert.equal(gradeShortAnswer('0.333',{correctValue:1/3,acceptableAnswers:[],tolerance:.001}),true);
});
test('shuffled option identities remain stable for a given attempt',()=>{const items=['A','B','C','D'];assert.deepEqual(stableShuffle(items,'attempt'),stableShuffle(items,'attempt'));assert.deepEqual(new Set(stableShuffle(items,'other')),new Set(items));assert.deepEqual(items,['A','B','C','D']);});
test('AI rejects string booleans, unsupported fields, unsupported verdicts and missing evidence',()=>{
 assert.throws(()=>validateAI({...reply,isCorrect:'false'},'submit_solution'));
 assert.throws(()=>validateAI({...reply,verdict:'incorrect',errorCategory:'Khác'},'submit_solution'));
 assert.throws(()=>validateAI({...reply,verdict:true},'submit_solution'));
 assert.equal(validateAI({...reply,verdict:'correct'},'ask_guidance').verdict,'not_applicable');
 assert.equal(validateAI(reply,'submit_solution').verdict,'inconclusive');
});
test('provider error types do not convert credentials/quota to model fallback',()=>{assert.equal(classifyProviderError({status:403}).code,'AI_CREDENTIAL_ERROR');assert.equal(classifyProviderError({status:429}).code,'AI_QUOTA');assert.equal(classifyProviderError({status:404}).code,'AI_MODEL_UNAVAILABLE');assert.equal(classifyProviderError({name:'AbortError'}).status,504);});
test('student inputs cannot assign role, score or owner',()=>{assert.equal(studentCreateSchema.safeParse({name:'An',classId:crypto.randomUUID(),studentCode:'HS-01',role:'teacher'}).success,false);assert.equal(chatRequestSchema.safeParse({requestId:crypto.randomUUID(),conversationId:crypto.randomUUID(),message:'test',attachmentIds:[],intent:'ask_guidance',score:10}).success,false);});
test('real PDF parser rejects corruption and page count overflow',async()=>{await assert.rejects(()=>inspectFile(Buffer.from('not-pdf'),'application/pdf',7));const pdf=await PDFDocument.create();for(let i=0;i<21;i++)pdf.addPage();const bytes=await pdf.save();await assert.rejects(()=>inspectFile(bytes,'application/pdf',bytes.length),/20 trang/);});
test('document schema rejects script nodes and external image URLs',async()=>{
 const {validateDocument}=await import('../../shared/document.ts');assert.equal(validateDocument({type:'doc',content:[{type:'script',text:'alert(1)'}]}),false);assert.equal(validateDocument({type:'doc',content:[{type:'image',attrs:{src:'https://evil.example/track'}}]}),false);assert.equal(validateDocument({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'<script>inert text</script>'}]}]}),true);
});
