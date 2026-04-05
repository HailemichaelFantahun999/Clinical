import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import homeBackgroundImage from '../assets/images/background.png'
import homeLogoImage from '../assets/images/logo.png'
import EctrLogoMark from '../components/EctrLogoMark.jsx'
import '../styles/home.css'

export default function Home() {
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5, active: false })
  const [logoLoadFailed, setLogoLoadFailed] = useState(false)

  const bgStyle = useMemo(() => {
    const shiftX = (pointer.x - 0.5) * 6
    const shiftY = (pointer.y - 0.5) * 6
    const scale = pointer.active ? 1.04 : 1.01
    return {
      backgroundImage: `url(${homeBackgroundImage})`,
      backgroundPosition: `${50 + shiftX}% ${50 + shiftY}%`,
      transform: `scale(${scale})`
    }
  }, [pointer])

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
      aria-label="ECTR home"
    >
      <div className="home-bg" style={bgStyle} />
      <div className="home-overlay" />
      <div className="home-noise" />

      <div className="home-graphic home-graphic-left" aria-hidden="true" />
      <div className="home-graphic home-graphic-right" aria-hidden="true" />
      <div className="home-orbit" aria-hidden="true" />
      <div className="home-gridline" aria-hidden="true" />
      <div className="home-signal" aria-hidden="true">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,72 L120,72 L170,48 L220,94 L280,28 L340,72 L480,72 L530,55 L580,89 L630,35 L700,72 L820,72 L870,44 L920,92 L980,30 L1040,72 L1200,72" />
        </svg>
      </div>

      <div className="home-content">
        <div className="home-badge">
          <span className="home-dot" />
          <span>Clinical Trial Registry v2.0</span>
        </div>

        <div className="home-hero">
          <div className="home-brand-column">
            <div className="home-logo-wrap">
              {logoLoadFailed ? (
                <EctrLogoMark className="h-full w-full max-h-[5.5rem] max-w-[5.5rem] p-2" />
              ) : (
                <img
                  src={homeLogoImage}
                  alt="ECTR logo"
                  className="home-logo"
                  onError={() => setLogoLoadFailed(true)}
                />
              )}
            </div>

            <div className="home-copy">
              <h1 className="home-title">ECTR</h1>
              <p className="home-subtitle">
                <span className="home-subtitle-strong">Ethiopian Clinical Trial Registry</span>
                Register studies, complete structured review, and publish approved trials for transparency and compliance.
              </p>
            </div>
          </div>

          <div className="home-nav-ribbon" aria-label="Primary actions">
            <Link to="/login" className="home-login-link">
              <span>Login</span>
              <span className="home-link-arrow" aria-hidden="true">?</span>
            </Link>
            <Link to="/trials" className="home-ribbon-link home-ribbon-link-search">
              <span className="home-ribbon-label">Search trials</span>
              <span className="home-ribbon-copy">Find approved trials with advanced filters and full registry details.</span>
            </Link>
            <Link to="/login" className="home-ribbon-link home-ribbon-link-register">
              <span className="home-ribbon-label">Register a trial</span>
              <span className="home-ribbon-copy">Sign in first, then submit or continue your trial registration (drafts supported).</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
