import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n' // must be imported before App
import './index.css'
import App from './App.tsx'
import { detectAndApplyLocale } from './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Async country detection — runs after paint, updates language if needed
detectAndApplyLocale()
