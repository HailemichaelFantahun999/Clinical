import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-soft">
          Loading…
        </div>
      </div>
    )
  }

  if (!user) {
    const next = `${location.pathname}${location.search || ''}`
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace state={{ from: location.pathname }} />
  }
  return children
}

