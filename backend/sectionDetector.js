const path = require('path');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const FONT_DATA_PATH = path.join(__dirname, 'node_modules/pdfjs-dist/standard_fonts/');

/**
 * Phase 1 — Section Detection
 * Reads every text element from the PDF, normalizes it,
 * and locates all section header boundaries (A–J, Loan Terms, etc.)
 */

// Clean up smart quotes and dashes to plain ASCII
function normalize(str) {
  return str
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/[\u2013\u2014]/g, '-');
}

// Pull every non-empty text element from every page
async function collectTextItems(pdfDoc) {
  const items = [];
  for (let pg = 1; pg <= pdfDoc.numPages; pg++) {
    const page = await pdfDoc.getPage(pg);
    const content = await page.getTextContent();
    for (const el of content.items) {
      const text = normalize(el.str.trim());
      if (text === '') continue;
      items.push({
        text,
        x: Math.round(el.transform[4]),
        y: Math.round(el.transform[5]),
        page: pg,
      });
    }
  }
  return items;
}

// Locate a section header by matching its label
function locateHeader(items, label) {
  const hit = items.find(it => it.text.includes(label));
  return hit ? { y: hit.y, page: hit.page, x: hit.x } : null;
}

// Gather items that fall between two section boundaries (handles page breaks)
function itemsBetween(items, from, to) {
  if (!from) return [];
  return items.filter(it => {
    if (it.page === from.page && it.y <= from.y) {
      if (to && it.page === to.page && it.y <= to.y) return false;
      return true;
    }
    if (it.page > from.page) {
      if (!to) return true;
      if (it.page < to.page) return true;
      if (it.page === to.page && it.y > to.y) return true;
      return false;
    }
    return false;
  });
}

// Detect the "At Closing" column x-range
function detectColumn(items) {
  // Strategy 1: Find explicit column headers
  const atHeaders = items.filter(it =>
    it.text === 'At Closing' || it.text === 'At Close' || it.text === 'Closing'
  );
  const beforeHeaders = items.filter(it =>
    it.text === 'Before Closing' || it.text === 'Before Close'
  );

  if (atHeaders.length > 0 && beforeHeaders.length > 0) {
    return { min: atHeaders[0].x - 30, max: beforeHeaders[0].x - 10 };
  }

  // Strategy 2: Infer from section total positions
  const probeLabels = [
    'A. Origination Charges',
    'B. Services Borrower Did Not Shop For',
    'C. Services Borrower Did Shop For',
    'E. Taxes and Other Government Fees',
  ];

  const xPositions = [];
  for (const label of probeLabels) {
    const anchor = items.find(it => it.text.includes(label));
    if (!anchor) continue;
    const dollarVals = items.filter(it =>
      it.page === anchor.page &&
      Math.abs(it.y - anchor.y) <= 5 &&
      it.x > anchor.x + 50 &&
      /\$/.test(it.text) && /\d/.test(it.text)
    );
    if (dollarVals.length > 0) {
      xPositions.push(dollarVals.sort((a, b) => a.x - b.x)[0].x);
    }
  }

  if (xPositions.length > 0) {
    const avg = xPositions.reduce((s, v) => s + v, 0) / xPositions.length;
    return { min: avg - 30, max: avg + 50 };
  }

  return { min: 300, max: 400 };
}

// Main entry — load PDF and detect everything
async function detectSections(pdfBuffer) {
  const data = new Uint8Array(pdfBuffer);
  const pdfDoc = await pdfjsLib.getDocument({
    data,
    standardFontDataUrl: FONT_DATA_PATH,
  }).promise;

  const items = await collectTextItems(pdfDoc);
  const column = detectColumn(items);

  // Locate all relevant section headers
  const headers = {
    closingCostDetails: locateHeader(items, 'Closing Cost Details'),
    costsAtClosing:     locateHeader(items, 'Costs at Closing'),
    calcCashToClose:    locateHeader(items, 'Calculating Cash to Close'),
    sectionF:           locateHeader(items, 'F. Prepaids'),
    sectionG:           locateHeader(items, 'G. Initial Escrow'),
    sectionH:           locateHeader(items, 'H. Other'),
    payoffs:            locateHeader(items, 'Payoffs and Payments'),
  };

  return { items, column, headers };
}

module.exports = {
  detectSections,
  locateHeader,
  itemsBetween,
  normalize,
};
