import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Survey from './pages/Survey'
import WebApp from './webapp/WebApp'
import Dashboard from './pages/Dashboard'
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

function SurveyRoute() {
  useLocaleSync()
  return <Survey />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Locale-prefixed routes */}
        <Route path="/fr/*" element={<LocaleRoutes />} />
        <Route path="/en/*" element={<LocaleRoutes />} />

        {/* Survey — no navbar, standalone page */}
        <Route path="/fr/survey" element={<SurveyRoute />} />
        <Route path="/en/survey" element={<SurveyRoute />} />
        <Route path="/survey" element={<Navigate to={`/${initialLocale}/survey`} replace />} />

        {/* Web App — iPhone-framed co-design prototype */}
        <Route path="/app" element={<WebApp />} />

        {/* Admin dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Root — redirect to detected locale */}
        <Route path="/" element={<Navigate to={`/${initialLocale}/`} replace />} />
        <Route path="/about" element={<Navigate to={`/${initialLocale}/about`} replace />} />

        {/* Catch-all — redirect to detected locale */}
        <Route path="*" element={<Navigate to={`/${initialLocale}/`} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
