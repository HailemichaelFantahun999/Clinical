import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ViewUsers() {
  const { user, adminListUsers } = useAuth()
  const [users, setUsers] = useState([])

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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">System Users</h1>
        <p className="mt-1 text-xs text-slate-600">
          Overview of all user accounts in the Clinical Trial Registration System.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Created</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {!users.length && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-center text-xs text-slate-500">
                  No users found.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/60">
                <Td>{u.email}</Td>
                <Td className="capitalize">{u.role}</Td>
                <Td>{formatDate(u.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children }) {
  return (
    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
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

