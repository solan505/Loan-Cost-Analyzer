import FieldRow, { fmt } from './FieldRow'

export default function EscrowSummary({ part2 }) {
  const loan = part2.loanAmount
  const payoff = part2.payoffAmount
  const pr = part2.principalReduction
  const excess = Math.round((payoff + pr - loan) * 100) / 100

  const hoF = part2.hoInsuranceF
  const pi = part2.prepaidInterest
  const prepaid = Math.round((hoF + pi) * 100) / 100

  const hoG = part2.hoInsuranceG
  const mi = part2.mortgageInsurance
  const pt = part2.propertyTaxes
  const ct = part2.cityPropertyTax
  const agg = part2.aggregateAdjustment
  const escrow = Math.round((hoG + mi + pt + ct + agg) * 100) / 100

  const escPrepaid = Math.round((escrow + prepaid) * 100) / 100
  const escPrepaidExcess = Math.round((escPrepaid + excess) * 100) / 100
  const ctc = part2.cashToClose
  const benefit = Math.round((escPrepaidExcess - ctc) * 100) / 100

  const isPos = benefit >= 0
  const benefitBg = isPos ? 'bg-teal-500/10' : 'bg-red-500/10'
  const benefitText = isPos ? 'text-teal-400' : 'text-red-400'

  return (
    <div className="card overflow-hidden animate-slide-up delay-150">
      {/* Header */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Part 2 — Savings Depicted by Escrows & Payoff</h2>
            <p className="text-xs text-slate-500 mt-0.5">Escrow & Payoff breakdown</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-800/60">
        <FieldRow label="Loan Amount (Page 5)" value={loan} />
        <FieldRow label="Payoff Amount (Page 3, Summed)" value={payoff} />
        <FieldRow label="Principal Reduction" value={pr} />
        <FieldRow label="Excess Amount over Payoff" value={excess} bold />

        {/* Section F */}
        <div className="flex items-center gap-2 py-2.5 px-5 bg-teal-500/5">
          <div className="w-0.5 h-4 bg-teal-500 rounded-full" />
          <span className="text-teal-400 text-[11px] font-bold uppercase tracking-widest">Prepaid (Section F)</span>
        </div>
        <FieldRow label="Home Owners Insurance" value={hoF} sub />
        <FieldRow label="Prepaid Interest" value={pi} sub />
        <FieldRow label="Prepaid (Section F)" value={prepaid} bold />

        {/* Section G */}
        <div className="flex items-center gap-2 py-2.5 px-5 bg-cyan-500/5">
          <div className="w-0.5 h-4 bg-cyan-500 rounded-full" />
          <span className="text-cyan-400 text-[11px] font-bold uppercase tracking-widest">Escrows (Section G)</span>
        </div>
        <FieldRow label="01 Homeowner's Insurance" value={hoG} sub />
        <FieldRow label="02 Mortgage Insurance per month" value={mi} sub />
        <FieldRow label="03 Property Taxes" value={pt} sub />
        <FieldRow label="04 City Property Tax" value={ct} sub />
        <FieldRow label="Aggregate Adjustment" value={agg} sub negative />
        <FieldRow label="Escrows (Section G)" value={escrow} bold />

        <FieldRow label="Escrows + Prepaid" value={escPrepaid} bold />
        <FieldRow label="Escrows + Prepaid + Excess Payoff" value={escPrepaidExcess} bold />
        <FieldRow label="Cash to Close (Page 1)" value={ctc} />

        {/* Benefit row */}
        <div className={`${benefitBg} px-5 py-4 flex justify-between items-center`}>
          <span className={`font-bold ${benefitText} text-sm flex items-center gap-2`}>
            {isPos ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
            Benefits
          </span>
          <span className={`font-bold ${benefitText} font-num text-base`}>
            {fmt(benefit)}
          </span>
        </div>
      </div>
    </div>
  )
}
