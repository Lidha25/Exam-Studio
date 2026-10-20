# ExamStudio

A course-grounded practice site with 15 exercises, two five-task mock exams, draft saving, a reflection step, reference approaches, downloadable source data and exports. No packages or API keys required.

## Run locally (full version)

1. Open a terminal in this folder.
2. Run `python server.py`.
3. Open http://127.0.0.1:8000 in your browser.

The website directs students to download Chinook and run SQL in their own SQLite tool. The optional local SQL API uses the supplied Chinook database in read-only mode, rejects database changes and attachments, limits results and interrupts long queries. This is a local teaching server bound to your computer, not a production public backend.

## Upload to GitHub Pages (static version)

Run `python tools/build_static.py`. The `dist` folder and `ExamStudio-upload.zip` contain the static site and all referenced source files.

Create a GitHub repository, upload the **contents** of `dist` to its root, then enable GitHub Pages from the main branch, root folder in repository Settings → Pages. The eventual address depends on your GitHub account and repository name. The ZIP can also be extracted and uploaded to static hosting.

Static hosting supports practice, mock exams, saving, exports and downloads. Students download Chinook and use their own SQL tool. The optional SQL API in `server.py` is not exposed as a website button. No Gemini key belongs in browser code or a GitHub repository.

## Content and limitations

All exercise prompts reference supplied materials. Seven SQL reference outputs were computed directly from Chinook. Excel/payroll/regression/audit responses are methodological rubrics, not independently computed numerical solution keys. They require student self-review and instructor content review. No AI grading is claimed. The practice papers are proposed formats with selectable practice time, not official exam formats. Do not claim the bank will be used in the actual exam until the instructor approves it. Power BI is not covered because the supplied materials do not contain a Power BI case.

The IntegrateCo Part 3 wording contradicts itself about change direction. The practice bank explicitly uses 2016 minus 2015, positive for an increase. Source files remain unchanged.

Drafts persist in local browser storage. Mock exam timing persists within the current browser tab/session and is a practice aid, not a secure assessment mechanism. Reference solutions are public site assets. Clearing browser storage removes progress. Font loading uses Google Fonts; system fonts provide a fallback.

## Validate and edit

Run `python -m unittest -v` and `node --check site/app.js`.

Edit `tools/build_content.py`, regenerate with `python tools/build_content.py`, then rebuild the upload package and copy the contents of `dist` to the repository root for GitHub Pages. Source provenance and file references are recorded per question in `site/questions.json`.

## Assignment explanation: added functionality

The “Defend your result” step requires the student to record a method, a verification and a limitation before marking a self-review complete. For example, an IntegrateCo answer must explain how employee keys, data aggregation levels and wage definitions were aligned, while an audit answer must distinguish a flagged purchase from evidence of misconduct. This is useful because a plausible number or copied query can hide an invalid comparison or unsupported business conclusion. The step rehearses the reasoning students must communicate when defending their analysis, while clearly distinguishing self-assessment from a grade. Its value is a design rationale; improvement relative to the instructor's live site has not yet been verified through comparative testing.

## Assignment explanation: difficulty of the starting materials

The starting materials are heterogeneous: Word instructions, spreadsheets, pipe-delimited files and several SQLite databases span different cases and skills. Building a reliable practice site requires understanding both the accounting question and each dataset's structure, selecting appropriate tasks, checking reference results and preserving links to the original evidence. IntegrateCo adds mismatched systems, aggregation levels and a contradictory subtraction instruction; audit exercises also require judgement rather than a single numerical answer. Turning these sources into consistent, reviewable exercises therefore requires content validation as well as website development. The previous cases were not supplied as a comparison, so this explanation describes the present difficulty without assuming their exact scope.
