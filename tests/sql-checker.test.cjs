const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const compare=require('../site/sql-compare.js').compare;
const init=require('../site/vendor/sql-wasm.js');
const base=path.resolve(__dirname,'../site');
const questions=JSON.parse(fs.readFileSync(path.join(base,'questions.json'),'utf8'));
let resolveResult;
const sandbox={URL,Uint8Array,console,location:{href:'https://example.test/Exam-Studio/sql-worker.js'},fetch:async database=>({ok:true,arrayBuffer:async()=>fs.readFileSync(path.resolve(__dirname,'..',database))}),postMessage:result=>resolveResult(result)};
sandbox.self=sandbox;
sandbox.importScripts=(...files)=>files.forEach(file=>{if(file==='vendor/sql-wasm.js')sandbox.initSqlJs=options=>init({...options,wasmBinary:fs.readFileSync(path.join(base,'vendor/sql-wasm.wasm'))});else vm.runInContext(fs.readFileSync(path.join(base,file),'utf8'),context)});
const context=vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(base,'sql-worker.js'),'utf8'),context);
function run(q,query=q.sql){return new Promise(resolve=>{resolveResult=resolve;sandbox.onmessage({data:{query,database:q.files.find(f=>f.endsWith('.sqlite')),reference:q.sql,ordered:['sql-6','sql-7'].includes(q.id)}})})}
(async()=>{
 for(const q of questions.filter(q=>q.sql)){
  const result=await run(q);assert(!result.error,result.error);assert.equal(result.feedback.ok,true,q.id);assert.deepEqual(JSON.parse(JSON.stringify(result.actual.values)),q.expected,q.id);
 }
 const q=questions.find(q=>q.id==='sql-2');
 assert.equal((await run(q,'SELECT COUNT(*) FROM Invoice WHERE Total < 20')).feedback.ok,false);
 assert.equal((await run(q,'SELECT COUNT(*) FROM Invoice WHERE Total > 20 AND 1=1')).feedback.ok,true);
 for(const query of ['DELETE FROM Invoice','WITH x AS (SELECT 1) DELETE FROM Invoice','SELECT 1; SELECT 2','-- comment\nDROP TABLE Invoice','SELECT nonexistent FROM Invoice'])assert((await run(q,query)).error,query);
 assert.equal((await run(q,"/* test */ SELECT COUNT(*) FROM Invoice WHERE Total > 20;")).feedback.ok,true);
 assert.equal((await run(q,"SELECT ';' AS punctuation")).feedback.ok,false);
 const a={columns:['x'],values:[[1],[2]]},b={columns:['alias'],values:[[2],[1]]};
 assert.equal(compare(a,b,false).ok,true);assert.equal(compare(a,b,true).kind,'order');
 assert.equal(compare({columns:['x'],values:[[1],[1]]},b,false).ok,false);
 assert.equal(compare({columns:['x'],values:[[null]]},{columns:['x'],values:[[0]]},false).ok,false);
 const hidden=await new Promise(resolve=>{resolveResult=resolve;sandbox.onmessage({data:{query:q.sql,database:q.files.find(f=>f.endsWith('.sqlite')),reference:null,ordered:false}})});assert.equal(hidden.feedback,null);
 console.log('PASS: 7 SQL references, alternative query, wrong output, unsafe/multiple/invalid SQL, comments, semicolons in strings, ordering, duplicates, NULL and exam feedback suppression.');
})().catch(e=>{console.error(e);process.exitCode=1});
