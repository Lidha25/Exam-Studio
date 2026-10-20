"""Build an upload-ready static folder and ZIP without third-party packages."""
import pathlib,shutil,json,zipfile
root=pathlib.Path(__file__).resolve().parents[1];out=root/'dist';out.mkdir(exist_ok=True)
for p in (root/'site').rglob('*'):
 if p.is_file():
  target=out/p.relative_to(root/'site');target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target)
qs=json.loads((root/'site/questions.json').read_text(encoding='utf-8'))
for name in {f for q in qs for f in q['files']}:
 target=out/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/name,target)
(out/'.nojekyll').touch()
with zipfile.ZipFile(root/'ExamStudio-upload.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in out.rglob('*'):
  if p.is_file():z.write(p,p.relative_to(out))
print('Built dist/ and ExamStudio-upload.zip')
