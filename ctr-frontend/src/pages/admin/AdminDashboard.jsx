import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { adminDashboardStats } from '../../services/trials'

export default function AdminDashboard() {
  const { user, adminListUsers } = useAuth()
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ total_trials: 0, pending_trials: 0, pending_registrations: 0 })
  const [recentTrials, setRecentTrials] = useState([])

  useEffect(() => {
    async function run() {
      try {
        const [list, dashboard] = await Promise.all([adminListUsers({ adminUserId: user.id }), adminDashboardStats()])
        setUsers(list)
        setStats(
          dashboard.stats || { total_trials: 0, pending_trials: 0, pending_registrations: 0 }
        )
        setRecentTrials(dashboard.recentTrials || [])
      } catch {
        setUsers([])
        setStats({ total_trials: 0, pending_trials: 0, pending_registrations: 0 })
        setRecentTrials([])
      }
    }
    run()
  }, [adminListUsers, user])

  const reviewers = users.filter((u) => u.role === 'reviewer').length
  const researchers = users.filter((u) => u.role === 'user').length
  const admins = users.filter((u) => u.role === 'admin').length
  const totalTrials = Number(stats.total_trials || 0)
  const pending = Number(stats.pending_trials || 0)
  const pendingReg = Number(stats.pending_registrations || 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">System Administration</h1>
        <p className="mt-1 text-xs text-slate-600">
          Manage accounts, approve new researchers, assign trials to reviewers, and monitor throughput.
        </p>
      </div>

      {(pendingReg > 0 || pending > 0) && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-700 shadow-soft">
          {pendingReg > 0 && (
            <Link to="/dashboard/admin/users" className="font-semibold text-amber-800 hover:underline">
              {pendingReg} researcher registration{pendingReg === 1 ? '' : 's'} awaiting approval
            </Link>
          )}
          {pendingReg > 0 && pending > 0 && <span className="text-slate-400">·</span>}
          {pending > 0 && (
            <Link to="/dashboard/admin/assign-trials" className="font-semibold text-slate-900 hover:underline">
              {pending} trial{pending === 1 ? '' : 's'} pending assignment or review
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Admins" value={admins} />
        <Metric label="Reviewers" value={reviewers} />
        <Metric label="Researchers" value={researchers} />
        <Metric label="Trials (pending)" value={`${pending} / ${totalTrials}`} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-slate-900">Recent Trials Snapshot</h2>
        <p className="mt-1 text-[11px] text-slate-500">
          A quick overview of the most recent submissions across the system.
        </p>
        <div className="mt-3 space-y-2">
          {!recentTrials.length && <p className="text-xs text-slate-500">No trials have been submitted yet.</p>}
          {recentTrials.map((t) => (
            <div
              key={t.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                  {t.data?.title || t.data?.trialTitle || 'Untitled trial'}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {t.data?.principalInvestigator || 'PI -'} · {t.data?.institution || 'Institution -'}
                </div>
              </div>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-soft">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
    </div>
  )
}
