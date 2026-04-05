import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToaster } from '../../context/ToasterContext.jsx'
import { getTrialById, reviewerApprove, reviewerReject } from '../../services/trials'
import StatusBadge from '../../components/StatusBadge.jsx'
import TrialDataFullView, { TrialDataNav } from '../../components/TrialDataFullView.jsx'

export default function TrialReview() {
  const { trialId } = useParams()
  const toaster = useToaster()
  const navigate = useNavigate()
  const [trial, setTrial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function run() {
      try {
        const t = await getTrialById({ trialId })
        setTrial(t)
      } catch (err) {
        toaster.push({ type: 'error', title: 'Unable to load trial', message: err.message || 'Trial not found.' })
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [trialId, toaster])

  async function handleApprove() {
    if (!trial) return
    setSubmitting(true)
    try {
      await reviewerApprove({ trialId: trial.id })
      toaster.push({ type: 'success', title: 'Trial approved', message: 'The trial is now publicly visible.' })
      navigate('/dashboard/reviewer?tab=pending')
    } catch (err) {
      toaster.push({ type: 'error', title: 'Unable to approve', message: err.message || 'Approval failed.' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReject(e) {
    e.preventDefault()
    if (!trial) return
    if (!rejectionReason.trim()) {
      toaster.push({ type: 'error', title: 'Reason required', message: 'Please provide a reason for rejection.' })
      return
    }
    setSubmitting(true)
    try {
      await reviewerReject({ trialId: trial.id, reason: rejectionReason })
      toaster.push({
        type: 'success',
        title: 'Trial rejected',
        message: 'The researcher has been notified and can resubmit.'
      })
      navigate('/dashboard/reviewer?tab=pending')
    } catch (err) {
      toaster.push({ type: 'error', title: 'Unable to reject', message: err.message || 'Rejection failed.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-soft">
          Loading trial details…
        </div>
      </div>
    )
  }

  if (!trial) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-soft">
        Trial not found or you are not authorized to view it.
      </div>
    )
  }

  const d = trial.data || {}
  const title = d.publicTitle || d.title || 'Untitled trial'

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Trial under review</p>
          <h1 className="mt-1 text-lg font-semibold text-slate-900">{title}</h1>
          {d.scientificTitle && <p className="mt-0.5 text-xs text-slate-600">{d.scientificTitle}</p>}
        </div>
        <StatusBadge status={trial.status} />
      </div>

      {trial.reviewer_comment || trial.reviewerComment ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
          <span className="font-semibold text-slate-800">Reviewer note on record:</span>{' '}
          <span className="italic">“{trial.reviewer_comment || trial.reviewerComment}”</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="lg:w-52 lg:shrink-0">
          <TrialDataNav className="lg:sticky lg:top-4" />
        </aside>
        <div className="min-w-0 flex-1 space-y-5">
          <TrialDataFullView trial={trial} />

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-slate-900">Reviewer decision</h2>
            {trial.status === 'pending' ? (
              <>
                <p className="mt-1 text-[11px] text-slate-600">
                  Approve if all criteria are met. When rejecting, provide a clear, actionable reason for the
                  researcher.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={submitting}
                    className="inline-flex items-center rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold text-emerald-50 shadow-soft hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                  >
                    Approve trial
                  </button>
                </div>
                <form onSubmit={handleReject} className="mt-4 space-y-2 text-xs">
                  <label className="block">
                    <span className="mb-1 block font-medium text-slate-700">
                      Rejection reason <span className="text-rose-500">*</span>
                    </span>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="field-input"
                      placeholder="Summarize what must change before this trial can be approved."
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center rounded-full bg-rose-600 px-5 py-2 text-xs font-semibold text-rose-50 shadow-soft hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
                  >
                    Reject trial
                  </button>
                </form>
              </>
            ) : (
              <p className="mt-2 text-xs text-slate-600">
                This submission is no longer pending. Use the reviewer dashboard to open other trials.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
