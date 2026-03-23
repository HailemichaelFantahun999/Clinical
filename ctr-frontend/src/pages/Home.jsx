import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import logoFallback from '../assets/images/logo.png'
import bgFallback from '../assets/images/background.png'
import '../styles/home.css'

const WORDS = ['Register', 'Review', 'Publish']

export default function Home() {
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5, active: false })
  const [logoSrc, setLogoSrc] = useState('/dist/assets/images/logo.jpeg')
  const [bgSrc, setBgSrc] = useState('/dist/assets/images/background.jpeg')
  const [wordIndex, setWordIndex] = useState(0)
  const [activeCard, setActiveCard] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length)
    }, 1800)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  const bgStyle = useMemo(() => {
    const shiftX = (pointer.x - 0.5) * 8
    const shiftY = (pointer.y - 0.5) * 8
    const scale = pointer.active ? 1.06 : 1.02
    return {
      backgroundImage: `url(${bgSrc})`,
      backgroundPosition: `${50 + shiftX}% ${50 + shiftY}%`,
      transform: `scale(${scale})`
    }
  }, [pointer, bgSrc])

  function handlePointerMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setPointer({ x, y, active: true })
  }

  function handlePointerLeave() {
    setPointer({ x: 0.5, y: 0.5, active: false })
  }

  return (
    <section
      className="home-shell"
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      aria-label="Clinical Trial Registration Home"
    >
      <div className="home-bg" style={bgStyle} />
      <img src={bgSrc} alt="" className="hidden" onError={() => setBgSrc(bgFallback)} />
      <div className="home-overlay" />
      <div className="home-noise" />

      <div className="home-content">
        <div className="home-grid">
          <div className="home-left">
            <div className="home-badge">
              <span className="home-dot" />
              National CTR Workspace
            </div>

            <div className="home-logo-wrap">
              <img src={logoSrc} alt="CTR Logo" className="home-logo" onError={() => setLogoSrc(logoFallback)} />
            </div>

            <h1 className="home-title">
              Clinical Trial Registry for <span className="home-word">{WORDS[wordIndex]}</span>
            </h1>

            <p className="home-subtitle">
              Submit and track trials, conduct reviewer decisions, and publish approved studies through one secure
              platform.
            </p>

            <div className="home-actions">
              <Link to="/login" className="home-btn home-btn-primary">
                Login
              </Link>
              <Link to="/signup" className="home-btn home-btn-secondary">
                Sign up as Researcher
              </Link>
            </div>

          </div>

          <div className="home-right">
            <article className={`home-card ${activeCard === 0 ? 'is-active' : ''}`}>
              <h3>Researcher Flow</h3>
              <p>Complete the Clinical Trial Registry Form, save drafts, and submit when ready.</p>
            </article>
            <article className={`home-card ${activeCard === 1 ? 'is-active' : ''}`}>
              <h3>Reviewer Desk</h3>
              <p>Review pending trials, approve compliant studies, and reject with actionable feedback.</p>
            </article>
            <article className={`home-card ${activeCard === 2 ? 'is-active' : ''}`}>
              <h3>Public Registry</h3>
              <p>Expose approved clinical trials with key metadata for transparency and compliance.</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
