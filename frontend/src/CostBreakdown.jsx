import FieldRow, { fmt } from './FieldRow'

export default function CostBreakdown({ part1 }) {
  const sA = part1.sectionA
  const sB = part1.sectionB
  const sC = part1.sectionC
  const sD = sA + sB + sC
  const sE = part1.sectionE
  const totalCost = sD + sE
  const lc = part1.lenderCredit
  const benefit = Math.round((totalCost + lc) * 100) / 100

  const isNeg = benefit < 0
  const benefitBg = isNeg ? 'bg-red-500/10' : 'bg-teal-500/10'
  const benefitText = isNeg ? 'text-red-400' : 'text-teal-400'

  return (
    <div className="card overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Part 1 — Savings Depicted by Cost</h2>
            <p className="text-xs text-slate-500 mt-0.5">How Benefits are received</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-800/60">
        {/* Section: Loan Cost */}
        <div className="flex items-center gap-2 py-2.5 px-5 bg-teal-500/5">
          <div className="w-0.5 h-4 bg-teal-500 rounded-full" />
          <span className="text-teal-400 text-[11px] font-bold uppercase tracking-widest">Loan Cost</span>
        </div>

        <FieldRow label="Origination Charges" value={sA} />
        <FieldRow label="Services You Cannot Shop For" value={sB} />
        <FieldRow label="Services You Can Shop For" value={sC} />
        <FieldRow label="Total Loan Costs (Sum)" value={sD} bold />
        <FieldRow label="Taxes & Gov. Fees" value={sE} />
        <FieldRow label="Total Cost of Loan" value={totalCost} bold />
        <FieldRow label="Lenders Credit" value={lc} negative />

        {/* Benefit row */}
        <div className={`${benefitBg} px-5 py-4 flex justify-between items-center`}>
          <span className={`font-bold ${benefitText} text-sm flex items-center gap-2`}>
            {isNeg ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            Benefits
          </span>
          <span className={`font-bold ${benefitText} font-num text-base`}>
            {benefit < 0 ? `(${fmt(Math.abs(benefit))})` : fmt(benefit)}
          </span>
        </div>
      </div>
    </div>
  )
}
