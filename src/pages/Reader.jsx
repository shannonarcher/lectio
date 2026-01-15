import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { loadSavedTexts, saveSavedTexts } from '../storage'

function getORPIndex(word) {
  const len = word.length
  if (len <= 1) return 0
  if (len <= 3) return 1
  if (len <= 5) return 2
  if (len <= 9) return 3
  if (len <= 13) return 4
  return 5
}

// Common words that can be read quickly
const COMMON_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'into', 'your', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now',
  'its', 'our', 'two', 'way', 'had', 'was', 'were', 'been', 'has', 'is',
  'am', 'are', 'did', 'does', 'done', 'got', 'went', 'come', 'came', 'said',
  'very', 'after', 'most', 'also', 'made', 'did', 'many', 'before', 'must', 'through',
  'back', 'years', 'where', 'much', 'your', 'may', 'well', 'down', 'should', 'because',
  'each', 'just', 'those', 'people', 'how', 'too', 'any', 'same', 'us', 'need'
])

// Calculate delay multiplier for a word
function getDelayMultiplier(word) {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '')
  let multiplier = 1

  // Common words are faster
  if (COMMON_WORDS.has(cleaned)) {
    multiplier *= 0.8
  }

  // Longer words need more time
  const len = cleaned.length
  if (len <= 3) {
    multiplier *= 0.9
  } else if (len <= 5) {
    multiplier *= 1.0
  } else if (len <= 8) {
    multiplier *= 1.15
  } else if (len <= 12) {
    multiplier *= 1.3
  } else {
    multiplier *= 1.5
  }

  // Pause slightly at end of sentences
  if (/[.!?]$/.test(word)) {
    multiplier *= 1.5
  } else if (/[,;:]$/.test(word)) {
    multiplier *= 1.2
  }

  return multiplier
}

function Reader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [wpm, setWpm] = useState(location.state?.wpm || 300)
  const [showContext, setShowContext] = useState(false)
  const [variableTiming, setVariableTiming] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const intervalRef = useRef(null)
  const textIdRef = useRef(id)

  // Load text on mount
  useEffect(() => {
    const savedTexts = loadSavedTexts()
    const savedText = savedTexts.find(t => t.id === id)

    if (!savedText) {
      setNotFound(true)
      return
    }

    const cleanedWords = savedText.text
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0)

    setWords(cleanedWords)
    setCurrentIndex(savedText.progress || 0)
    setIsPlaying(true)
  }, [id])

  const currentWord = words[currentIndex] || ''
  const orpIndex = getORPIndex(currentWord)

  const beforeORP = currentWord.slice(0, orpIndex)
  const orpLetter = currentWord[orpIndex] || ''
  const afterORP = currentWord.slice(orpIndex + 1)

  // Save progress
  useEffect(() => {
    if (words.length > 0) {
      const savedTexts = loadSavedTexts()
      const updated = savedTexts.map(t =>
        t.id === textIdRef.current
          ? { ...t, progress: currentIndex, updatedAt: Date.now() }
          : t
      )
      saveSavedTexts(updated)
    }
  }, [currentIndex, words.length])

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  const reset = useCallback(() => {
    setCurrentIndex(0)
    setIsPlaying(false)
  }, [])

  const goBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  const toggleContext = useCallback(() => {
    setShowContext(prev => {
      if (!prev) setIsPlaying(false)
      return !prev
    })
  }, [])

  const toggleVariableTiming = useCallback(() => {
    setVariableTiming(prev => !prev)
  }, [])

  const adjustWpm = useCallback((delta) => {
    setWpm(prev => Math.min(1000, Math.max(100, prev + delta)))
  }, [])

  // Playback with variable timing
  useEffect(() => {
    if (!isPlaying || words.length === 0) {
      return
    }

    const scheduleNext = () => {
      const currentWord = words[currentIndex]
      if (!currentWord) return

      const baseInterval = 60000 / wpm
      const multiplier = variableTiming ? getDelayMultiplier(currentWord) : 1
      const delay = baseInterval * multiplier

      intervalRef.current = setTimeout(() => {
        setCurrentIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, delay)
    }

    scheduleNext()

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [isPlaying, wpm, words, currentIndex, variableTiming])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.code === 'ArrowLeft') {
        setCurrentIndex(prev => Math.max(0, prev - 1))
      } else if (e.code === 'ArrowRight') {
        setCurrentIndex(prev => Math.min(words.length - 1, prev + 1))
      } else if (e.code === 'ArrowUp') {
        e.preventDefault()
        adjustWpm(25)
      } else if (e.code === 'ArrowDown') {
        e.preventDefault()
        adjustWpm(-25)
      } else if (e.code === 'Escape') {
        goBack()
      } else if (e.code === 'KeyC') {
        toggleContext()
      } else if (e.code === 'KeyV') {
        toggleVariableTiming()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, goBack, toggleContext, toggleVariableTiming, adjustWpm, words.length])

  if (notFound) {
    return (
      <div className="container">
        <h1 className="title">Lectio</h1>
        <p className="subtitle">Text not found</p>
        <button className="start-button" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="container">
        <h1 className="title">Lectio</h1>
        <p className="subtitle">Loading...</p>
      </div>
    )
  }

  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0

  return (
    <div className="reader-container">
      <div className="reader-display">
        <div className="focus-line">
          <div className="marker"></div>
        </div>
        <div className="word-display">
          <span className="before-orp">{beforeORP}</span>
          <span className="orp-letter">{orpLetter}</span>
          <span className="after-orp">{afterORP}</span>
        </div>
      </div>

      {showContext && (
        <div className="context-panel">
          <p className="context-text">
            {words.slice(Math.max(0, currentIndex - 15), currentIndex).map((word, i) => (
              <span key={i} className="context-word before">{word} </span>
            ))}
            <span className="context-word current">{words[currentIndex]}</span>
            {words.slice(currentIndex + 1, currentIndex + 6).map((word, i) => (
              <span key={i} className="context-word after"> {word}</span>
            ))}
          </p>
        </div>
      )}

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="reader-controls">
        <button onClick={goBack} className="control-button" title="Return to home page (Esc)">
          Back
        </button>
        <button onClick={reset} className="control-button" title="Start over from the beginning">
          Reset
        </button>
        <button onClick={toggleContext} className={`control-button ${showContext ? 'active' : ''}`} title="Show surrounding words for context (C)">
          Context
        </button>
        <button onClick={toggleVariableTiming} className={`control-button ${variableTiming ? 'active' : ''}`} title="Adjust timing based on word complexity (V)">
          Variable
        </button>
        <button onClick={togglePlay} className="control-button play-button" title={isPlaying ? 'Pause reading (Space)' : 'Start reading (Space)'}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <div className="wpm-control">
          <button
            className="wpm-button"
            onClick={() => adjustWpm(-25)}
            disabled={wpm <= 100}
            title="Decrease speed by 25 WPM (↓)"
          >
            −
          </button>
          <div className="wpm-display" title="Words per minute">
            <span className="wpm-value">{wpm}</span>
            <span className="wpm-label">WPM</span>
          </div>
          <button
            className="wpm-button"
            onClick={() => adjustWpm(25)}
            disabled={wpm >= 1000}
            title="Increase speed by 25 WPM (↑)"
          >
            +
          </button>
        </div>
      </div>

      <p className="keyboard-hint">
        Space: play/pause | ←→: words | ↑↓: speed | C: context | V: variable timing | Esc: back
      </p>
    </div>
  )
}

export default Reader
