import React from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'

export default function TrialTable({ trials, role }) {
  if (!trials?.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-soft">
        No trials to display yet.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <Th>Trial Title</Th>
            <Th>PI / Institution</Th>
            <Th>Status</Th>
            <Th>Submitted</Th>
            <Th>Updated</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {trials.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50/60">
              <Td>
                <div className="font-semibold text-slate-900">{t.data.title || 'Untitled trial'}</div>
                <div className="text-xs text-slate-500 line-clamp-1">{t.data.briefSummary}</div>
              </Td>
              <Td>
                <div className="text-xs font-medium text-slate-800">
                  {t.data.contactFirstName || t.data.contactLastName
                    ? `${t.data.contactTitle ? t.data.contactTitle + ' ' : ''}${t.data.contactFirstName || ''} ${
                        t.data.contactLastName || ''
                      }`
                    : '-'}
                </div>
                <div className="text-xs text-slate-500">{t.data.contactInstitution || '-'}</div>
              </Td>
              <Td>
                <StatusBadge status={t.status} />
                {(t.reviewerComment || t.reviewer_comment) && (
                  <div className="mt-1 text-[11px] text-rose-500 line-clamp-2">
                    "{t.reviewerComment || t.reviewer_comment}"
                  </div>
                )}
              </Td>
              <Td>{formatDate(t.submittedAt || t.submitted_at || t.createdAt || t.created_at)}</Td>
              <Td>{formatDate(t.updatedAt || t.updated_at)}</Td>
              <Td className="text-right">
                {role === 'reviewer' ? (
                  <Link
                    to={`/dashboard/reviewer/review/${t.id}`}
                    className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-50 hover:bg-slate-800"
                  >
                    Review
                  </Link>
                ) : role === 'user' && t.status === 'draft' ? (
                  <Link
                    to={`/dashboard/user/submit?draft=${encodeURIComponent(t.id)}`}
                    className="inline-flex items-center rounded-full border border-sky-600 bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-900 hover:bg-sky-100"
                  >
                    Continue draft
                  </Link>
                ) : role === 'user' && t.status === 'approved' ? (
                  <Link
                    to={`/dashboard/user/submit?edit=${encodeURIComponent(t.id)}`}
                    className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-100"
                  >
                    Update trial
                  </Link>
                ) : role === 'user' && t.status === 'rejected' ? (
                  <Link
                    to={`/dashboard/user/my-trials?resubmit=${encodeURIComponent(t.id)}`}
                    className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Edit &amp; Resubmit
                  </Link>
                ) : (
                  <span className="text-[11px] text-slate-400">-</span>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ className = '', children }) {
  return (
    <th scope="col" className={`px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 ${className}`}>
      {children}
    </th>
  )
}

function Td({ className = '', children }) {
  return <td className={`px-3 py-3 align-top text-xs text-slate-700 ${className}`}>{children}</td>
}

function formatDate(value) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return '-'
  }
}
