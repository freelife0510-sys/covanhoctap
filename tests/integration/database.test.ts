import test from 'node:test';import assert from 'node:assert/strict';import {Client} from 'pg';import {readFileSync,readdirSync} from 'node:fs';
const connectionString=process.env.TEST_DATABASE_URL;
test('Postgres migrations, RLS, concurrency and transaction contracts', {skip:!connectionString},async()=>{
 const admin=new Client({connectionString});await admin.connect();
 const teacherA='10000000-0000-4000-8000-000000000001',teacherB='10000000-0000-4000-8000-000000000002',studentA='20000000-0000-4000-8000-000000000001',studentB='20000000-0000-4000-8000-000000000002',classA='30000000-0000-4000-8000-000000000001',classB='30000000-0000-4000-8000-000000000002',conversation='40000000-0000-4000-8000-000000000001';
 try{
  // Disposable database only. This fixture models auth.uid/roles and bucket metadata;
  // it does NOT validate Supabase GoTrue, Storage, OAuth or deployed service behavior.
  const dbName=(await admin.query('select current_database() as name')).rows[0].name;if(!dbName.endsWith('_test'))throw new Error('Refusing fixture outside *_test database');
  await admin.query(`drop schema if exists public cascade;create schema public;drop schema if exists auth cascade;drop schema if exists storage cascade;create schema auth;create schema storage;do $$ begin if not exists(select 1 from pg_roles where rolname='anon')then create role anon;end if;if not exists(select 1 from pg_roles where rolname='authenticated')then create role authenticated;end if;if not exists(select 1 from pg_roles where rolname='service_role')then create role service_role bypassrls;end if;end $$;grant usage on schema public,auth to authenticated,anon,service_role;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
  for(const name of readdirSync('supabase/migrations').sort())await admin.query(readFileSync(`supabase/migrations/${name}`,'utf8'));
  for(const id of [teacherA,teacherB,studentA,studentB])await admin.query('insert into auth.users values($1)',[id]);
  for(const [id,role,name]of[[teacherA,'teacher','Teacher A'],[teacherB,'teacher','Teacher B'],[studentA,'student','Student A'],[studentB,'student','Student B']])await admin.query('insert into public.profiles(user_id,role,name)values($1,$2,$3)',[id,role,name]);
  await admin.query('insert into public.teacher_access(user_id)values($1),($2)',[teacherA,teacherB]);
  await admin.query("insert into public.classes(id,teacher_id,data)values($1,$2,'{}'),($3,$4,'{}')",[classA,teacherA,classB,teacherB]);
  await admin.query("insert into public.student_accounts(user_id,student_code,auth_email,teacher_id,class_id)values($1,'A','a@students.invalid',$2,$3),($4,'B','b@students.invalid',$5,$6)",[studentA,teacherA,classA,studentB,teacherB,classB]);
  await admin.query('insert into public.conversations(id,owner_id)values($1,$2)',[conversation,studentA]);
  const asUser=async(id:string,sql:string,values:unknown[]=[])=>{await admin.query('begin');try{await admin.query('set local role authenticated');await admin.query("select set_config('request.jwt.claim.sub',$1,true)",[id]);const result=await admin.query(sql,values);await admin.query('commit');return result;}catch(e){await admin.query('rollback');throw e;}};
  assert.equal((await asUser(studentA,'select user_id from public.profiles')).rowCount,1);
  assert.deepEqual((await asUser(teacherA,'select id from public.classes')).rows.map(r=>r.id),[classA]);
  assert.deepEqual((await asUser(studentB,'select id from public.conversations')).rows,[]);
  assert.equal((await asUser(teacherA,'select user_id from public.student_accounts')).rowCount,1);
  await assert.rejects(()=>asUser(studentA,"update public.profiles set role='teacher'"),/permission denied/);
  await assert.rejects(()=>asUser(studentA,'select auth_email from public.student_accounts'),/permission denied/);
  await assert.rejects(()=>asUser(studentA,'select data from public.attempts'),/permission denied/);
  await assert.rejects(()=>asUser(studentA,"select public.save_document($1,$2,0,'x','{}')",[crypto.randomUUID(),studentB]),/permission denied/);
  const document=crypto.randomUUID();assert.equal((await admin.query("select public.save_document($1,$2,0,'x','{}') as revision",[document,studentA])).rows[0].revision,1);
  const connections=await Promise.all([1,2].map(async()=>{const c=new Client({connectionString});await c.connect();return c;}));
  try{const revisions=await Promise.all(connections.map(c=>c.query("select public.save_document($1,$2,1,'x','{}') as revision",[document,studentA])));assert.deepEqual(revisions.map(r=>r.rows[0].revision).sort(),[2,null].sort());}finally{await Promise.all(connections.map(c=>c.end()));}
  const requests=await Promise.all(Array.from({length:5},async()=>{const c=new Client({connectionString});await c.connect();try{return(await c.query('select public.reserve_ai($1,$2,$3,3,1000000) as status',[crypto.randomUUID(),studentA,conversation])).rows[0].status;}finally{await c.end();}}));
  assert.equal(requests.filter(s=>s==='reserved').length,3);assert.equal(requests.filter(s=>s==='quota').length,2);
  const submission=crypto.randomUUID();await admin.query(`insert into public.submissions(id,student_id,teacher_id,class_id,data)values($1,$2,$3,$4,'{"evaluation":{"verdict":"incorrect","reviewState":"unreviewed","errorCategory":"Khác"},"hasResolvedMistake":false}')`,[submission,studentA,teacherA,classA]);
  await admin.query("select public.review_submission($1,$2,'incorrect','Teacher checked synthetic evidence',false)",[submission,teacherA]);
  assert.equal((await admin.query('select state from public.mastery_evidence where submission_id=$1',[submission])).rows[0].state,'needs_remedy');
  await admin.query("select public.review_submission($1,$2,'correct','Teacher verified a corrected solution',true)",[submission,teacherA]);
  assert.equal((await admin.query('select state from public.mastery_evidence where submission_id=$1',[submission])).rows[0].state,'resolved');
  assert.equal((await admin.query('select count(*)::int as n from public.audit_events where target_id=$1',[submission])).rows[0].n,2);
  const attempt=crypto.randomUUID();await admin.query("insert into public.attempts(id,owner_id,lesson_id,format,data)values($1,$2,'test','multiple_choice','{\"submitted\":false}')",[attempt,studentA]);
  const first=(await admin.query("select public.submit_attempt($1,$2,'{}','{\"score\":0}') as result",[attempt,studentA])).rows[0].result;const again=(await admin.query("select public.submit_attempt($1,$2,'{}','{\"score\":10}') as result",[attempt,studentA])).rows[0].result;assert.deepEqual(first,again);
  for(let i=0;i<10;i++)assert.equal((await admin.query("select public.login_rate_limit('synthetic-test') as allowed")).rows[0].allowed,true);assert.equal((await admin.query("select public.login_rate_limit('synthetic-test') as allowed")).rows[0].allowed,false);
 }finally{await admin.end();}
});
