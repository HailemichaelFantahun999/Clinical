import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToaster } from '../../context/ToasterContext.jsx'

export default function ViewUsers() {
  const { user, adminListUsers, adminReviewRegistration } = useAuth()
  const toaster = useToaster()
  const [users, setUsers] = useState([])
  const [busyId, setBusyId] = useState(null)

  const loadUsers = useCallback(async () => {
    try {
      const list = await adminListUsers({ adminUserId: user.id })
      setUsers(list)
    } catch {
      setUsers([])
    }
  }, [adminListUsers, user])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  async function handleRegistration(userId, action) {
    setBusyId(userId)
    try {
      await adminReviewRegistration({ userId, action })
      toaster.push({
        type: 'success',
        title: action === 'approve' ? 'Account approved' : 'Registration declined',
        message:
          action === 'approve'
            ? 'The user may now sign in.'
            : 'The user will not be able to sign in.'
      })
      await loadUsers()
    } catch (err) {
      toaster.push({ type: 'error', title: 'Update failed', message: err.message || 'Unable to update registration.' })
    } finally {
      setBusyId(null)
    }
  }

  const pendingResearchers = users.filter((u) => u.role === 'user' && u.registrationStatus === 'pending')

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">System Users</h1>
        <p className="mt-1 text-xs text-slate-600">
          Approve self-service researcher registrations and review all accounts in ECTR.
        </p>
      </div>

      {pendingResearchers.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-soft">
          <h2 className="text-sm font-semibold text-amber-950">Pending researcher registrations ({pendingResearchers.length})</h2>
          <p className="mt-1 text-[11px] text-amber-900/90">
            New users who signed up are waiting for approval before they can log in.
          </p>
          <ul className="mt-3 space-y-2">
            {pendingResearchers.map((u) => (
              <li
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200/80 bg-white px-3 py-2 text-xs"
              >
                <span className="font-medium text-slate-900">{u.email}</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => handleRegistration(u.id, 'approve')}
                    className="rounded-full bg-emerald-700 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                  >
                    {busyId === u.id ? '…' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => handleRegistration(u.id, 'reject')}
                    className="rounded-full border border-rose-300 bg-white px-3 py-1 text-[11px] font-semibold text-rose-800 hover:bg-rose-50 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Registration</Th>
              <Th>Created</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {!users.length && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-xs text-slate-500">
                  No users found.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/60">
                <Td>{u.email}</Td>
                <Td className="capitalize">{u.role}</Td>
                <Td className="text-xs">
                  {u.role === 'user' ? (
                    <span
                      className={
                        u.registrationStatus === 'pending'
                          ? 'font-semibold text-amber-700'
                          : u.registrationStatus === 'rejected'
                            ? 'text-rose-600'
                            : 'text-slate-600'
                      }
                    >
                      {u.registrationStatus || 'approved'}
                    </span>
                  ) : (
                    '—'
                  )}
                </Td>
                <Td>{formatDate(u.createdAt)}</Td>
                <Td className="text-right">
                  {u.role === 'user' && u.registrationStatus === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => handleRegistration(u.id, 'approve')}
                        className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => handleRegistration(u.id, 'reject')}
                        className="rounded-full border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">—</span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-slate-500">
        Assign submitted trials to reviewers under{' '}
        <Link to="/dashboard/admin/assign-trials" className="font-semibold text-slate-700 hover:underline">
          Assign trials
        </Link>
        .
      </p>
    </div>
  )
}

function Th({ children, className = '' }) {
  return (
    <th className={`px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 ${className}`}>
      {children}
    </th>
  )
}

function Td({ className = '', children }) {
  return <td className={`px-3 py-3 text-xs text-slate-700 ${className}`}>{children}</td>
}

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return '—'
  }
}
