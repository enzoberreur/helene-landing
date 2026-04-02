import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import { initialLocale } from './i18n'
import { useLocaleSync } from './hooks/useLocaleSync'

function LocaleRoutes() {
  useLocaleSync()
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Locale-prefixed routes */}
        <Route path="/fr/*" element={<LocaleRoutes />} />
        <Route path="/en/*" element={<LocaleRoutes />} />

        {/* Root — redirect to detected locale */}
        <Route path="/" element={<Navigate to={`/${initialLocale}/`} replace />} />
        <Route path="/about" element={<Navigate to={`/${initialLocale}/about`} replace />} />

        {/* Catch-all — redirect to detected locale */}
        <Route path="*" element={<Navigate to={`/${initialLocale}/`} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
