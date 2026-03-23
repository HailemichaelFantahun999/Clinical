import React, { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import logoFallback from '../assets/images/logo.png'

export default function PublicLayout() {
  const location = useLocation()
  const [logoSrc, setLogoSrc] = useState('/dist/assets/images/logo.jpeg')
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-soft">
              <img
                src={logoSrc}
                alt="CTR logo"
                className="h-full w-full object-contain"
                onError={() => setLogoSrc(logoFallback)}
              />
            </div>
            <div>
              <Link to="/" className="text-sm font-semibold text-slate-900">
                Clinical Trial Registration System
              </Link>
              <p className="text-xs text-slate-500">Secure submission and review of clinical trials</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              to="/trials"
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                location.pathname.startsWith('/trials')
                  ? 'bg-slate-900 text-slate-50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Approved Trials
            </Link>
            <Link
              to="/login"
              className="rounded-full px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-soft hover:bg-indigo-700"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-3 text-xs text-slate-500 lg:px-6">
          © {new Date().getFullYear()} Clinical Trial Registration System
        </div>
      </footer>
    </div>
  )
}

