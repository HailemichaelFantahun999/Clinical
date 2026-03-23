import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToaster } from '../../context/ToasterContext.jsx'

export default function ResetReviewerPassword() {
  const { user, adminResetReviewerPassword } = useAuth()
  const toaster = useToaster()
  const [email, setEmail] = useState('')
  const [resetting, setResetting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setResetting(true)
    try {
      await adminResetReviewerPassword({ adminUserId: user.id, reviewerEmail: email })
      toaster.push({
        type: 'success',
        title: 'Password reset',
        message: 'A new temporary password has been sent to the reviewer.'
      })
      setEmail('')
    } catch (err) {
      toaster.push({
        type: 'error',
        title: 'Unable to reset password',
        message: err.message || 'Operation failed.'
      })
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h1 className="text-lg font-semibold text-slate-900">Reset Reviewer Password</h1>
        <p className="mt-1 text-xs text-slate-600">
          Generate a new temporary password for a reviewer who has lost access. The new password will be emailed to the
          reviewer&apos;s address on file.
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
            disabled={resetting}
            className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-slate-50 shadow-soft hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {resetting ? 'Resetting password…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

