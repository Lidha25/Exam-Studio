/* The query and downloaded data stay in the browser; no AI or remote query service is used. */
window.SQLPractice={run({query,database,reference,ordered}){
 return new Promise((resolve,reject)=>{
  const worker=new Worker(new URL('sql-worker.js',document.baseURI));
  const timeout=setTimeout(()=>{worker.terminate();reject(Error('The check timed out. Simplify the query and try again. Your written answer is saved.'))},15000);
  const stop=()=>{clearTimeout(timeout);worker.terminate()};
  worker.onmessage=e=>{stop();e.data.error?reject(Error(e.data.error)):resolve(e.data)};
  worker.onerror=()=>{stop();reject(Error('The SQL checker could not start. Refresh the page and try again, or download Chinook and use your own SQL tool.'))};
  worker.postMessage({query,database:new URL(database,document.baseURI).href,reference,ordered});
 });
}};
