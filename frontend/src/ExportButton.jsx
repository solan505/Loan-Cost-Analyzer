import jsPDF from 'jspdf'

// This component reads data from a global ref set by Dashboard
let exportDataRef = null
export function setExportData(data) { exportDataRef = data }

const fmt = (v) => {
  const num = typeof v === 'number' ? v : parseFloat(v) || 0
  const abs = Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return num < 0 ? `-$${abs}` : `$${abs}`
}

export default function ExportButton() {
  const generatePDF = () => {
    const data = exportDataRef
    if (!data) return

    const { part1, part2 } = data

    // Recalculate from raw values (same logic as components)
    const sD = part1.sectionA + part1.sectionB + part1.sectionC
    const totalCost = sD + part1.sectionE
    const benefit1 = Math.round((totalCost + part1.lenderCredit) * 100) / 100

    const excess = Math.round((part2.payoffAmount + part2.principalReduction - part2.loanAmount) * 100) / 100
    const prepaid = Math.round((part2.hoInsuranceF + part2.prepaidInterest) * 100) / 100
    const escrow = Math.round((part2.hoInsuranceG + part2.mortgageInsurance + part2.propertyTaxes + part2.cityPropertyTax + part2.aggregateAdjustment) * 100) / 100
    const escPrepaid = Math.round((escrow + prepaid) * 100) / 100
    const escPrepaidExcess = Math.round((escPrepaid + excess) * 100) / 100
    const benefit2 = Math.round((escPrepaidExcess - part2.cashToClose) * 100) / 100

    const doc = new jsPDF()
    const pageW = doc.internal.pageSize.getWidth()
    let y = 20

    doc.setFontSize(18)
    doc.setTextColor(20, 184, 166)
    doc.text('Loan Cost Analyzer', 14, y)
    doc.setTextColor(148, 163, 184)
    doc.setFontSize(11)
    doc.text('Benefits Summary Report', 14, y + 7)
    y += 20

    const row = (label, value, isBold) => {
      doc.setFontSize(10)
      doc.setTextColor(isBold ? 226 : 148, isBold ? 232 : 163, isBold ? 240 : 184)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      doc.text(label, 16, y)
      doc.text(fmt(value), pageW - 16, y, { align: 'right' })
      y += 6
    }

    const header = (text) => {
      doc.setFontSize(10)
      doc.setTextColor(20, 184, 166)
      doc.setFont('helvetica', 'bold')
      doc.text(text, 14, y)
      y += 7
    }

    // Part 1
    doc.setFontSize(13)
    doc.setTextColor(226, 232, 240)
    doc.setFont('helvetica', 'bold')
    doc.text('Part 1 — Savings Depicted by Cost', 14, y)
    y += 10
    header('LOAN COST')
    row('Origination Charges', part1.sectionA)
    row('Services You Cannot Shop For', part1.sectionB)
    row('Services You Can Shop For', part1.sectionC)
    row('Total Loan Costs (Sum)', sD, true)
    row('Taxes & Gov. Fees', part1.sectionE)
    row('Total Cost of Loan', totalCost, true)
    row('Lenders Credit', part1.lenderCredit)
    row('Benefits (Cost)', benefit1, true)
    y += 8

    // Part 2
    doc.setFontSize(13)
    doc.setTextColor(226, 232, 240)
    doc.setFont('helvetica', 'bold')
    doc.text('Part 2 — Savings Depicted by Escrows & Payoff', 14, y)
    y += 10
    row('Loan Amount', part2.loanAmount)
    row('Payoff Amount (Summed)', part2.payoffAmount)
    row('Principal Reduction', part2.principalReduction)
    row('Excess Amount over Payoff', excess, true)
    y += 3
    header('PREPAID (SECTION F)')
    row('Home Owners Insurance', part2.hoInsuranceF)
    row('Prepaid Interest', part2.prepaidInterest)
    row('Prepaid (Section F)', prepaid, true)
    y += 3
    header('ESCROWS (SECTION G)')
    row("01 Homeowner's Insurance", part2.hoInsuranceG)
    row('02 Mortgage Insurance per month', part2.mortgageInsurance)
    row('03 Property Taxes', part2.propertyTaxes)
    row('04 City Property Tax', part2.cityPropertyTax)
    row('Aggregate Adjustment', part2.aggregateAdjustment)
    row('Escrows (Section G)', escrow, true)
    y += 3
    row('Escrows + Prepaid', escPrepaid, true)
    row('Escrows + Prepaid + Excess Payoff', escPrepaidExcess, true)
    row('Cash to Close', part2.cashToClose)
    row('Benefits (Escrow)', benefit2, true)

    doc.save('loan-cost-analysis.pdf')
  }

  return (
    <button
      onClick={generatePDF}
      className="w-full px-4 py-2.5 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors flex items-center justify-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Export PDF
    </button>
  )
}
