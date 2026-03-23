import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TrialForm from '../../components/TrialForm.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToaster } from '../../context/ToasterContext.jsx'
import { createTrial } from '../../services/trials'

export default function SubmitTrial() {
  const { user } = useAuth()
  const toaster = useToaster()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(payload) {
    setSubmitting(true)
    try {
      const status = payload.status === 'draft' ? 'draft' : 'pending'
      const enriched = {
        ...payload,
        status,
        contactEmail: payload.contactEmail || user.email
      }
      await createTrial({ payload: enriched })

      if (status === 'draft') {
        toaster.push({
          type: 'success',
          title: 'Draft saved',
          message: 'Your draft has been saved. You can return to complete and submit it later.'
        })
      } else {
        toaster.push({
          type: 'success',
          title: 'Submission received',
          message: 'Your clinical trial was submitted and is pending reviewer approval.'
        })
      }

      navigate('/dashboard/user/my-trials')
    } catch (err) {
      toaster.push({ type: 'error', title: 'Submission failed', message: err.message || 'Unable to submit trial.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 shadow-soft sm:p-5">
        <h1 className="text-lg font-semibold text-slate-900">Clinical Trial Registry Form</h1>
        <p className="mt-1 text-xs text-slate-600">
          Provide complete and accurate information for your clinical trial. You may save a draft or submit directly
          for reviewer assessment.
        </p>
        <div className="mt-4">
          <TrialForm onSubmit={handleSubmit} submitting={submitting} />
        </div>
      </div>
    </div>
  )
}

