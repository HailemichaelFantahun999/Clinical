import React, { useEffect, useState } from 'react'
import { listPublicApprovedTrials } from '../services/trials'
import StatusBadge from '../components/StatusBadge.jsx'

export default function PublicTrials() {
  const [trials, setTrials] = useState([])

  useEffect(() => {
    async function run() {
      try {
        const rows = await listPublicApprovedTrials()
        setTrials(rows)
      } catch {
        setTrials([])
      }
    }
    run()
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Approved Clinical Trials</h1>
          <p className="mt-1 text-xs text-slate-600">
            Trials that have been reviewed and approved by the clinical review board.
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {!trials.length && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500 shadow-soft">
            Approved trials will appear here once reviewers approve submissions.
          </div>
        )}
        {trials.map((t) => (
          <article
            key={t.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition hover:border-slate-300"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">{t.data.title || 'Untitled trial'}</h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {t.data.contactFirstName || t.data.contactLastName
                    ? `${t.data.contactTitle ? t.data.contactTitle + ' ' : ''}${t.data.contactFirstName || ''} ${
                        t.data.contactLastName || ''
                      }`
                    : 'Contact not specified'}
                  {' · '}
                  {t.data.contactInstitution || 'Institution not set'}
                </p>
              </div>
              <StatusBadge status={t.status} />
            </div>
            <p className="mt-2 line-clamp-3 text-xs text-slate-600">{t.data.briefSummary}</p>
            <dl className="mt-3 grid gap-2 text-[11px] text-slate-500 sm:grid-cols-3">
              <div>
                <dt className="font-semibold text-slate-600">Trial Design</dt>
                <dd>{t.data.trialDesign || '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-600">Recruitment Centre</dt>
                <dd>{t.data.recruitmentCentreCity || '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-600">Recruitment Period</dt>
                <dd>
                  {formatDate(t.data.anticipatedStartDate)} – {formatDate(t.data.completionDate)}
                </dd>
              </div>
            </dl>
            <div className="mt-3 text-[11px] text-slate-500">
              Contact: <span className="font-medium text-slate-700">{t.data.contactEmail || '—'}</span>
            </div>
          </article>
        ))}
      </div>
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

