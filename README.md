# ExamStudio

A course-grounded practice site with 15 exercises, two five-task mock exams, draft saving, a reflection step, reference approaches, downloadable source data and exports. Seven SQL exercises now run and check queries against the supplied Chinook database directly in the browser, including on GitHub Pages. No API key or server installation is required.

## Run locally (full version)

1. Open a terminal in this folder.
2. Run `python server.py`.
3. Open http://127.0.0.1:8000 in your browser.

The website lets students run and check SQL directly in their browser, or download Chinook and use their own SQLite tool. The optional local SQL API uses the supplied Chinook database in read-only mode, rejects database changes and attachments, limits results and interrupts long queries. This is a local teaching server bound to your computer, not a production public backend.

## Upload to GitHub Pages (static version)

Run `python tools/build_static.py`. The `dist` folder and `ExamStudio-upload.zip` contain the static site and all referenced source files.

Create a GitHub repository, upload the **contents** of `dist` to its root, then enable GitHub Pages from the main branch, root folder in repository Settings → Pages. The eventual address depends on your GitHub account and repository name. The ZIP can also be extracted and uploaded to static hosting.

Static hosting supports practice, mock exams, saving, exports, downloads and the browser SQL checker. The optional SQL API in `server.py` is not used by the website. No Gemini key belongs in browser code or a GitHub repository.

## Content and limitations

All exercise prompts reference supplied materials. Seven SQL reference outputs were computed directly from Chinook. Excel/payroll/regression/audit responses are methodological rubrics, not independently computed numerical solution keys. They require student self-review and instructor content review. No AI grading is claimed. The practice papers are proposed formats with selectable practice time, not official exam formats. Do not claim the bank will be used in the actual exam until the instructor approves it. Power BI is not covered because the supplied materials do not contain a Power BI case.

The IntegrateCo Part 3 wording contradicts itself about change direction. The practice bank explicitly uses 2016 minus 2015, positive for an increase. Source files remain unchanged.

Drafts persist in local browser storage. Mock exam timing persists within the current browser tab/session and is a practice aid, not a secure assessment mechanism. Reference solutions are public site assets. Clearing browser storage removes progress. Font loading uses Google Fonts; system fonts provide a fallback.

## Validate and edit

Run `python -m unittest -v`, `node tests/sql-checker.test.cjs` and `node --check site/app.js`.

Edit `tools/build_content.py`, regenerate with `python tools/build_content.py`, then rebuild the upload package and copy the contents of `dist` to the repository root for GitHub Pages. Source provenance and file references are recorded per question in `site/questions.json`.

## Assignment explanation: added functionality

The SQL checker executes the student's query against the actual supplied Chinook database and compares its complete result with a reference query executed against the same data. Unlike feedback based only on reading a query or trusting a student's reported numbers, it can detect incorrect counts, duplicated rows, missing groups and incorrect ordering. It accepts alternative queries with matching output and gives a concrete correction prompt when results differ. In a direct test of the lecturer's Q312 AI help, the tutor explicitly stated that it could not execute SQL or verify numerical output. Our checker addresses that observed limitation. It checks results rather than proving the student's method is valid for every possible dataset, so students still explain their reasoning in “Defend your result”.

## SQL checker implementation and limits

The site bundles sql.js 1.15.1 (MIT) and its WebAssembly runtime; attribution is in `site/vendor/`. The browser downloads the original Chinook database from this repository and opens a fresh in-memory copy for each check. Student queries are not sent to an AI or a query server. A dedicated worker runs one SELECT or WITH query with SQLite query-only mode enabled. Multiple statements and writes are rejected, results are capped at 2,000 rows / roughly 1 MB, and the worker is terminated after 15 seconds including loading time. Errors preserve the student's draft.

Comparison ignores column aliases but respects column positions, value types, duplicate rows and NULLs. Numeric values tolerate an absolute difference of 0.000001. Row order is checked for questions sql-6 and sql-7, which explicitly request ordering; other questions use unordered row comparison. Matching output is evidence of correctness on this dataset, not proof of a generally correct method. Written explanations are not automatically graded. During active mock exams, the checker runs the student's query without reference evaluation; after finishing, students can run it again for feedback. This is a practice aid, not a secure exam platform.

## Assignment explanation: difficulty of the starting materials

The starting materials are heterogeneous: Word instructions, spreadsheets, pipe-delimited files and several SQLite databases span different cases and skills. Building a reliable practice site requires understanding both the accounting question and each dataset's structure, selecting appropriate tasks, checking reference results and preserving links to the original evidence. IntegrateCo adds mismatched systems, aggregation levels and a contradictory subtraction instruction; audit exercises also require judgement rather than a single numerical answer. Turning these sources into consistent, reviewable exercises therefore requires content validation as well as website development. The previous cases were not supplied as a comparison, so this explanation describes the present difficulty without assuming their exact scope.
