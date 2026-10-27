import {readFileSync,readdirSync,statSync} from 'node:fs';
const walk=(p:string):string[]=>readdirSync(p).flatMap(n=>statSync(`${p}/${n}`).isDirectory()?walk(`${p}/${n}`):[`${p}/${n}`]);
const patterns=['generativelanguage.googleapis.com','@google/genai','SUPABASE_SECRET_KEY','CANARY_SERVER_KEY_NEVER_IN_BROWSER','AIzaSy'];
let failed=false;for(const path of walk('dist').filter(p=>p.endsWith('.js')||p.endsWith('.html'))){const source=readFileSync(path,'utf8');for(const pattern of patterns)if(source.includes(pattern)){console.error(`Forbidden server material in frontend artifact (${pattern})`);failed=true;}}
console.log(failed?'Frontend artifact scan FAILED':'Frontend artifact scan PASS (known patterns; not a complete secret detector)');if(failed)process.exitCode=1;
