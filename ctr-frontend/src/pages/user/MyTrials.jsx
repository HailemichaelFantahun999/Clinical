import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToaster } from '../../context/ToasterContext.jsx'
import { listMyTrials, userResubmit } from '../../services/trials'
import TrialTable from '../../components/TrialTable.jsx'
import TrialForm from '../../components/TrialForm.jsx'

export default function MyTrials() {
  const { user } = useAuth()
  const toaster = useToaster()
  const location = useLocation()
  const [trials, setTrials] = useState([])
  const [resubmitId, setResubmitId] = useState(null)
  const [resubmitting, setResubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    async function run() {
      try {
        const rows = await listMyTrials()
        setTrials(rows)
      } catch {
        setTrials([])
      }
    }
    run()
  }, [user])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const id = params.get('resubmit')
    if (id) setResubmitId(id)
  }, [location.search])

  const trialToEdit = useMemo(() => trials.find((t) => t.id === resubmitId), [trials, resubmitId])

  async function handleResubmit(payload) {
    if (!trialToEdit) return
    setResubmitting(true)
    try {
      await userResubmit({ trialId: trialToEdit.id, payload })
      toaster.push({
        type: 'success',
        title: 'Resubmitted',
        message: 'Your updated trial has been resubmitted for review.'
      })
      setTrials(await listMyTrials())
      setResubmitId(null)
    } catch (err) {
      toaster.push({
        type: 'error',
        title: 'Resubmission failed',
        message: err.message || 'Unable to resubmit trial.'
      })
    } finally {
      setResubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">My Submitted Trials</h1>
        <p className="mt-1 text-xs text-slate-600">
          Review the status of your clinical trial submissions, reviewer comments, and resubmit if required.
        </p>
      </div>
      <TrialTable trials={trials} role="user" />

      {trialToEdit && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Edit &amp; Resubmit Trial</h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Address the reviewer comments and update the trial information before resubmitting.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setResubmitId(null)}
              className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
          {trialToEdit.reviewerComment && (
            <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              <span className="font-semibold">Reviewer comment:</span> “{trialToEdit.reviewerComment}”
            </div>
          )}
          <div className="mt-3">
            <TrialForm
              initialValue={trialToEdit.data}
              onSubmit={handleResubmit}
              submitting={resubmitting}
            />
          </div>
        </div>
      )}
    </div>
  )
}

