import React from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import logoImage from '../assets/images/logo.png'

const navByRole = {
  admin: [
    { to: '/dashboard/admin', label: 'Overview' },
    { to: '/dashboard/admin/create-reviewer', label: 'Create Reviewer' },
    { to: '/dashboard/admin/manage-reviewers', label: 'Manage Reviewers' },
    { to: '/dashboard/admin/reset-reviewer-password', label: 'Reset Reviewer Password' },
    { to: '/dashboard/admin/users', label: 'System Users' }
  ],
  reviewer: [
    { to: '/dashboard/reviewer', label: 'Dashboard' },
    { to: '/dashboard/reviewer?tab=pending', label: 'Pending Trials' },
    { to: '/dashboard/reviewer?tab=approved', label: 'Approved Trials' },
    { to: '/dashboard/reviewer?tab=rejected', label: 'Rejected Trials' }
  ],
  user: [
    { to: '/dashboard/user', label: 'Overview' },
    { to: '/dashboard/user/submit', label: 'Submit New Trial' },
    { to: '/dashboard/user/my-trials', label: 'My Trials' }
  ]
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const items = navByRole[user?.role] || []

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white/80 px-3 py-4 shadow-soft lg:flex">
        <Link to="/" className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white shadow-soft p-0.5">
            <img src={logoImage} alt="CTR logo" className="h-full w-full object-contain" />
          </div>
          <div className="text-xs font-semibold text-slate-900">Clinical Trial Registration</div>
        </Link>
        <div className="mb-4 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Navigation</div>
        <nav className="flex flex-1 flex-col gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'rounded-xl px-3 py-2 text-xs font-medium',
                  isActive
                    ? 'bg-slate-900 text-slate-50 shadow-soft'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 border-t border-slate-200 pt-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Signed in as</div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs">
            <div className="font-semibold text-slate-900">{user?.email}</div>
            <div className="mt-0.5 text-[11px] capitalize text-slate-500">{user?.role} dashboard</div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 shadow-sm lg:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white shadow-soft p-0.5">
              <img src={logoImage} alt="CTR logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 capitalize">{user?.role} dashboard</div>
              <div className="text-[11px] text-slate-500">Clinical Trial Registration System</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/trials" className="hidden rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 sm:inline-flex">
              View Public Trials
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-50 shadow-soft hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 px-3 py-4 lg:px-6 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
