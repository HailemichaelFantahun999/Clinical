import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ManageReviewers() {
  const { user, adminListReviewers } = useAuth()
  const [reviewers, setReviewers] = useState([])

  useEffect(() => {
    async function run() {
      try {
        const list = await adminListReviewers({ adminUserId: user.id })
        setReviewers(list)
      } catch {
        setReviewers([])
      }
    }
    run()
  }, [adminListReviewers, user])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Manage Reviewers</h1>
        <p className="mt-1 text-xs text-slate-600">
          View reviewer accounts created in the system. Password resets can be performed from the dedicated page.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Email
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Created
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Must Change Password
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {!reviewers.length && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-center text-xs text-slate-500">
                  No reviewers have been created yet.
                </td>
              </tr>
            )}
            {reviewers.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60">
                <td className="px-3 py-3 text-xs text-slate-800">{r.email}</td>
                <td className="px-3 py-3 text-xs text-slate-600">{formatDate(r.createdAt)}</td>
                <td className="px-3 py-3 text-xs text-slate-600">
                  {r.mustChangePassword ? (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                      Yes
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      No
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

