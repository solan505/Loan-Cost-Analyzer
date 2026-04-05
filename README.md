# Loan Cost Analyzer

Extracts values from a Closing Disclosure (CD) mortgage PDF and computes two benefit summaries — one from loan costs, one from escrows and payoff.

## Run It

**Requires:** Node.js v20+

```bash
# Terminal 1
cd backend && npm install && node server.js

# Terminal 2
cd frontend && npm install && npm run dev
```

Open **http://localhost:5173**, upload a CD PDF, and view the results.

## How It Works

The analyzer uses a three-phase pipeline to process Closing Disclosure PDFs:

### Phase 1 — Section Detection (`sectionDetector.js`)
Reads every text element from the PDF along with its x,y position and identifies:
- All section header boundaries (A through J, Loan Terms, Costs at Closing)
- The "At Closing" column x-range for value extraction

### Phase 2 — Field Extraction (`fieldExtractor.js`)
Within each detected section, extracts all monetary values:
- Section totals (Origination Charges, Services, Taxes)
- Sub-field values (Homeowners Insurance, Prepaid Interest, etc.)
- Payoff and payment line items
- Lender credits and aggregate adjustments

### Phase 3 — Summary Computation (`summaryComputer.js`)
Applies the benefit formulas to compute Part 1 (Cost) and Part 2 (Escrow) summaries.

## Calculations

**Part 1 — Savings Depicted by Cost**

| Field | How |
|-------|-----|
| Origination Charges (A) | Extracted from "At Closing" column |
| Services Borrower Did Not Shop For (B) | Extracted from "At Closing" column |
| Services Borrower Did Shop For (C) | Extracted from "At Closing" column |
| Total Loan Costs (D) | A + B + C |
| Taxes & Gov. Fees (E) | Extracted from "At Closing" column |
| Total Cost of Loan | D + E |
| Lenders Credit | Extracted from Section J (negative value) |
| **Benefits (Cost)** | **Total Cost of Loan + Lenders Credit** |

**Part 2 — Savings Depicted by Escrows & Payoff**

| Field | How |

| Loan Amount | Extracted from Loan Terms section |
| Payoff Amount | Sum of ALL "Payoff to..." lines |
| Principal Reduction | Separate "Principal Reduction to Consumer" line |
| Excess Amount over Payoff | Payoff + Principal Reduction - Loan Amount |
| Prepaid (F) | Homeowners Insurance + Prepaid Interest |
| Escrows (G) | Homeowners Insurance + Mortgage Ins + Property Taxes + City Tax + Aggregate Adjustment |
| Escrows + Prepaid + Excess | Section G + Section F + Excess Amount |
| Cash to Close | Extracted from Costs at Closing section |
| **Benefits (Escrow)** | **(Escrows + Prepaid + Excess) - Cash to Close** |

## Tech Stack

| Frontend | React, Tailwind CSS |
| Backend | Node.js, Express |
| PDF Parsing | pdfjs-dist — spatial x,y coordinate matching |
| PDF Export | jsPDF |

## Project Structure

```
backend/
  server.js              — Express server, /api/analyze endpoint
  sectionDetector.js     — Phase 1: detect section boundaries and columns
  fieldExtractor.js      — Phase 2: extract monetary values per section
  summaryComputer.js     — Phase 3: compute benefit formulas
frontend/
  src/
    App.jsx              — Sidebar + dashboard layout
    Sidebar.jsx          — Branding + drag-and-drop upload
    Dashboard.jsx        — Results container
    CostBreakdown.jsx    — Part 1 cost analysis card
    EscrowSummary.jsx    — Part 2 escrow analysis card
    FieldRow.jsx         — Reusable data row component
    ExportButton.jsx     — PDF export functionality
```
