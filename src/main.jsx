import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Library from './pages/Library'
import About from './pages/About'
import Reader from './pages/Reader'
import './index.css'
import './App.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/about" element={<About />} />
        <Route path="/read/:id" element={<Reader />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
