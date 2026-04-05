import { useEffect } from 'react'
import CostBreakdown from './CostBreakdown'
import EscrowSummary from './EscrowSummary'
import { setExportData } from './ExportButton'

export default function Dashboard({ data }) {
  // Pass data to ExportButton via shared ref
  useEffect(() => {
    setExportData(data)
    return () => setExportData(null)
  }, [data])

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Title bar */}
      <div className="mb-8 animate-slide-up">
        <p className="text-[11px] font-semibold text-teal-400 uppercase tracking-widest mb-1">
          Reference Output
        </p>
        <h1 className="text-2xl font-bold text-white">
          Sample Benefits Summary
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          This is the expected output for the provided sample Closing Disclosure. Your solution should
          produce values that match these results. Use this as a reference to validate your extraction
          and calculation logic.
        </p>
      </div>

      {/* Two-column cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostBreakdown part1={data.part1} />
        <EscrowSummary part2={data.part2} />
      </div>

      <p className="text-center mt-8 text-xs text-slate-600">
        Values extracted from Closing Disclosure document
      </p>
    </div>
  )
}
