import React from 'react'

/** Inline mark so the app does not depend on missing bundled image files. */
export default function EctrLogoMark({ className = '', title = 'ECTR' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <circle cx="24" cy="24" r="22" stroke="#0f766e" strokeWidth="1.5" fill="#ffffff" />
      <path d="M24 14v20M14 24h20" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="24" cy="24" r="4" fill="#0d9488" />
    </svg>
  )
}
