const fmt = (v) => {
  const num = typeof v === 'number' ? v : parseFloat(v) || 0
  const abs = Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return num < 0 ? `-$${abs}` : `$${abs}`
}

export default function FieldRow({ label, value, bold, sub, negative }) {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0
  const isNeg = num < 0

  let valClass = 'text-slate-200'
  if (negative || isNeg) valClass = 'text-red-400'
  else if (bold) valClass = 'text-white'

  return (
    <div className={`field-row flex justify-between items-center py-3 px-5 ${
      bold ? 'bg-slate-800/30' : ''
    } ${sub ? 'pl-9' : ''}`}>
      <span className={`text-sm ${bold ? 'font-semibold text-slate-200' : 'text-slate-400'}`}>
        {label}
      </span>
      <span className={`font-num font-semibold text-sm ${valClass}`}>
        {fmt(value)}
      </span>
    </div>
  )
}

export { fmt }
