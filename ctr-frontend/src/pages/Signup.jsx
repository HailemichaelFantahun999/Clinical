import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToaster } from '../context/ToasterContext.jsx'
import homeBackgroundImage from '../assets/images/background.png'

export default function Signup() {
  const { signup } = useAuth()
  const toaster = useToaster()
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toaster.push({ type: 'error', title: 'Validation error', message: 'Passwords do not match.' })
      return
    }
    setSubmitting(true)
    try {
      const res = await signup({ email: form.email, password: form.password })
      toaster.push({
        type: 'success',
        title: 'Registration submitted',
        message: res?.message || 'An administrator must approve your account before you can sign in.'
      })
      setForm({ email: '', password: '', confirmPassword: '' })
    } catch (err) {
      toaster.push({ type: 'error', title: 'Signup failed', message: err.message || 'Unable to create account.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative isolate overflow-hidden min-h-screen">
      {/* Animated clinical trial background elements */}
      <div className="clinical-animation-container">
        <div className="medical-cross top-1/4 left-1/12" />
        <div className="medical-cross bottom-1/3 right-1/8" />
        <div className="dna-helix top-20 right-5" />
        <div className="ecg-wave bottom-0" />
        <div className="pulse-ring top-1/2 left-1/2" />
      </div>

      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${homeBackgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center center' }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/80 via-white/70 to-teal-50/60 backdrop-blur-[4px]" aria-hidden="true" />
      
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10 relative z-10">
        <div className="rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-[0_24px_60px_-20px_rgba(15,118,110,0.25)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_28px_70px_-24px_rgba(15,118,110,0.35)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Clinical Trial Registry</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">ECTR - Register as user</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create an ECTR account to register and manage clinical trial submissions.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
            <label className="block">
              <span className="mb-1.5 block font-semibold text-slate-700">Email address</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="field-input w-full rounded-full border border-slate-200 bg-white/95 px-4 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                placeholder="researcher@example.org"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-semibold text-slate-700">Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="field-input w-full rounded-full border border-slate-200 bg-white/95 px-4 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                placeholder="At least 8 characters"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-semibold text-slate-700">Confirm Password</span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="field-input w-full rounded-full border border-slate-200 bg-white/95 px-4 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-teal-700 hover:to-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-teal-700 transition-colors hover:text-teal-800 hover:underline">
              Login instead
            </Link>
            .
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes ecg-sweep {
          0% { stroke-dashoffset: 300; opacity: 0.2; }
          100% { stroke-dashoffset: 0; opacity: 0.4; }
        }
        .clinical-animation-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .medical-cross {
          position: absolute;
          width: 32px;
          height: 32px;
          background: radial-gradient(circle, rgba(15, 118, 110, 0.08) 2px, transparent 2px);
          background-size: 8px 8px;
          border-radius: 4px;
          animation: float 8s ease-in-out infinite;
        }
        .medical-cross.top-1\\/4 { top: 25%; left: 8%; }
        .medical-cross.bottom-1\\/3 { bottom: 30%; right: 5%; animation-delay: 2s; }
        .dna-helix {
          position: absolute;
          width: 140px;
          height: 140px;
          border: 2px solid rgba(13, 148, 136, 0.15);
          border-radius: 50%;
          border-top-color: rgba(13, 148, 136, 0.4);
          animation: spin 20s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .ecg-wave {
          position: absolute;
          bottom: 5%;
          left: 0;
          width: 100%;
          height: 50px;
          opacity: 0.25;
        }
        .ecg-wave::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #0f766e, #14b8a6, #0f766e, transparent);
          animation: ecg-sweep 3s ease-in-out infinite;
        }
        .pulse-ring {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(15, 118, 110, 0.2), transparent);
          animation: pulse-ring 3s ease-out infinite;
          transform: translate(-50%, -50%);
        }
      `}</style>
    </section>
  )
}