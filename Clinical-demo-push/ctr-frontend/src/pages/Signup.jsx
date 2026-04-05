import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToaster } from '../context/ToasterContext.jsx'

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
      await signup({ email: form.email, password: form.password })
      toaster.push({
        type: 'success',
        title: 'Account created',
        message: 'You can log in now.'
      })
      setForm({ email: '', password: '', confirmPassword: '' })
    } catch (err) {
      toaster.push({ type: 'error', title: 'Signup failed', message: err.message || 'Unable to create account.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-lg font-semibold text-slate-900">Sign up as Researcher</h1>
        <p className="mt-1 text-xs text-slate-500">
          Create an account to submit clinical trials for review.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <label className="block">
            <span className="mb-1 block font-medium text-slate-700">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="field-input"
              placeholder="you@example.org"
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
              placeholder="At least 8 characters"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-medium text-slate-700">Confirm Password</span>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="field-input"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-slate-50 shadow-soft hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
        <p className="mt-3 text-[11px] text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-800 hover:underline">
            Login instead
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

