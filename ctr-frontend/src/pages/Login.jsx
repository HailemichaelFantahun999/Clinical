import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToaster } from '../context/ToasterContext.jsx'
import homeBackgroundImage from '../assets/images/background.png'

export default function Login() {
  const { login } = useAuth()
  const toaster = useToaster()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const from = location.state?.from
  const params = new URLSearchParams(location.search)
  const nextPath = params.get('next') || ''

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login({ email: form.email, password: form.password })
      toaster.push({ type: 'success', title: 'Welcome back', message: 'Login successful.' })
      if (nextPath.startsWith('/') && !nextPath.startsWith('//')) {
        navigate(nextPath, { replace: true })
      } else {
        navigate('/dashboard/redirect', { replace: true })
      }
    } catch (err) {
      toaster.push({ type: 'error', title: 'Login failed', message: err.message || 'Unable to login.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative isolate overflow-hidden min-h-screen">
      {/* Animated clinical trial background */}
      <div className="clinical-bg-animation">
        <div className="floating-capsule top-1/5 left-1/10" />
        <div className="floating-capsule bottom-1/4 right-1/12 delay-2" />
        <div className="heart-beat-wave" />
        <div className="rotating-dna top-10 right-5" />
        <div className="particle-field" />
      </div>

      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${homeBackgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center center' }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/75 via-white/80 to-emerald-50/70 backdrop-blur-[3px]" aria-hidden="true" />
      
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-10 relative z-10">
        <div className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_24px_60px_-28px_rgba(15,118,110,0.3)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_30px_70px_-28px_rgba(15,118,110,0.4)]">
          <div className="mb-2 flex items-center gap-2">
            <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Secure Access</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-teal-800 bg-clip-text text-transparent">ECTR — Login</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to the Ethiopian Clinical Trial Registry with your email and password.
            {from && <span className="mt-1 block text-xs text-amber-600">🔐 You must be logged in to view: {from}</span>}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
            <label className="block">
              <span className="mb-1.5 block font-semibold text-slate-700">Email address</span>
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-full border border-slate-200 bg-white/95 px-4 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                placeholder="Leave blank to login dynamically"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-semibold text-slate-700">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-full border border-slate-200 bg-white/95 px-4 py-2.5 pr-20 text-sm shadow-sm transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                  placeholder="Password not required"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 inline-flex items-center text-xs font-semibold text-teal-600 transition-colors hover:text-teal-800"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-teal-700 hover:to-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Need an account?{' '}
            <Link to="/signup" className="font-semibold text-teal-700 transition-colors hover:text-teal-800 hover:underline">
              Register as user
            </Link>
            .
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-capsule {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-25px) rotate(10deg); opacity: 0.6; }
        }
        @keyframes heart-beat {
          0%, 100% { transform: scaleX(1); opacity: 0.2; }
          50% { transform: scaleX(1.2); opacity: 0.5; }
        }
        @keyframes rotate-dna {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes particle-drift {
          0% { transform: translate(0, 0); opacity: 0; }
          20% { opacity: 0.3; }
          80% { opacity: 0.2; }
          100% { transform: translate(60px, -80px); opacity: 0; }
        }
        .clinical-bg-animation {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .floating-capsule {
          position: absolute;
          width: 28px;
          height: 14px;
          background: linear-gradient(135deg, #0f766e, #14b8a6);
          border-radius: 20px;
          opacity: 0.3;
          animation: float-capsule 10s ease-in-out infinite;
        }
        .floating-capsule.top-1\\/5 { top: 20%; left: 10%; }
        .floating-capsule.bottom-1\\/4 { bottom: 25%; right: 8%; animation-delay: 2s; width: 36px; height: 18px; }
        .heart-beat-wave {
          position: absolute;
          bottom: 15%;
          left: 0;
          width: 100%;
          height: 40px;
          background: repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(15,118,110,0.1) 30px, rgba(15,118,110,0.1) 60px);
          animation: heart-beat 1.5s ease-in-out infinite;
        }
        .rotating-dna {
          position: absolute;
          width: 120px;
          height: 120px;
          border: 2px solid rgba(15, 118, 110, 0.12);
          border-radius: 50%;
          border-top-color: rgba(15, 118, 110, 0.3);
          animation: rotate-dna 18s linear infinite;
        }
        .particle-field {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        .particle-field::before,
        .particle-field::after {
          content: '';
          position: absolute;
          width: 3px;
          height: 3px;
          background: #0f766e;
          border-radius: 50%;
          opacity: 0;
          animation: particle-drift 12s infinite;
        }
        .delay-2 { animation-delay: 2s; }
      `}</style>
    </section>
  )
}