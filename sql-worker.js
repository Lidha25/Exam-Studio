/* Run in an expendable worker so long queries can be terminated without freezing the page. */
importScripts('vendor/sql-wasm.js','sql-compare.js');
function firstKeyword(sql){let rest=sql.trimStart();for(;;){if(rest.startsWith('--')){const end=rest.indexOf('\n');rest=end<0?'':rest.slice(end+1).trimStart()}else if(rest.startsWith('/*')){const end=rest.indexOf('*/',2);if(end<0)throw Error('Unclosed SQL comment.');rest=rest.slice(end+2).trimStart()}else break}return rest.match(/^[A-Za-z]+/)?.[0].toUpperCase()}
function read(db,query){
 if(!['SELECT','WITH'].includes(firstKeyword(query)))throw Error('Enter one read-only SELECT query (WITH queries are also supported).');
 const statements=db.iterateStatements(query);let statement,sql,count=0;
 try{for(statement of statements){count++;sql=statement.getSQL();if(count>1)throw Error('Run one query at a time. Remove extra SQL statements.')}}finally{statements.return()}
 if(count!==1)throw Error('Enter one SQL query.');
 const stmt=db.prepare(sql);const values=[];let size=0;
 try{const columns=stmt.getColumnNames();while(stmt.step()){const row=stmt.get();size+=JSON.stringify(row).length;if(values.length>=2000||size>1000000)throw Error('The result is too large to check. Limit the output to the rows and columns required by this task (maximum 2,000 rows).');values.push(row)}return {columns,values}}finally{stmt.free()}
}
self.onmessage=async event=>{
 let db;
 try{
  const {query,database,reference,ordered}=event.data;
  if(typeof query!=='string'||!query.trim())throw Error('Write a SQL query in the answer box first.');
  if(query.length>12000)throw Error('Keep the query below 12,000 characters.');
  const SQL=await initSqlJs({locateFile:name=>new URL('vendor/'+name,self.location.href).href});
  const response=await fetch(database);if(!response.ok)throw Error('The course database could not be downloaded. Try again or use the database download link.');
  db=new SQL.Database(new Uint8Array(await response.arrayBuffer()));db.run('PRAGMA query_only = ON');
  const expected=reference?read(db,reference):null;
  const actual=read(db,query);
  self.postMessage({actual,feedback:expected?SQLResultCompare.compare(actual,expected,ordered):null});
 }catch(error){self.postMessage({error:error.message})}finally{if(db)db.close()}
};
