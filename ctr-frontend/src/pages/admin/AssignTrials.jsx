import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToaster } from '../../context/ToasterContext.jsx'
import { adminAssignReviewer, adminPendingTrialQueue } from '../../services/trials'
import StatusBadge from '../../components/StatusBadge.jsx'

export default function AssignTrials() {
  const { adminListReviewers } = useAuth()
  const toaster = useToaster()
  const [trials, setTrials] = useState([])
  const [reviewers, setReviewers] = useState([])
  const [assigning, setAssigning] = useState({})
  const [selection, setSelection] = useState({})

  const load = useCallback(async () => {
    try {
      const [queue, revs] = await Promise.all([adminPendingTrialQueue(), adminListReviewers()])
      setTrials(queue)
      setReviewers(revs)
    } catch {
      setTrials([])
      setReviewers([])
    }
  }, [adminListReviewers])

  useEffect(() => {
    load()
  }, [load])

  async function handleAssign(trialId) {
    const trial = trials.find((x) => x.id === trialId)
    const reviewerId = String(
      selection[trialId] !== undefined && selection[trialId] !== ''
        ? selection[trialId]
        : trial?.assigned_reviewer_id || ''
    ).trim()
    if (!reviewerId) {
      toaster.push({ type: 'error', title: 'Choose a reviewer', message: 'Select a reviewer before assigning.' })
      return
    }
    setAssigning((prev) => ({ ...prev, [trialId]: true }))
    try {
      await adminAssignReviewer({ trialId, reviewerId })
      toaster.push({ type: 'success', title: 'Reviewer assigned', message: 'The reviewer can now see this trial in their queue.' })
      setSelection((prev) => {
        const next = { ...prev }
        delete next[trialId]
        return next
      })
      await load()
    } catch (err) {
      toaster.push({ type: 'error', title: 'Assignment failed', message: err.message || 'Unable to assign.' })
    } finally {
      setAssigning((prev) => {
        const next = { ...prev }
        delete next[trialId]
        return next
      })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Assign reviewers</h1>
        <p className="mt-1 text-xs text-slate-600">
          Pending submissions appear here until you assign a reviewer. Only the assigned reviewer can approve or reject
          each trial.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <Th>Trial</Th>
              <Th>Researcher</Th>
              <Th>Status</Th>
              <Th>Assigned to</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {!trials.length && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-xs text-slate-500">
                  No pending trials. New submissions will appear here for assignment.
                </td>
              </tr>
            )}
            {trials.map((t) => {
              const d = t.data || {}
              const title = d.title || d.trialTitle || 'Untitled trial'
              return (
                <tr key={t.id} className="hover:bg-slate-50/60">
                  <Td>
                    <div className="font-semibold text-slate-900 line-clamp-2">{title}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      Submitted {formatDate(t.submitted_at || t.created_at)}
                    </div>
                  </Td>
                  <Td className="text-xs">{t.researcher_email || '—'}</Td>
                  <Td>
                    <StatusBadge status={t.status} />
                  </Td>
                  <Td className="text-xs text-slate-600">{t.assigned_reviewer_email || '—'}</Td>
                  <Td className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <select
                        className="field-input max-w-[11rem] py-1 text-[11px]"
                        value={selection[t.id] ?? t.assigned_reviewer_id ?? ''}
                        onChange={(e) => setSelection((prev) => ({ ...prev, [t.id]: e.target.value }))}
                      >
                        <option value="">Select reviewer…</option>
                        {reviewers.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.email}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={assigning[t.id] || !reviewers.length}
                        onClick={() => handleAssign(t.id)}
                        className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        {assigning[t.id]
                          ? 'Saving…'
                          : t.assigned_reviewer_id
                            ? 'Update'
                            : 'Assign'}
                      </button>
                    </div>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!reviewers.length && (
        <p className="text-xs text-amber-700">
          No reviewer accounts exist yet. Create reviewers under <strong>Create Reviewer</strong> before you can assign
          trials.
        </p>
      )}
    </div>
  )
}

function Th({ children, className = '' }) {
  return (
    <th className={`px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 ${className}`}>
      {children}
    </th>
  )
}

function Td({ children, className = '' }) {
  return <td className={`px-3 py-3 align-top text-xs text-slate-700 ${className}`}>{children}</td>
}

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return '—'
  }
}
