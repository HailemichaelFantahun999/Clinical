import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToaster } from '../context/ToasterContext.jsx'

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

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login({ email: form.email, password: form.password })
      toaster.push({ type: 'success', title: 'Welcome back', message: 'Login successful.' })
      navigate('/dashboard/redirect', { replace: true })
    } catch (err) {
      toaster.push({ type: 'error', title: 'Login failed', message: err.message || 'Unable to login.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-sm flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Access Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in with your email and password.
          {from && <span className="mt-1 block">You must be logged in to view: {from}</span>}
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
              placeholder="you@example.com"
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
              placeholder="Your password"
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
  )
}
