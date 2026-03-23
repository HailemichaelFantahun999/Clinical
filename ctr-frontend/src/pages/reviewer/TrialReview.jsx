import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToaster } from '../../context/ToasterContext.jsx'
import { getTrialById, reviewerApprove, reviewerReject } from '../../services/trials'
import StatusBadge from '../../components/StatusBadge.jsx'

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

  const d = trial.data

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{d.title || 'Untitled trial'}</h1>
          <p className="mt-1 text-xs text-slate-600">
            Contact:{" "}
            {d.contactFirstName || d.contactLastName
              ? `${d.contactTitle ? d.contactTitle + ' ' : ''}${d.contactFirstName || ''} ${d.contactLastName || ''}`
              : '—'}{" "}
            · Institution: {d.contactInstitution || '—'}
          </p>
        </div>
        <StatusBadge status={trial.status} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-slate-900">Study Overview</h2>
        <p className="mt-2 whitespace-pre-line text-xs text-slate-700">{d.briefSummary}</p>
        <dl className="mt-4 grid gap-3 text-[11px] text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Trial Design" value={d.trialDesign || '—'} />
          <Info label="Phase" value={d.trialPhase || '—'} />
          <Info label="Disease / Condition" value={d.diseases || '—'} />
          <Info label="Anticipated Start" value={formatDate(d.anticipatedStartDate)} />
          <Info label="Completion Date" value={formatDate(d.completionDate)} />
          <Info label="Recruitment Status" value={d.recruitmentStatus || '—'} />
          <Info label="Target Participants" value={d.targetParticipants || '—'} />
          <Info label="Recruitment Centre" value={d.recruitmentCentreCity || '—'} />
          <Info label="Contact Email" value={d.contactEmail || '—'} />
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-slate-900">Reviewer Decision</h2>
        <p className="mt-1 text-[11px] text-slate-600">
          Approve the trial if all criteria are met. When rejecting, provide a clear, actionable reason for the
          researcher.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleApprove}
            disabled={submitting}
            className="inline-flex items-center rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold text-emerald-50 shadow-soft hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            Approve Trial
          </button>
        </div>
        <form onSubmit={handleReject} className="mt-4 space-y-2 text-xs">
          <label className="block">
            <span className="mb-1 block font-medium text-slate-700">
              Rejection Reason <span className="text-rose-500">*</span>
            </span>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="field-input"
              placeholder="Summarize the specific reasons this trial cannot be approved in its current form and what changes are needed."
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-full bg-rose-600 px-5 py-2 text-xs font-semibold text-rose-50 shadow-soft hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
          >
            Reject Trial
          </button>
        </form>
      </section>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="font-semibold text-slate-700">{label}</dt>
      <dd className="mt-0.5 text-slate-600">{value}</dd>
    </div>
  )
}

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return '—'
  }
}

