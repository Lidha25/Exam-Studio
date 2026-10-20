"""ExamStudio: dependency-free local server. Run python server.py."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import sqlite3, json, time, urllib.parse
ROOT=Path(__file__).resolve().parent
DB=next((ROOT/'materials').rglob('Chinook_Sqlite.sqlite'))
DENIED={getattr(sqlite3,n) for n in ['SQLITE_INSERT','SQLITE_UPDATE','SQLITE_DELETE','SQLITE_CREATE_TABLE','SQLITE_DROP_TABLE','SQLITE_ALTER_TABLE','SQLITE_ATTACH','SQLITE_DETACH','SQLITE_PRAGMA','SQLITE_TRANSACTION','SQLITE_CREATE_VTABLE','SQLITE_DROP_VTABLE']}
def execute_query(query):
 if not isinstance(query,str) or not query.strip(): raise ValueError('Enter a SQL query first.')
 if len(query)>12000: raise ValueError('Query is too long.')
 c=sqlite3.connect(DB.as_uri()+'?mode=ro',uri=True)
 try:
  c.set_authorizer(lambda action,a,b,db,trigger: sqlite3.SQLITE_DENY if action in DENIED or (action==sqlite3.SQLITE_FUNCTION and str(b).lower() in ['load_extension','writefile','readfile']) else sqlite3.SQLITE_OK)
  deadline=time.monotonic()+3
  c.set_progress_handler(lambda: int(time.monotonic()>deadline),1000)
  cur=c.execute(query)
  if cur.description is None: raise ValueError('Use a read-only SELECT query.')
  rows=cur.fetchmany(201)
  return dict(columns=[d[0] for d in cur.description],rows=rows[:200],count=len(rows) if len(rows)<=200 else '200+',truncated=len(rows)>200)
 finally:c.close()
class Handler(SimpleHTTPRequestHandler):
 def translate_path(self,path):
  clean=urllib.parse.unquote(urllib.parse.urlsplit(path).path)
  base=ROOT if clean.startswith('/materials/') else ROOT/'site'
  target=(base/clean.lstrip('/')).resolve()
  if not target.is_relative_to(base): return str(ROOT/'site'/'missing')
  if base==ROOT and not target.is_relative_to(ROOT/'materials'):return str(ROOT/'site'/'missing')
  return str(target)
 def list_directory(self,path):self.send_error(403,'Directory listing disabled')
 def do_POST(self):
  if self.path!='/api/sql':self.send_error(404);return
  # Reject cross-origin browser calls to the local runner.
  origin=self.headers.get('Origin')
  if origin and urllib.parse.urlsplit(origin).netloc!=self.headers.get('Host'):self.send_error(403);return
  try:
   length=int(self.headers.get('Content-Length','0'))
   if length>20000:raise ValueError('Request is too large.')
   payload=json.loads(self.rfile.read(length));data=execute_query(payload.get('query'));status=200
  except (ValueError,sqlite3.Error,TypeError,AttributeError) as e:data={'error':str(e)};status=400
  body=json.dumps(data).encode();self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
if __name__=='__main__':
 print('ExamStudio is ready: http://127.0.0.1:8000',flush=True)
 ThreadingHTTPServer(('127.0.0.1',8000),Handler).serve_forever()
