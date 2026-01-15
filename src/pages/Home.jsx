import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loadSavedTexts, saveSavedTexts, generateId, getPreview } from '../storage'
import { parseEPUB } from '../epub'

function Home() {
  const [text, setText] = useState('')
  const [wpm, setWpm] = useState(300)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const savedTexts = loadSavedTexts()

  const adjustWpm = (delta) => {
    setWpm(prev => Math.min(1000, Math.max(100, prev + delta)))
  }

  const sampleText = `Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, "and what is the use of a book," thought Alice "without pictures or conversations?"

So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.

There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, "Oh dear! Oh dear! I shall be late!" (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.`

  const loadSample = () => {
    setText(sampleText)
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const { title, text: epubText } = await parseEPUB(file)

      const cleanedWords = epubText
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 0)

      if (cleanedWords.length === 0) {
        throw new Error('No readable text found in EPUB')
      }

      const newText = {
        id: generateId(),
        text: epubText,
        preview: title || getPreview(epubText),
        progress: 0,
        totalWords: cleanedWords.length,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      const updated = [newText, ...savedTexts]
      saveSavedTexts(updated)

      navigate(`/read/${newText.id}`, { state: { wpm } })
    } catch (err) {
      setError(err.message || 'Failed to parse EPUB file')
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const startReading = () => {
    const cleanedWords = text
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0)

    if (cleanedWords.length === 0) return

    const newText = {
      id: generateId(),
      text: text,
      preview: getPreview(text),
      progress: 0,
      totalWords: cleanedWords.length,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const updated = [newText, ...savedTexts]
    saveSavedTexts(updated)

    navigate(`/read/${newText.id}`, { state: { wpm } })
  }

  return (
    <div className="container">
      <h1 className="title">Lectio</h1>
      <p className="subtitle">Speed reading, one word at a time</p>

      <textarea
        className="text-input"
        placeholder="Paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
      />

      {!text.trim() && (
        <div className="text-options">
          <button className="sample-button" onClick={loadSample}>
            Try a sample
          </button>
          <span className="text-options-divider">or</span>
          <label className="sample-button epub-button">
            {loading ? 'Loading...' : 'Upload EPUB'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".epub"
              onChange={handleFileSelect}
              disabled={loading}
              hidden
            />
          </label>
        </div>
      )}

      {error && (
        <p className="error-message">{error}</p>
      )}

      <div className="controls-row">
        <div className="wpm-control">
          <button
            className="wpm-button"
            onClick={() => adjustWpm(-25)}
            disabled={wpm <= 100}
          >
            −
          </button>
          <div className="wpm-display">
            <span className="wpm-value">{wpm}</span>
            <span className="wpm-label">WPM</span>
          </div>
          <button
            className="wpm-button"
            onClick={() => adjustWpm(25)}
            disabled={wpm >= 1000}
          >
            +
          </button>
        </div>
      </div>

      <button
        className="start-button"
        onClick={startReading}
        disabled={!text.trim()}
      >
        Start Reading
      </button>

      {savedTexts.length > 0 && (
        <Link to="/library" className="library-link">
          View Saved Texts ({savedTexts.length})
        </Link>
      )}

      <Link to="/about" className="about-link">
        How does this work?
      </Link>
    </div>
  )
}

export default Home
