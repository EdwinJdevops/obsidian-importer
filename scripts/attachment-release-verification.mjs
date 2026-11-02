import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync,appendFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
mkdirSync('verification-evidence',{recursive:true});
const checks=[
 ['notion-regressions',['node_modules/tsx/dist/cli.mjs','--tsconfig','tsconfig.test.json','--test','tests/notion-api/*.test.ts']],
 ['typecheck',['node_modules/typescript/bin/tsc','-p','tsconfig.typecheck.json','--noEmit']],
 ['lint',['node_modules/eslint/bin/eslint.js','src/formats/notion-api/attachment-helpers.ts']],
 ['build',['esbuild.config.mjs','production']],
];
const results=[];
for(const [name,args] of checks){
 const start=Date.now();
 const r=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:16*1024*1024,env:{...process.env,TZ:'UTC'}});
 const log=(r.stdout??'')+(r.stderr??'')+(r.error?String(r.error):'');
 writeFileSync(`verification-evidence/${name}.log`,log);
 const passed=r.status===0 && !r.error;
 results.push({name,passed,exitCode:r.status,signal:r.signal,elapsedMs:Date.now()-start});
 console.log(`${name}: ${passed?'PASS':'FAIL'}`);
 if(!passed)console.log(log.slice(-4000));
}
const artifacts={};
for(const name of ['main.js','manifest.json','styles.css']){
 try{artifacts[name]=createHash('sha256').update(readFileSync(name)).digest('hex');}catch{artifacts[name]=null;}
}
const report={revision:process.env.GITHUB_SHA??spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),node:process.version,platform:process.platform,arch:process.arch,results,artifacts,scope:'Repository test shims and build validation. Not live Obsidian migration, production operations, security certification or cross-platform byte-reproducibility proof.'};
writeFileSync('verification-evidence/result.json',JSON.stringify(report,null,2));
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,`## Attachment release verification\n\nRevision: ${report.revision}\n\n`+results.map(r=>`- ${r.name}: ${r.passed?'PASS':'FAIL'}`).join('\n')+'\n\n'+report.scope+'\n');
process.exitCode=results.every(r=>r.passed)?0:1;
