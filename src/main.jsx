import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import AnswerFrameworkPrototype from '../answer-framework-v8.jsx'
import AnswerFrameworkDocs from '../answer-framework-docs.jsx'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AnswerFrameworkPrototype />} />
        <Route path="/docs" element={<AnswerFrameworkDocs />} />
      </Routes>

      {/* Navigation links */}
      <nav className="fixed top-4 right-4 z-[100] flex gap-2">
        <Link
          to="/"
          className="px-3 py-1.5 bg-white/90 backdrop-blur text-gray-700 text-sm rounded-lg shadow-md hover:bg-white transition-colors"
        >
          Prototype
        </Link>
        <Link
          to="/docs"
          className="px-3 py-1.5 bg-white/90 backdrop-blur text-gray-700 text-sm rounded-lg shadow-md hover:bg-white transition-colors"
        >
          Docs
        </Link>
      </nav>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
