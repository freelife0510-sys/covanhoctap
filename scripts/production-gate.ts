// A production Git push must not silently promote an unaccepted preview.
if(process.env.VERCEL_ENV==='production'){
 const required=['APP_ORIGIN','SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_SECRET_KEY','GEMINI_API_KEY','GEMINI_PRIMARY_MODEL','AI_DAILY_REQUEST_LIMIT_PER_USER','AI_GLOBAL_DAILY_TOKEN_LIMIT'];
 const missing=required.filter(name=>!process.env[name]);
 if(missing.length)throw new Error(`Production blocked: configure ${missing.join(', ')} in Vercel.`);
 const accepted=process.env.PRODUCTION_ACCEPTANCE_SHA;const commit=process.env.VERCEL_GIT_COMMIT_SHA;
 if(!accepted||!/^[a-f0-9]{40}$/.test(accepted)||accepted!==commit)throw new Error('Production blocked: validate Preview and set PRODUCTION_ACCEPTANCE_SHA to its exact Git commit before promoting.');
 if(process.env.APP_ORIGIN!=='https://covanhoctap.vercel.app')throw new Error('Production APP_ORIGIN must match the existing owned domain.');
}
