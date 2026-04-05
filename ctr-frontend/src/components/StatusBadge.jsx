import React from 'react'

const colors = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-100',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-100'
}

export default function StatusBadge({ status }) {
  if (!status) return null
  const key = String(status).toLowerCase()
  const cls = colors[key] || 'bg-slate-100 text-slate-700 ring-slate-100'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${cls}`}
    >
      {key === 'pending' && 'Pending Review'}
      {key === 'approved' && 'Approved'}
      {key === 'rejected' && 'Rejected'}
      {!['pending', 'approved', 'rejected'].includes(key) && status}
    </span>
  )
}

