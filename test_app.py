import unittest, sqlite3, json
from pathlib import Path
from server import execute_query
class Checks(unittest.TestCase):
 def test_references(self):
  qs=json.loads(Path('site/questions.json').read_text(encoding='utf-8'))
  self.assertEqual(len({q['id'] for q in qs}),15)
  for q in qs:
   for p in q['files']:self.assertTrue(Path(p).is_file(),p)
   if 'sql' in q:self.assertEqual([list(r) for r in execute_query(q['sql'])['rows']],q['expected'])
 def test_readonly(self):
  for query in ['DELETE FROM Invoice','ATTACH DATABASE ":memory:" AS extra','PRAGMA table_info(Invoice)','SELECT load_extension("x")']:
   with self.assertRaises(sqlite3.Error):execute_query(query)
 def test_limits(self):
  self.assertTrue(execute_query('SELECT * FROM Track')['truncated'])
  with self.assertRaises(ValueError):execute_query('')
  with self.assertRaises(sqlite3.Error):execute_query('SELECT 1; SELECT 2;')
if __name__=='__main__':unittest.main()
