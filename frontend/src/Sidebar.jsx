import { useRef, useState } from 'react'
import ExportButton from './ExportButton'

export default function Sidebar({ onUpload, loading, error, hasResults, onReset }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState(null)

  const pick = (file) => {
    if (file && file.type === 'application/pdf') {
      setFileName(file.name)
      onUpload(file)
    }
  }

  return (
    <aside className="w-72 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Brand */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-teal-500/15 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Loan Cost</h1>
            <p className="text-xs text-teal-400 font-medium -mt-0.5">Analyzer</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800" />

      {/* Upload area */}
      <div className="px-5 py-6 flex-1">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Document
        </p>
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-teal-400/60 bg-teal-500/5'
              : 'border-slate-700 hover:border-teal-500/40 hover:bg-slate-800/40'
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files[0]) }}
        >
          <div className="flex justify-center mb-3">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
              loading ? 'bg-teal-500/10' : 'bg-slate-800'
            }`}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              )}
            </div>
          </div>
          <p className="text-sm font-medium text-slate-300">
            {loading ? 'Analyzing...' : 'Drop PDF here'}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            or <span className="text-teal-400 font-medium">browse</span>
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => pick(e.target.files[0])}
          />
        </div>

        {fileName && (
          <div className="mt-3 flex items-center gap-2 bg-slate-800/60 text-teal-300 text-xs font-medium px-3 py-2 rounded-lg">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="truncate">{fileName}</span>
          </div>
        )}

        {error && (
          <div className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="px-5 pb-6 space-y-2">
        {hasResults && (
          <>
            <ExportButton />
            <button
              onClick={onReset}
              className="w-full px-4 py-2.5 text-sm font-medium bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
            >
              Upload New
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
