const STORAGE_KEY = 'lectio-saved-texts'

export function loadSavedTexts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function saveSavedTexts(texts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(texts))
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function getPreview(text, maxLength = 60) {
  const cleaned = text.trim().replace(/\s+/g, ' ')
  if (cleaned.length <= maxLength) return cleaned
  return cleaned.substring(0, maxLength).trim() + '...'
}
