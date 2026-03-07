import React, { useMemo, useState } from 'react'
import { generatePracticeMcqs, generateMcqsFromExtractedText } from './quasar/generateMcqs'
import { extractTextFromImage, splitIntoParagraphs, sanitizeExtractedText } from './quasar/ocrExtractor'

function McqCard({ index, q }) {
  const ans = (q.answer || '').toUpperCase()

  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-bold tracking-widest text-slate-600 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full">
          QUESTION {index + 1}
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-sm font-bold text-indigo-600">
          {index + 1}
        </div>
      </div>

      <div className="mt-4 text-slate-900">
        <div className="whitespace-pre-line text-sm leading-7 text-slate-800 font-medium">
          {q.question}
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-800">
        {q.options?.map((opt, idx) => (
          <div
            key={opt}
            className={[
              'rounded-xl border-2 px-4 py-3 font-medium transition-all duration-200 cursor-pointer hover:shadow-md',
              opt.startsWith(`${ans}.`) 
                ? 'border-emerald-400 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-900 shadow-md' 
                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300',
            ].join(' ')}
          >
            {opt}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
          <div className="text-xs font-bold tracking-widest text-emerald-700 uppercase">
            ✓ Correct Answer
          </div>
          <div className="mt-2 text-lg font-bold text-emerald-900">
            {ans}
          </div>
        </div>

        <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4">
          <div className="text-xs font-bold tracking-widest text-blue-700 uppercase">
            💡 Why This Answer?
          </div>
          <div className="mt-2 whitespace-pre-line text-sm leading-6 text-blue-900 font-medium">
            {q.explanation}
          </div>
        </div>

        <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-4">
          <div className="text-xs font-bold tracking-widest text-amber-700 uppercase">
            🎯 Memory Trick
          </div>
          <div className="mt-2 text-sm leading-6 text-amber-900 font-medium">
            {q.memory_trick}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  // Book options organized by category
  const BOOKS = {
    Polity: [
      { id: 'laxmikanth-polity', label: 'Indian Polity — Laxmikanth' },
      { id: 'ddbasu', label: 'Introduction to Constitution — D.D. Basu' },
      { id: 'kashyap', label: 'Our Parliament — Subhash Kashyap' },
    ],
    Economy: [
      { id: 'rameshsingh', label: 'Indian Economy — Ramesh Singh' },
      { id: 'esurvey', label: 'Economic Survey' },
      { id: 'budget', label: 'Union Budget' },
    ],
    Governance: [
      { id: 'laxmikanth-governance', label: 'Governance in India — Laxmikanth' },
      { id: 'niti', label: 'NITI Aayog Reports' },
    ],
    Magazines: [
      { id: 'yojana', label: 'Yojana' },
      { id: 'kurukshetra', label: 'Kurukshetra' },
      { id: 'epw', label: 'EPW' },
    ],
  }

  // Manual mode state (existing feature)
  const [bookName, setBookName] = useState('')
  const [chapterName, setChapterName] = useState('')
  const [topic, setTopic] = useState('')
  const [paragraphNumber, setParagraphNumber] = useState(1)

  // Image/OCR mode state (new feature)
  const [selectedImage, setSelectedImage] = useState(null)
  const [extractedParagraphs, setExtractedParagraphs] = useState([])
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0)
  const [rawExtractedText, setRawExtractedText] = useState('')

  // Shared state
  const [isLoading, setIsLoading] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [error, setError] = useState('')
  const [payload, setPayload] = useState(null)
  const [mode, setMode] = useState(null) // null, 'manual', or 'ocr'

  const canStartManual = useMemo(() => {
    return bookName.trim().length > 0 && chapterName.trim().length > 0 && topic.trim().length > 0 && !isLoading && mode !== 'ocr'
  }, [bookName, chapterName, topic, isLoading, mode])

  const canStartOcr = useMemo(() => {
    return !!selectedImage && !isLoading && mode !== 'manual'
  }, [selectedImage, isLoading, mode])

  const canNext = useMemo(() => {
    return !!payload && !isLoading && !error
  }, [payload, isLoading, error])

  const canPrevious = useMemo(() => {
    return currentParagraphIndex > 0 && !!payload && !isLoading && mode === 'ocr'
  }, [currentParagraphIndex, payload, isLoading, mode])

  // Manual mode: generate for paragraph
  const generateForParagraph = async (para) => {
    if (isLoading) return

    setIsLoading(true)
    setError('')
    setPayload(null)

    try {
      const result = await generatePracticeMcqs({
        bookName: bookName.trim(),
        chapterName: chapterName.trim(),
        topic: topic.trim(),
        paragraphNumber: para,
      })
      setPayload(result)
    } catch {
      setError('Could not generate questions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Manual mode: start practice
  const onStartManualPractice = async () => {
    if (!canStartManual) return
    setMode('manual')
    const first = 1
    setParagraphNumber(first)
    await generateForParagraph(first)
  }

  // Manual mode: next concept
  const onNextManualConcept = async () => {
    if (!canNext || mode !== 'manual') return
    const next = paragraphNumber + 1
    setParagraphNumber(next)
    await generateForParagraph(next)
  }

  // OCR mode: handle image selection
  const onImageSelected = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ['image/jpeg', 'image/png']
      if (!validTypes.includes(file.type)) {
        setError('Please select a JPG or PNG image.')
        return
      }
      setSelectedImage(file)
      setError('')
      setPayload(null)
      setExtractedParagraphs([])
      setCurrentParagraphIndex(0)
      setRawExtractedText('')
    }
  }

  // OCR mode: extract text and split into paragraphs
  const onExtractAndSplit = async () => {
    if (!selectedImage || isLoading) return

    setIsLoading(true)
    setError('')
    setOcrProgress(0)
    setPayload(null)

    try {
      // Extract text from image
      const extractedText = await extractTextFromImage(selectedImage, (progress) => {
        setOcrProgress(progress)
      })

      // Sanitize and split into paragraphs
      const sanitized = sanitizeExtractedText(extractedText)
      const paragraphs = splitIntoParagraphs(sanitized)

      if (paragraphs.length === 0) {
        throw new Error('No text could be extracted from the image.')
      }

      setRawExtractedText(sanitized)
      setExtractedParagraphs(paragraphs)
      setCurrentParagraphIndex(0)
      setError('')

      // Generate MCQ for first paragraph
      await generateMcqFromExtractedParagraph(0, paragraphs)
    } catch (err) {
      setError(err.message || 'OCR extraction failed. Please try another image.')
      setExtractedParagraphs([])
      setRawExtractedText('')
    } finally {
      setIsLoading(false)
      setOcrProgress(0)
    }
  }

  // OCR mode: generate MCQ from extracted paragraph
  const generateMcqFromExtractedParagraph = async (index, paragraphs = null) => {
    const paramsToUse = paragraphs || extractedParagraphs
    if (index < 0 || index >= paramsToUse.length || isLoading) return

    setIsLoading(true)
    setError('')
    setPayload(null)

    try {
      const result = await generateMcqsFromExtractedText({
        paragraphText: paramsToUse[index],
        paragraphIndex: index,
      })
      setPayload(result)
      setCurrentParagraphIndex(index)
    } catch (err) {
      setError('Could not generate questions for this paragraph. Try the next one.')
    } finally {
      setIsLoading(false)
    }
  }

  // OCR mode: next paragraph
  const onNextOcrParagraph = async () => {
    if (!canNext || mode !== 'ocr') return
    const nextIndex = currentParagraphIndex + 1
    if (nextIndex < extractedParagraphs.length) {
      await generateMcqFromExtractedParagraph(nextIndex)
    } else {
      setError('No more paragraphs to practice.')
    }
  }

  // OCR mode: previous paragraph
  const onPreviousOcrParagraph = async () => {
    if (!canPrevious || mode !== 'ocr') return
    const prevIndex = currentParagraphIndex - 1
    if (prevIndex >= 0) {
      await generateMcqFromExtractedParagraph(prevIndex)
    }
  }

  // Reset everything
  const onReset = () => {
    setMode(null)
    setBookName('')
    setChapterName('')
    setTopic('')
    setParagraphNumber(1)
    setSelectedImage(null)
    setExtractedParagraphs([])
    setCurrentParagraphIndex(0)
    setRawExtractedText('')
    setError('')
    setPayload(null)
    setOcrProgress(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Enhanced Header */}
        <header className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
              QUASAR
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
            AI UPSC Prelims Practice Engine
          </h1>
          <p className="text-lg text-slate-300">
            Master authentic UPSC question patterns with AI-generated MCQs
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500 text-white">{'📚 Study'}</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white">{'🤖 AI Powered'}</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-500 text-white">{'✨ Pattern-Based'}</span>
          </div>
        </header>

        {/* Mode selection header and buttons */}
        {mode === null && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Choose Practice Mode</h2>
              <p className="text-slate-300">Select how you want to practice for UPSC Prelims</p>
            </div>

            {/* Two mode options side by side */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Book Page Practice */}
              <div
                onClick={() => setMode('ocr')}
                className="group cursor-pointer rounded-3xl border-2 border-purple-400 bg-gradient-to-br from-white via-purple-50 to-purple-100 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 transform"
              >
                <div className="text-5xl mb-4">📘</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Book Page Practice</h3>
                <p className="text-sm font-semibold text-purple-600 mb-3">(Recommended - our real stuff)</p>
                <p className="text-slate-700 font-medium mb-4">
                  Upload a page → MCQs generated from the exact content of your book page
                </p>
                <p className="text-sm text-slate-600 mb-6">
                  Ensure no important line of your book is missed in practice.
                </p>
                <div className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 text-center font-bold group-hover:from-purple-700 group-hover:to-purple-800 transition-all duration-200">
                  Start →
                </div>
              </div>

              {/* Topic Practice */}
              <div
                onClick={() => setMode('manual')}
                className="group cursor-pointer rounded-3xl border-2 border-indigo-400 bg-gradient-to-br from-white via-indigo-50 to-indigo-100 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 transform"
              >
                <div className="text-5xl mb-4">🧠</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Topic Practice</h3>
                <p className="text-slate-700 font-medium mb-4">
                  Select book, chapter, topic → Quick AI-generated MCQs for fast revision
                </p>
                <p className="text-sm text-slate-600 mb-6">
                  Perfect for quick revision and concept reinforcement.
                </p>
                <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 text-center font-bold group-hover:from-indigo-700 group-hover:to-indigo-800 transition-all duration-200">
                  Start →
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back button when in a mode */}
        {mode && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={onReset}
              className="rounded-full border-2 border-white bg-white bg-opacity-10 text-white px-6 py-2 text-sm font-bold hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm hover:scale-105 transform"
            >
              ← Back to Mode Selection
            </button>
          </div>
        )}

        {/* TOPIC PRACTICE SECTION */}
        {mode === 'manual' ? (
          <section className="mb-8 rounded-3xl border-2 border-indigo-400 bg-gradient-to-br from-white to-indigo-50 p-8 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
            <div className="mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">🧠 Topic Practice</h2>
                <p className="text-lg text-slate-600 mt-2">Select book, chapter, and topic for quick AI-generated MCQs</p>
              </div>
            </div>

            {mode === 'manual' && (
              <>
                <div className="mt-6 grid gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">📚 Book (required)</label>
                    <select
                      value={bookName}
                      onChange={e => setBookName(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 shadow-lg"
                    >
                      <option value="">Select a book...</option>
                      {Object.entries(BOOKS).map(([category, books]) => (
                        <optgroup key={category} label={`📖 ${category}`}>
                          {books.map(book => (
                            <option key={book.id} value={book.label}>
                              {book.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">📄 Chapter Name (required)</label>
                    <input
                      value={chapterName}
                      onChange={e => setChapterName(e.target.value)}
                      placeholder="e.g., Fundamental Rights"
                      className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 shadow-lg placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">🎯 Topic (required)</label>
                    <input
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="e.g., Writs, Article 32"
                      className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 shadow-lg placeholder-slate-400"
                    />
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-2">
                    <button
                      onClick={onStartManualPractice}
                      disabled={!canStartManual}
                      className={[
                        'rounded-xl px-8 py-3 text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform',
                        canStartManual 
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 hover:scale-105 cursor-pointer' 
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60',
                      ].join(' ')}
                    >
                      🚀 Start Practice
                    </button>

                    {payload && mode === 'manual' && (
                      <button
                        onClick={onNextManualConcept}
                        disabled={!canNext}
                        className={[
                          'rounded-xl px-8 py-3 text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform',
                          canNext 
                            ? 'bg-white text-indigo-700 border-2 border-indigo-600 hover:bg-indigo-50 hover:scale-105 cursor-pointer' 
                            : 'bg-slate-200 text-slate-500 border-2 border-slate-300 cursor-not-allowed opacity-60',
                        ].join(' ')}
                      >
                        Next Concept →
                      </button>
                    )}
                  </div>
                </div>

                {isLoading && (
                  <div className="mt-6 rounded-2xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-indigo-100 px-4 py-4 text-sm text-indigo-800 font-semibold shadow-lg">
                    ⏳ Generating UPSC-style questions...
                  </div>
                )}

                {error && mode === 'manual' && (
                  <div className="mt-6 rounded-2xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-rose-100 px-4 py-4 text-sm text-rose-800 font-semibold shadow-lg">
                    ⚠️ {error}
                  </div>
                )}
              </>
            )}
          </section>
        ) : null}

        {/* BOOK PAGE PRACTICE SECTION */}
        {mode === 'ocr' ? (
          <section className="mb-8 rounded-3xl border-2 border-purple-400 bg-gradient-to-br from-white to-purple-50 p-8 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
            <div className="mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">📘 Book Page Practice</h2>
                <p className="text-lg text-slate-600 mt-2">Upload a page from your book → MCQs generated from exact content</p>
              </div>
            </div>

            {mode === 'ocr' && (
              <>
                <p className="text-base text-slate-700 font-medium mb-6">
                  Upload a screenshot or photo of any UPSC book page. The system will extract text and generate authentic MCQs paragraph-by-paragraph.
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-800 mb-3">📸 Select Image (JPG/PNG)</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={onImageSelected}
                        disabled={isLoading || extractedParagraphs.length > 0}
                        className="block w-full text-sm text-slate-700 file:rounded-xl file:border-2 file:border-purple-400 file:bg-gradient-to-r file:from-purple-100 file:to-purple-50 file:px-6 file:py-3 file:text-sm file:font-bold file:text-purple-700 hover:file:from-purple-200 hover:file:to-purple-100 transition-all duration-200 file:cursor-pointer file:shadow-lg"
                      />
                    </div>
                    {selectedImage && (
                      <span className="px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg">✓ Ready</span>
                    )}
                  </div>
                </div>

                {selectedImage && extractedParagraphs.length === 0 && (
                  <button
                    onClick={onExtractAndSplit}
                    disabled={isLoading}
                    className={[
                      'rounded-xl px-8 py-3 text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform w-full',
                      !isLoading 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:scale-105 cursor-pointer' 
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60',
                    ].join(' ')}
                  >
                    {isLoading ? `⏳ Extracting... ${ocrProgress}%` : '🔍 Extract Text & Start'}
                  </button>
                )}

                {isLoading && ocrProgress > 0 && (
                  <div className="mt-6 rounded-2xl border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-5 shadow-lg">
                    <div className="text-sm font-bold text-purple-800 mb-3">📖 Extracting text from image...</div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-purple-200">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-700 transition-all duration-300 shadow-lg"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-purple-700 font-semibold">{ocrProgress}% complete</div>
                  </div>
                )}

                {extractedParagraphs.length > 0 && !isLoading && (
                  <div className="mt-6 rounded-2xl border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-5 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xs font-bold text-purple-700 uppercase tracking-wide">📖 Paragraph Navigation</div>
                        <div className="mt-2 text-xl font-bold text-purple-900">
                          {currentParagraphIndex + 1} <span className="text-purple-600">/</span> {extractedParagraphs.length}
                        </div>
                      </div>
                      <div className="text-4xl font-bold text-purple-300">
                        {Math.round((currentParagraphIndex + 1) / extractedParagraphs.length * 100)}%
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-purple-200 mb-4">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-700 transition-all duration-300"
                        style={{ width: `${(currentParagraphIndex + 1) / extractedParagraphs.length * 100}%` }}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={onPreviousOcrParagraph}
                        disabled={!canPrevious}
                        className={[
                          'flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-all duration-200 shadow-md',
                          canPrevious 
                            ? 'bg-white text-purple-700 border-2 border-purple-500 hover:bg-purple-50 hover:shadow-lg cursor-pointer' 
                            : 'bg-slate-200 text-slate-500 border-2 border-slate-300 cursor-not-allowed opacity-60',
                        ].join(' ')}
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={onNextOcrParagraph}
                        disabled={!canNext}
                        className={[
                          'flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-all duration-200 shadow-md',
                          canNext 
                            ? 'bg-white text-purple-700 border-2 border-purple-500 hover:bg-purple-50 hover:shadow-lg cursor-pointer' 
                            : 'bg-slate-200 text-slate-500 border-2 border-slate-300 cursor-not-allowed opacity-60',
                        ].join(' ')}
                      >
                        Next Paragraph →
                      </button>
                    </div>
                  </div>
                )}

                {error && mode === 'ocr' && (
                  <div className="mt-6 rounded-2xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-rose-100 px-6 py-4 text-sm text-rose-800 font-semibold shadow-lg">
                    ⚠️ {error}
                  </div>
                )}
              </>
            )}
          </section>
        ) : null}

        {/* RESULTS SECTION */}
        <section className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">📊 Generated Questions</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto rounded-full"></div>
          </div>

          {!payload && !isLoading && !error && mode && (
            <div className="rounded-3xl border-2 border-dashed border-white border-opacity-30 bg-white bg-opacity-5 p-8 text-center backdrop-blur-sm">
              <div className="text-4xl mb-3">💭</div>
              <div className="text-lg font-semibold text-white">
                {mode === 'manual' ? 'Select a book, chapter, and topic, then click "🚀 Start Practice"' : 'Upload an image and extract text'}
              </div>
              <p className="text-slate-300 text-sm mt-2">Questions will appear here once ready</p>
            </div>
          )}

          {!payload && !isLoading && !error && !mode && (
            <div className="rounded-3xl border-2 border-dashed border-white border-opacity-30 bg-white bg-opacity-5 p-8 text-center backdrop-blur-sm">
              <div className="text-4xl mb-3">🚀</div>
              <div className="text-lg font-semibold text-white">
                Ready to start practicing?
              </div>
              <p className="text-slate-300 text-sm mt-2 mb-6">Select a practice mode above to begin</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-full bg-white text-slate-900 px-8 py-3 font-bold hover:bg-slate-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                ← Back to Homepage
              </button>
            </div>
          )}

          {payload && (
            <div className="space-y-6">
              <div className="rounded-3xl border-2 border-gradient-to-r border-indigo-400 bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 shadow-2xl">
                <div className="text-xs font-bold tracking-widest text-indigo-700 uppercase">
                  {mode === 'ocr' ? '📖 Paragraph Source' : '🎯 Concept Source'}
                </div>
                <div className="mt-3 text-xl font-bold text-indigo-900">
                  {payload.concept_source}
                </div>
              </div>

              {payload.questions.map((q, idx) => (
                <McqCard key={idx} index={idx} q={q} />
              ))}
            </div>
          )}
        </section>

        <footer className="mt-16 border-t border-white border-opacity-20 pt-8 text-center text-sm text-slate-300">
          <p className="font-semibold text-white mb-2">✨ Quasar: AI-Powered UPSC Prelims Practice</p>
          <p>Questions are generated using authentic UPSC patterns for optimal learning</p>
        </footer>
      </div>
    </div>
  )
}

