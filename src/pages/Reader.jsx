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

function Reader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [wpm, setWpm] = useState(location.state?.wpm || 300)
  const [showContext, setShowContext] = useState(false)
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

  // Playback interval
  useEffect(() => {
    if (isPlaying && words.length > 0) {
      const interval = 60000 / wpm
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, interval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, wpm, words.length])

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
      } else if (e.code === 'Escape') {
        goBack()
      } else if (e.code === 'KeyC') {
        toggleContext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, goBack, toggleContext, words.length])

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
        <button onClick={goBack} className="control-button">
          Back
        </button>
        <button onClick={reset} className="control-button">
          Reset
        </button>
        <button onClick={toggleContext} className={`control-button ${showContext ? 'active' : ''}`}>
          Context
        </button>
        <button onClick={togglePlay} className="control-button play-button">
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <label className="wpm-control">
          <span>{wpm} WPM</span>
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

      <p className="keyboard-hint">
        Space: play/pause | Arrows: prev/next | C: context | Esc: back
      </p>
    </div>
  )
}

export default Reader
