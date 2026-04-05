import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToaster } from '../../context/ToasterContext.jsx'

export default function CreateReviewer() {
  const { user, adminCreateReviewer } = useAuth()
  const toaster = useToaster()
  const [email, setEmail] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setCreating(true)
    try {
      await adminCreateReviewer({ adminUserId: user.id, email })
      toaster.push({
        type: 'success',
        title: 'Reviewer created',
        message: 'A temporary password has been emailed to the reviewer.'
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

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h1 className="text-lg font-semibold text-slate-900">Create Reviewer Account</h1>
        <p className="mt-1 text-xs text-slate-600">
          Create dedicated reviewer accounts. A temporary password will be generated and emailed automatically.
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
    </div>
  )
}

