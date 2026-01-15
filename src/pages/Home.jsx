import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loadSavedTexts, saveSavedTexts, generateId, getPreview } from '../storage'

function Home() {
  const [text, setText] = useState('')
  const [wpm, setWpm] = useState(300)
  const navigate = useNavigate()
  const savedTexts = loadSavedTexts()

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

      <div className="controls-row">
        <label className="wpm-control">
          <span>WPM: {wpm}</span>
          <input
            type="range"
            min="100"
            max="1000"
            step="25"
            value={wpm}
            onChange={(e) => setWpm(Number(e.target.value))}
          />
        </label>
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
