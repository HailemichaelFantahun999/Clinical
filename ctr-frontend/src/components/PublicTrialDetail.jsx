import React, { useState } from 'react'
import TrialDataFullView from './TrialDataFullView.jsx'

export default function PublicTrialDetail({ trial }) {
  const [open, setOpen] = useState(false)
  const d = trial.data || {}
  const title = d.publicTitle || d.title || 'Untitled trial'
  const scientific = d.scientificTitle

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left hover:bg-slate-50/80"
      >
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {scientific && <p className="mt-0.5 text-[11px] text-slate-500">{scientific}</p>}
          <p className="mt-2 line-clamp-2 text-xs text-slate-600">{d.briefSummary || '—'}</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
          Approved
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-slate-100 px-4 pb-4 pt-3">
          <TrialDataFullView trial={trial} allowPublicDownloads />
        </div>
      )}
    </article>
  )
}
