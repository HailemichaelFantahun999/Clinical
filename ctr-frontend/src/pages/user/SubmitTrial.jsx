import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import TrialForm from '../../components/TrialForm.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToaster } from '../../context/ToasterContext.jsx'
import { createTrial, getTrialById, updateTrial } from '../../services/trials'

function buildTrialFormStorageKey(userId, trialParam) {
  return `ctr.trialForm.${userId || 'guest'}.${trialParam || 'new'}`
}

export default function SubmitTrial() {
  const { user } = useAuth()
  const toaster = useToaster()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const draftParam = searchParams.get('draft')
  const editParam = searchParams.get('edit')
  const trialParam = editParam || draftParam

  const [submitting, setSubmitting] = useState(false)
  const [loadState, setLoadState] = useState(() => (trialParam ? 'loading' : 'ready'))
  const [draftTrialId, setDraftTrialId] = useState(null)
  const [initialData, setInitialData] = useState(null)
  const [editingStatus, setEditingStatus] = useState(null)
  const storageKey = buildTrialFormStorageKey(user?.id, trialParam)

  useEffect(() => {
    if (!trialParam) {
      setDraftTrialId(null)
      setInitialData(null)
      setEditingStatus(null)
      setLoadState('ready')
      return
    }

    if (!user) return

    let cancelled = false
    setLoadState('loading')
    setInitialData(null)
    setDraftTrialId(null)
    setEditingStatus(null)

    async function run() {
      try {
        const t = await getTrialById({ trialId: trialParam })
        if (cancelled) return
        if (!['draft', 'approved'].includes(t.status) || t.user_id !== user.id) {
          setLoadState('error')
          return
        }
        setDraftTrialId(t.id)
        setInitialData(t.data || {})
        setEditingStatus(t.status)
        setLoadState('ready')
      } catch {
        if (!cancelled) setLoadState('error')
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [trialParam, user])

  async function handleSubmit(payload) {
    setSubmitting(true)
    try {
      const status = editingStatus === 'approved' ? 'pending' : payload.status === 'draft' ? 'draft' : 'pending'
      const enriched = {
        ...payload,
        status,
        contactEmail: payload.contactEmail || user.email
      }

      if (draftTrialId) {
        await updateTrial({ trialId: draftTrialId, payload: enriched })
      } else {
        const trial = await createTrial({ payload: enriched })
        if (status === 'draft') {
          setDraftTrialId(trial.id)
          setSearchParams({ draft: trial.id }, { replace: true })
        }
      }

      if (status !== 'draft' && typeof window !== 'undefined') {
        window.localStorage.removeItem(storageKey)
      }

      if (status === 'draft') {
        toaster.push({
          type: 'success',
          title: 'Draft saved',
          message: 'You can keep editing now, or come back anytime from My Trials and continue your draft.'
        })
      } else {
        toaster.push({
          type: 'success',
          title: editingStatus === 'approved' ? 'Update submitted' : 'Submission received',
          message:
            editingStatus === 'approved'
              ? 'Your trial update was submitted and is pending reviewer approval again.'
              : 'Your clinical trial was submitted and is pending reviewer approval.'
        })
        navigate('/dashboard/user/my-trials')
      }
    } catch (err) {
      toaster.push({ type: 'error', title: 'Submission failed', message: err.message || 'Unable to submit trial.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="mx-auto flex max-w-6xl items-center justify-center py-16">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-soft">
          Loading trial...
        </div>
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="mx-auto max-w-lg space-y-3 py-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-soft">
          This trial could not be opened. It may no longer be editable, or you do not have access.
        </div>
        <Link
          to="/dashboard/user/my-trials"
          className="inline-flex text-xs font-semibold text-slate-700 underline hover:text-slate-900"
        >
          Back to My Trials
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      {draftTrialId && editingStatus === 'draft' && (
        <div className="rounded-xl border border-sky-200 bg-sky-50/90 px-4 py-3 text-[11px] text-sky-950 shadow-soft">
          <span className="font-semibold">Draft in progress.</span> Save anytime with <strong>Save Draft</strong>. You
          can leave this page and resume later from{' '}
          <Link to="/dashboard/user/my-trials" className="font-semibold underline">
            My Trials
          </Link>{' '}
          (Continue draft).
        </div>
      )}
      {draftTrialId && editingStatus === 'approved' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-[11px] text-amber-950 shadow-soft">
          <span className="font-semibold">Approved trial update.</span> Make the changes you need, then submit the
          update. Once submitted, the trial will wait for reviewer approval again before it becomes public.
        </div>
      )}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 shadow-soft sm:p-5">
        <h1 className="text-lg font-semibold text-slate-900">ECTR - Trial registration</h1>
        <p className="mt-1 text-xs text-slate-600">
          Provide complete and accurate information for your clinical trial. Save a draft as you go and return when
          you are ready, or submit for review when every section is complete.
        </p>
        <div className="mt-4">
          <TrialForm
            key={draftTrialId || 'new'}
            initialValue={initialData || undefined}
            onSubmit={handleSubmit}
            submitting={submitting}
            allowDrafts={editingStatus !== 'approved'}
            storageKey={storageKey}
          />
        </div>
      </div>
    </div>
  )
}
