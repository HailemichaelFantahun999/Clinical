import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToaster } from '../../context/ToasterContext.jsx'
import { listMyTrials } from '../../services/trials'
import StatusBadge from '../../components/StatusBadge.jsx'

export default function UserDashboard() {
  const { user, updateProfile } = useAuth()
  const toaster = useToaster()
  const [profile, setProfile] = useState({
    fullName: user?.profile?.fullName || '',
    institution: user?.profile?.institution || '',
    phone: user?.profile?.phone || ''
  })
  const [saving, setSaving] = useState(false)
  const [trials, setTrials] = useState([])

  useEffect(() => {
    if (!user) return
    async function run() {
      try {
        const rows = await listMyTrials()
        setTrials(rows)
      } catch {
        setTrials([])
      }
    }
    run()
  }, [user])

  function handleChange(e) {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({ userId: user.id, profile })
      toaster.push({ type: 'success', title: 'Profile saved', message: 'Your personal information was updated.' })
    } catch (err) {
      toaster.push({ type: 'error', title: 'Failed to save', message: err.message || 'Unable to save profile.' })
    } finally {
      setSaving(false)
    }
  }

  const pending = trials.filter((t) => t.status === 'pending').length
  const approved = trials.filter((t) => t.status === 'approved').length
  const rejected = trials.filter((t) => t.status === 'rejected').length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Researcher Overview</h1>
          <p className="mt-1 text-xs text-slate-600">
            Complete your personal information and submit clinical trial registrations.
          </p>
        </div>
        <Link
          to="/dashboard/user/submit"
          className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-50 shadow-soft hover:bg-slate-800"
        >
          Submit New Trial
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pending Review" value={pending} tone="amber" />
        <StatCard label="Approved Trials" value={approved} tone="emerald" />
        <StatCard label="Rejected Trials" value={rejected} tone="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-sm font-semibold text-slate-900">Recent Submissions</h2>
          <p className="mt-1 text-[11px] text-slate-500">
            Track the status of your most recent clinical trial registrations.
          </p>
          <div className="mt-3 space-y-2">
            {!trials.length && (
              <p className="text-xs text-slate-500">
                You have not submitted any trials yet. Start by completing your profile and submitting a new trial.
              </p>
            )}
            {trials.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                    {t.data.title || t.data.trialTitle || 'Untitled trial'}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    Submitted {formatDate(t.submittedAt || t.createdAt)}
                    {t.reviewerComment && t.status === 'rejected' && (
                      <span className="ml-1 text-rose-500">
                        · Reviewer comment: <span className="italic">“{t.reviewerComment}”</span>
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
          {trials.length > 5 && (
            <div className="mt-3 text-right text-[11px]">
              <Link to="/dashboard/user/my-trials" className="font-semibold text-slate-700 hover:underline">
                View all submitted trials
              </Link>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-sm font-semibold text-slate-900">Personal Information</h2>
          <p className="mt-1 text-[11px] text-slate-500">
            Provide accurate contact details so reviewers can reach you if clarification is required.
          </p>
          <form onSubmit={handleSave} className="mt-3 space-y-3 text-xs">
            <label className="block">
              <span className="mb-1 block font-medium text-slate-700">Full Name</span>
              <input
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                className="field-input"
                placeholder="Your full legal name"
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-medium text-slate-700">Institution</span>
              <input
                name="institution"
                value={profile.institution}
                onChange={handleChange}
                className="field-input"
                placeholder="Affiliated institution / organization"
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-medium text-slate-700">Contact Phone</span>
              <input
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="field-input"
                placeholder="+1 555 0100"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-slate-50 shadow-soft hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? 'Saving…' : 'Save Information'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value, tone }) {
  const map = {
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100'
  }
  const cls = map[tone] || 'bg-slate-50 text-slate-700 border-slate-100'
  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-soft ${cls}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
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

