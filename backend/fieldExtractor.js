const { itemsBetween, locateHeader } = require('./sectionDetector');

/**
 * Phase 2 — Field Extraction
 * Given the detected sections and text items,
 * extract all monetary values into a structured object.
 */

// Parse any dollar-format string into a number
function parseAmount(raw) {
  if (!raw || raw === '' || raw === '-') return 0;
  let s = String(raw).trim().replace(/[\u2013\u2014]/g, '-');
  const negative = s.includes('-') || (s.startsWith('(') && s.endsWith(')'));
  const digits = s.replace(/[^0-9.]/g, '');
  const num = parseFloat(digits) || 0;
  return negative ? -num : num;
}

// Read the total value on a section header row (e.g. "A. Origination Charges  $4,176.16")
function readSectionTotal(items, label, col) {
  const anchor = items.find(it => it.text.includes(label));
  if (!anchor) return 0;

  const hits = items
    .filter(it =>
      it.page === anchor.page &&
      Math.abs(it.y - anchor.y) <= 5 &&
      it.x >= col.min && it.x <= col.max &&
      /\d/.test(it.text)
    )
    .sort((a, b) => a.x - b.x);

  return hits.length > 0 ? parseAmount(hits[0].text) : 0;
}

// Read a sub-field value inside a section (picks rightmost dollar value on the row)
function readFieldInSection(sectionItems, label, col) {
  const anchors = sectionItems.filter(it => it.text.includes(label));
  if (anchors.length === 0) return 0;

  const anchor = anchors[0];
  const hits = sectionItems
    .filter(it =>
      it.page === anchor.page &&
      Math.abs(it.y - anchor.y) <= 5 &&
      it.x >= col.min && it.x <= col.max + 30 &&
      /\d/.test(it.text) && /[\d$.,]/.test(it.text)
    )
    .sort((a, b) => b.x - a.x);

  return hits.length > 0 ? parseAmount(hits[0].text) : 0;
}

// Read a simple label → value pair (first dollar value to the right of the label)
function readValueByLabel(items, labelText) {
  const anchor = items.find(it => it.text === labelText);
  if (!anchor) return 0;

  const hits = items
    .filter(it =>
      it.page === anchor.page &&
      Math.abs(it.y - anchor.y) <= 8 &&
      it.x > anchor.x + 10 &&
      /\$/.test(it.text) && /\d/.test(it.text)
    )
    .sort((a, b) => a.x - b.x);

  return hits.length > 0 ? parseAmount(hits[0].text) : 0;
}

// Sum all "Payoff to..." and "Payment to..." lines
function totalPayoffEntries(sectionItems) {
  let sum = 0;
  for (const it of sectionItems) {
    if (!it.text.includes('Payoff to') && !it.text.includes('Payment to')) continue;

    const vals = sectionItems
      .filter(v =>
        v.page === it.page &&
        Math.abs(v.y - it.y) <= 15 &&
        v.x > 400 &&
        /\$/.test(v.text) && /\d/.test(v.text)
      )
      .sort((a, b) => b.x - a.x);

    if (vals.length > 0) {
      sum += parseAmount(vals[0].text);
    }
  }
  return sum;
}

// Main entry — extract all fields from the detected structure
function extractFields(items, column, headers) {
  // --- Loan Terms ---
  const loanAmount = readValueByLabel(items, 'Loan Amount');

  // --- Cash to Close (from "Costs at Closing", not "Calculating Cash to Close") ---
  let cashToClose = 0;
  if (headers.costsAtClosing) {
    const costsItems = itemsBetween(items, headers.costsAtClosing, headers.calcCashToClose);
    const ctcAnchor = costsItems.find(it => it.text === 'Cash to Close');
    if (ctcAnchor) {
      const ctcHits = costsItems
        .filter(it =>
          it.page === ctcAnchor.page &&
          Math.abs(it.y - ctcAnchor.y) <= 8 &&
          it.x > ctcAnchor.x + 10 &&
          /\$/.test(it.text) && /\d/.test(it.text)
        )
        .sort((a, b) => a.x - b.x);
      if (ctcHits.length > 0) cashToClose = parseAmount(ctcHits[0].text);
    }
  }
  if (cashToClose === 0) {
    cashToClose = readValueByLabel(items, 'Cash to Close');
  }

  // --- Section totals (A, B, C, E) ---
  const sectionA = readSectionTotal(items, 'A. Origination Charges', column);
  const sectionB = readSectionTotal(items, 'B. Services Borrower Did Not Shop For', column);
  const sectionC = readSectionTotal(items, 'C. Services Borrower Did Shop For', column);
  const sectionE = readSectionTotal(items, 'E. Taxes and Other Government Fees', column);

  // --- Section F (Prepaids) ---
  const fItems = itemsBetween(items, headers.sectionF, headers.sectionG);
  const hoInsuranceF = readFieldInSection(fItems, 'Homeowner', column);
  const prepaidInterest = readFieldInSection(fItems, 'Prepaid Interest', column);

  // --- Section G (Initial Escrow) ---
  const gItems = itemsBetween(items, headers.sectionG, headers.sectionH);
  const hoInsuranceG = readFieldInSection(gItems, 'Homeowner', column);
  const mortgageInsurance = readFieldInSection(gItems, 'Mortgage Insurance', column);
  const propertyTaxes = readFieldInSection(gItems, 'Property Taxes', column);
  const cityPropertyTax = readFieldInSection(gItems, 'City Property Tax', column);

  // Aggregate Adjustment (within G)
  let aggregateAdjustment = 0;
  const aggHit = gItems.find(it => it.text.includes('Aggregate Adjustment'));
  if (aggHit) {
    const aggVals = gItems
      .filter(it =>
        it.page === aggHit.page &&
        Math.abs(it.y - aggHit.y) <= 5 &&
        it.x > aggHit.x + 50 &&
        /\d/.test(it.text)
      )
      .sort((a, b) => a.x - b.x);
    if (aggVals.length > 0) aggregateAdjustment = parseAmount(aggVals[0].text);
  }

  // --- Lender Credits (Section J area) ---
  let lenderCredit = 0;
  const lcHit = items.find(it => it.text === 'Lender Credits');
  if (lcHit) {
    const lcVals = items
      .filter(it =>
        it.page === lcHit.page &&
        Math.abs(it.y - lcHit.y) <= 5 &&
        it.x > lcHit.x + 50 &&
        /\d/.test(it.text)
      )
      .sort((a, b) => a.x - b.x);
    if (lcVals.length > 0) lenderCredit = parseAmount(lcVals[0].text);
  }

  // --- Payoffs & Payments ---
  const payoffItems = itemsBetween(items, headers.payoffs, headers.calcCashToClose);
  const payoffAmount = totalPayoffEntries(payoffItems);

  let principalReduction = 0;
  const prHit = payoffItems.find(it => it.text.includes('Principal Reduction'));
  if (prHit) {
    const prVals = payoffItems
      .filter(it =>
        it.page === prHit.page &&
        Math.abs(it.y - prHit.y) <= 15 &&
        it.x > 400 &&
        /\$/.test(it.text) && /\d/.test(it.text)
      )
      .sort((a, b) => b.x - a.x);
    if (prVals.length > 0) principalReduction = parseAmount(prVals[0].text);
  }

  return {
    loanAmount,
    cashToClose,
    sectionA,
    sectionB,
    sectionC,
    sectionE,
    hoInsuranceF,
    prepaidInterest,
    hoInsuranceG,
    mortgageInsurance,
    propertyTaxes,
    cityPropertyTax,
    aggregateAdjustment,
    lenderCredit,
    payoffAmount,
    principalReduction,
  };
}

module.exports = { extractFields, parseAmount };
