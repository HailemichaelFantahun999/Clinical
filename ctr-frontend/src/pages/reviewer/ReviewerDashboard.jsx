import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToaster } from '../../context/ToasterContext.jsx'
import { reviewerListTrials } from '../../services/trials'
import TrialTable from '../../components/TrialTable.jsx'

export default function ReviewerDashboard() {
  const { user, changePassword } = useAuth()
  const toaster = useToaster()
  const location = useLocation()
  const navigate = useNavigate()
  const [trials, setTrials] = useState([])
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [changingPw, setChangingPw] = useState(false)

  const params = new URLSearchParams(location.search)
  const selectedTab = params.get('tab')
  const tab = selectedTab === 'pending' || selectedTab === 'approved' || selectedTab === 'rejected' ? selectedTab : ''

  useEffect(() => {
    if (!user) return
    async function run() {
      try {
        const status = tab
        const rows = await reviewerListTrials({ status })
        setTrials(rows)
      } catch {
        setTrials([])
      }
    }
    run()
  }, [user, tab])

  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 })

  useEffect(() => {
    if (!user) return
    async function loadCounts() {
      try {
        const all = await reviewerListTrials({ status: '' })
        setCounts({
          pending: all.filter((t) => t.status === 'pending').length,
          approved: all.filter((t) => t.status === 'approved').length,
          rejected: all.filter((t) => t.status === 'rejected').length
        })
      } catch {
        setCounts({ pending: 0, approved: 0, rejected: 0 })
      }
    }
    loadCounts()
  }, [user, tab])

  function setTab(next) {
    navigate(`/dashboard/reviewer?tab=${encodeURIComponent(next)}`)
  }

  function handlePwChange(e) {
    const { name, value } = e.target
    setPwForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handlePwSubmit(e) {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toaster.push({ type: 'error', title: 'Validation error', message: 'New passwords do not match.' })
      return
    }
    setChangingPw(true)
    try {
      await changePassword({ userId: user.id, currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toaster.push({ type: 'success', title: 'Password updated', message: 'Your password has been changed.' })
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toaster.push({ type: 'error', title: 'Change failed', message: err.message || 'Unable to change password.' })
    } finally {
      setChangingPw(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Reviewer Dashboard</h1>
          <p className="mt-1 text-xs text-slate-600">
            You only see trials the administrator assigned to you. Approve those that meet criteria, or reject with a
            clear reason.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TabCard label="Pending Trials" value={counts.pending} active={tab === 'pending'} onClick={() => setTab('pending')} />
        <TabCard label="Approved" value={counts.approved} active={tab === 'approved'} onClick={() => setTab('approved')} />
        <TabCard label="Rejected" value={counts.rejected} active={tab === 'rejected'} onClick={() => setTab('rejected')} />
      </div>

      <TrialTable trials={trials} role="reviewer" />

      {user?.mustChangePassword && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-soft">
          <h2 className="text-sm font-semibold text-amber-900">Action required: Change your password</h2>
          <p className="mt-1 text-[11px] text-amber-800">
            For security, you must change the temporary password assigned by the System Admin.
          </p>
          <form onSubmit={handlePwSubmit} className="mt-3 grid gap-3 text-xs md:grid-cols-3">
            <label className="block">
              <span className="mb-1 block font-medium text-amber-900">Current password</span>
              <input
                type="password"
                name="currentPassword"
                value={pwForm.currentPassword}
                onChange={handlePwChange}
                required
                className="field-input"
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-medium text-amber-900">New password</span>
              <input
                type="password"
                name="newPassword"
                value={pwForm.newPassword}
                onChange={handlePwChange}
                required
                className="field-input"
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-medium text-amber-900">Confirm new password</span>
              <input
                type="password"
                name="confirmPassword"
                value={pwForm.confirmPassword}
                onChange={handlePwChange}
                required
                className="field-input"
              />
            </label>
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={changingPw}
                className="mt-2 inline-flex items-center rounded-full bg-amber-900 px-5 py-2 text-xs font-semibold text-amber-50 shadow-soft hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-amber-500"
              >
                {changingPw ? 'Updating password…' : 'Update password'}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  )
}

function TabCard({ label, value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col items-start rounded-2xl border px-4 py-3 text-left shadow-soft ${
        active ? 'border-slate-900 bg-slate-900 text-slate-50' : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</span>
      <span className="mt-1 text-xl font-semibold">{value}</span>
    </button>
  )
}


