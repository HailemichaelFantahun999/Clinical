import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToaster } from '../context/ToasterContext.jsx'

const DEMO_ROLES = [
  { role: 'user', label: 'Enter Researcher Demo', description: 'Preview submission, drafts, and trial tracking.' },
  { role: 'reviewer', label: 'Enter Reviewer Demo', description: 'Review pending trials and make demo decisions.' },
  { role: 'admin', label: 'Enter Admin Demo', description: 'Explore oversight metrics and reviewer management.' }
]

export default function Login() {
  const { login } = useAuth()
  const toaster = useToaster()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const from = location.state?.from

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function completeLogin(payload, successTitle = 'Welcome back') {
    setSubmitting(true)
    try {
      await login(payload)
      toaster.push({ type: 'success', title: successTitle, message: 'Login successful.' })
      navigate('/dashboard/redirect', { replace: true })
    } catch (err) {
      toaster.push({ type: 'error', title: 'Login failed', message: err.message || 'Unable to login.' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await completeLogin({ email: form.email, password: form.password })
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-3xl flex-col justify-center px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Access Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">
            Explore the hosted demo without any backend or database dependency.
            {from && <span className="mt-1 block">You must be logged in to view: {from}</span>}
          </p>

          <div className="mt-6 space-y-3">
            {DEMO_ROLES.map((item) => (
              <button
                key={item.role}
                type="button"
                disabled={submitting}
                onClick={() => completeLogin({ role: item.role }, `${item.label.replace('Enter ', '')}`)}
                className="flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
                  <span className="mt-1 block text-xs text-slate-500">{item.description}</span>
                </span>
                <span className="text-sm font-semibold text-slate-400">?</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Researcher sign in</h2>
          <p className="mt-2 text-sm text-slate-500">
            You can also sign in with any researcher account you created from the signup page.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-xs">
            <label className="block">
              <span className="mb-1 block font-medium text-slate-700">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="field-input"
                placeholder="researcher@example.com"
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-medium text-slate-700">Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="field-input"
                placeholder="Enter your password"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-slate-50 shadow-soft hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-xs text-slate-500">
            New researcher?{' '}
            <Link to="/signup" className="font-semibold text-slate-800 hover:underline">
              Create an account
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
