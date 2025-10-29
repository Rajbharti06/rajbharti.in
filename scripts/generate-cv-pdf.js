/* Node script to generate vector PDFs of cv.html with metadata and variants */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');

async function generatePdfVariant(page, outPath, opts) {
  const pdfBuffer = await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    landscape: !!opts.landscape,
    scale: opts.scale || 1,
    margin: opts.margin || undefined,
  });
  return pdfBuffer;
}

async function setMetadata(filePath, meta) {
  const existingPdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfDoc.setTitle(meta.title);
  pdfDoc.setAuthor(meta.author);
  pdfDoc.setSubject(meta.subject);
  if (meta.keywords && meta.keywords.length) {
    pdfDoc.setKeywords(meta.keywords);
  }
  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, modifiedPdfBytes);
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const cvFile = path.join(projectRoot, 'cv.html');
  if (!fs.existsSync(cvFile)) {
    throw new Error('cv.html not found at project root');
  }
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('file://' + cvFile, { waitUntil: 'networkidle0' });
  await page.emulateMediaType('print');

  const meta = {
    title: 'Raj Bharti — CV',
    author: 'Raj Bharti',
    subject: 'Curriculum Vitae',
    keywords: ['Raj Bharti', 'CV', 'Resume', 'AI', 'Cybersecurity', 'GitHub'],
  };

  // Standard (A4 portrait)
  const standardPath = path.join(projectRoot, 'cv-standard.pdf');
  await generatePdfVariant(page, standardPath, { scale: 1 });
  await setMetadata(standardPath, meta);

  // High quality (slightly scaled)
  const highPath = path.join(projectRoot, 'cv-high.pdf');
  await generatePdfVariant(page, highPath, { scale: 1.1 });
  await setMetadata(highPath, meta);

  // Print ready (explicit margins)
  const printPath = path.join(projectRoot, 'cv-print.pdf');
  await generatePdfVariant(page, printPath, {
    scale: 1,
    margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
  });
  await setMetadata(printPath, meta);

  // Landscape variant
  const landscapePath = path.join(projectRoot, 'cv-landscape.pdf');
  await generatePdfVariant(page, landscapePath, { landscape: true });
  await setMetadata(landscapePath, meta);

  await browser.close();
  console.log('Generated PDFs:', { standardPath, highPath, printPath, landscapePath });
}

main().catch(err => {
  console.error('Failed to generate PDFs:', err);
  process.exit(1);
});