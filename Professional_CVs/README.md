# Professional_CVs

This directory stores company‑specific CVs with consistent branding and tailored content.

## Structure
- `Rolls-Royce/` — tailored CV and research notes
- `BAE Systems/` — tailored CV and research notes
- `BMW/` — tailored CV and research notes
- `../assets/cv-styles.css` — shared print‑friendly styling used by all CVs
- `../scripts/export_cv.ps1` — PowerShell script to export HTML CVs to PDFs
- `CHANGELOG.md` — tracked updates per CV (Git is the primary version control)

## Naming Convention
PDFs generated follow: `Bharti_Raj_CV_[CompanyName]_[YYYY-MM-DD].pdf`

## How to Export to PDF (Windows)
1. Ensure Microsoft Edge (Chromium) is installed.
2. Run PowerShell from the repository root:
   `powershell -ExecutionPolicy Bypass -File scripts/export_cv.ps1 -Date (Get-Date -Format yyyy-MM-dd)`
3. PDFs will be created inside each company folder in `Professional_CVs/`.

## Version Control
- Use Git commit messages to track changes, e.g.,
  - `cv(rolls-royce): update summary for graduate role`
  - `cv(bae): add MBSE keywords and security achievements`
- Record notable changes in `CHANGELOG.md`.

## Branding
All CVs share the same layout and CSS; only text content and keyword emphasis differ per company.