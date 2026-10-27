import {config} from 'dotenv';
config({path:['.env.local','.env'],quiet:true});
const names=['APP_ORIGIN','SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_SECRET_KEY','GEMINI_API_KEY','GEMINI_PRIMARY_MODEL','AI_DAILY_REQUEST_LIMIT_PER_USER','AI_GLOBAL_DAILY_TOKEN_LIMIT'];
let missing=false;
for(const name of names){const present=Boolean(process.env[name]);console.log(`${name}: ${present?'SET':'MISSING'}`);missing ||= !present;}
for(const name of Object.keys(process.env))if(/^VITE_.*(KEY|TOKEN|SECRET|PASSWORD)/i.test(name)){console.error(`Unsafe frontend variable name: ${name}`);missing=true;}
if(missing)process.exitCode=1;
