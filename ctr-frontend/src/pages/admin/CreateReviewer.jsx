import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToaster } from '../../context/ToasterContext.jsx'

export default function CreateReviewer() {
  const { user, adminCreateReviewer } = useAuth()
  const toaster = useToaster()
  const [email, setEmail] = useState('')
  const [creating, setCreating] = useState(false)
  const [lastPassword, setLastPassword] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setCreating(true)
    setLastPassword(null)
    try {
      const res = await adminCreateReviewer({ adminUserId: user.id, email })
      setLastPassword(res?.tempPassword || null)
      toaster.push({
        type: 'success',
        title: 'Reviewer created',
        message: 'Copy the generated password below and share it with the reviewer securely (email delivery is not used yet).'
      })
      setEmail('')
    } catch (err) {
      toaster.push({
        type: 'error',
        title: 'Unable to create reviewer',
        message: err.message || 'Operation failed.'
      })
    } finally {
      setCreating(false)
    }
  }

  async function copyPassword() {
    if (!lastPassword) return
    try {
      await navigator.clipboard.writeText(lastPassword)
      toaster.push({ type: 'success', title: 'Copied', message: 'Password copied to clipboard.' })
    } catch {
      toaster.push({ type: 'error', title: 'Copy failed', message: 'Select and copy the password manually.' })
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h1 className="text-lg font-semibold text-slate-900">Create Reviewer Account</h1>
        <p className="mt-1 text-xs text-slate-600">
          A temporary password is generated on this screen. Share it with the reviewer through your own secure channel;
          the system does not send email yet.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <label className="block">
            <span className="mb-1 block font-medium text-slate-700">Reviewer Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="field-input"
              placeholder="reviewer@example.org"
            />
          </label>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-slate-50 shadow-soft hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {creating ? 'Creating account…' : 'Create Reviewer'}
          </button>
        </form>
      </div>

      {lastPassword && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-soft">
          <h2 className="text-xs font-semibold text-amber-950">Temporary password</h2>
          <p className="mt-1 text-[11px] text-amber-900">
            The reviewer must sign in with this password and will be prompted to change it.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="rounded-lg border border-amber-200/80 bg-white px-3 py-2 text-xs font-mono text-slate-900">
              {lastPassword}
            </code>
            <button
              type="button"
              onClick={copyPassword}
              className="rounded-full border border-amber-800/30 bg-white px-3 py-1.5 text-[11px] font-semibold text-amber-950 hover:bg-amber-100/80"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
