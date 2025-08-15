
MixTools Real Functions package
-------------------------------

Files:
- index.html
- tools.html  <-- main app with working client-side functions
- style.css

How to deploy:
1. Create a new GitHub repo and upload these files at root.
2. Deploy on Vercel (connect to GitHub) or any static host.
3. Open /tools.html

Notes & limitations:
- Merge, Split, Remove, Rotate, Images->PDF, PDF->Images, Compress (raster), PDF->Word (text extraction), Word->PDF (via Mammoth->HTML->PDF) are implemented client-side.
- PDF->Word is basic: extracts visible text per page and writes to a .docx file; formatting may be lost. For high-quality conversions and OCR, a backend is required (I can provide one).
- Word->PDF uses Mammoth.js to convert DOCX->HTML then jsPDF to generate PDF — works for many documents but complex layouts may differ.
- Large PDFs (100+ pages) can be slow in browser for operations like compression and image export.
