import { useState } from 'react'
import Sidebar from './Sidebar'
import Dashboard from './Dashboard'

function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleUpload = async (file) => {
    setLoading(true)
    setError(null)
    try {
      const body = new FormData()
      body.append('pdf', file)
      const res = await fetch('/api/analyze', { method: 'POST', body })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Analysis failed')
      }
      setResults(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar
        onUpload={handleUpload}
        loading={loading}
        error={error}
        hasResults={!!results}
        onReset={() => { setResults(null); setError(null) }}
      />
      <main className="flex-1 overflow-y-auto">
        {results ? (
          <Dashboard data={results} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-400">No Document Loaded</h2>
              <p className="text-sm text-slate-600 mt-2 max-w-xs mx-auto">
                Upload a Closing Disclosure PDF using the sidebar to begin analysis.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
