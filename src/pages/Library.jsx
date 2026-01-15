import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadSavedTexts, saveSavedTexts } from '../storage'
import '../About.css'

function Library() {
  const [savedTexts, setSavedTexts] = useState(loadSavedTexts)

  const deleteText = (id, e) => {
    e.stopPropagation()
    e.preventDefault()
    const updated = savedTexts.filter(t => t.id !== id)
    setSavedTexts(updated)
    saveSavedTexts(updated)
  }

  return (
    <div className="container library-container">
      <Link to="/" className="back-link" title="Return to the home page">
        Back to Home
      </Link>

      <h1 className="library-title">Saved Texts</h1>

      {savedTexts.length === 0 ? (
        <p className="library-empty">No saved texts yet. Start reading something!</p>
      ) : (
        <div className="library-list">
          {savedTexts.map(item => {
            const progressPercent = Math.round((item.progress / item.totalWords) * 100)
            const isComplete = item.progress >= item.totalWords - 1
            return (
              <Link
                key={item.id}
                to={`/read/${item.id}`}
                className="library-item"
                title="Continue reading this text"
              >
                <div className="library-item-content">
                  <p className="library-item-preview">{item.preview}</p>
                  <div className="library-item-meta">
                    <span className={`library-item-progress ${isComplete ? 'complete' : ''}`}>
                      {isComplete ? 'Complete' : `${progressPercent}%`}
                    </span>
                    <span className="library-item-words">
                      {item.totalWords} words
                    </span>
                  </div>
                </div>
                <button
                  className="library-item-delete"
                  onClick={(e) => deleteText(item.id, e)}
                  title="Remove this text from your library"
                >
                  ×
                </button>
              </Link>
            )
          })}
        </div>
      )}

      <Link to="/about" className="about-link" title="Learn about RSVP speed reading">
        How does this work?
      </Link>
    </div>
  )
}

export default Library
