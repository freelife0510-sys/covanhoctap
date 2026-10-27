import test from 'node:test';import assert from 'node:assert/strict';import {createServer} from 'node:http';import handler from '../../server/router.ts';
test('real HTTP router: health, fail-closed session, CSRF and body limits',async()=>{
 const server=createServer((req,res)=>void handler(req,res));await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const address=server.address() as {port:number};const base=`http://127.0.0.1:${address.port}`;
 const oldOrigin=process.env.APP_ORIGIN;const oldUrl=process.env.SUPABASE_URL;process.env.APP_ORIGIN=base;delete process.env.SUPABASE_URL;
 try{
 assert.equal((await fetch(`${base}/api/health`)).status,200);
 const session=await fetch(`${base}/api/session`);assert.equal(session.status,503);assert.equal((await session.json()).error.code,'SETUP_REQUIRED');
 const denied=await fetch(`${base}/api/auth/student-login`,{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:'{}'});assert.equal(denied.status,403);
 const huge=await fetch(`${base}/api/auth/student-login`,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:' '.repeat(512001)});assert.equal(huge.status,413);
 const mass=await fetch(`${base}/api/auth/student-login`,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({identifier:'HS1',password:'test',role:'teacher'})});assert.equal(mass.status,422);assert.equal(mass.headers.get('cache-control'),'no-store');
  // Login must not break on a trailing-slash APP_ORIGIN or when the app is opened on its own host without APP_ORIGIN.
  process.env.APP_ORIGIN=`${base}/`;const slash=await fetch(`${base}/api/auth/student-login`,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'});assert.equal(slash.status,422);
  delete process.env.APP_ORIGIN;const sameHost=await fetch(`${base}/api/auth/student-login`,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'});assert.equal(sameHost.status,422);
  const stillDenied=await fetch(`${base}/api/auth/student-login`,{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:'{}'});assert.equal(stillDenied.status,403);
 }finally{if(oldOrigin===undefined)delete process.env.APP_ORIGIN;else process.env.APP_ORIGIN=oldOrigin;if(oldUrl===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=oldUrl;await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}
});
