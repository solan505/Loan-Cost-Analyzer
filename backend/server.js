const express = require('express')
const multer = require('multer')
const cors = require('cors')
const { detectSections } = require('./sectionDetector')
const { extractFields } = require('./fieldExtractor')
const { computeBenefits } = require('./summaryComputer')

const app = express()
const PORT = 3001

app.use(cors())

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    file.mimetype === 'application/pdf'
      ? cb(null, true)
      : cb(new Error('Only PDF files are accepted'))
  },
})

// Single endpoint: upload PDF → analyze → return summary
app.post('/api/analyze', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file provided' })

    // Phase 1: detect sections and column
    const { items, column, headers } = await detectSections(req.file.buffer)
    console.log('Phase 1 — sections detected')

    // Phase 2: extract field values
    const fields = extractFields(items, column, headers)
    console.log('Phase 2 — fields extracted')

    // Phase 3: compute benefit summaries
    const result = computeBenefits(fields)
    console.log('Phase 3 — benefits computed')

    res.json(result)
  } catch (err) {
    console.error('Analysis failed:', err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
