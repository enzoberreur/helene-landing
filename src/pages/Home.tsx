import { useEffect } from 'react'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Stats from '../components/Stats'
import Community from '../components/Community'
import CTA from '../components/CTA'
import Footer from '../components/Footer'
import { trackLanding } from '../analytics'

export default function Home() {
  useEffect(() => { trackLanding.pageView() }, [])
  return (
    <>
      <Hero />
      <Features />
      <Community />
      <Stats />
      <CTA />
      <Footer />
    </>
  )
}
