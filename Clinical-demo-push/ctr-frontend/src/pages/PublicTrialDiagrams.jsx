import React, { useEffect, useMemo, useState } from 'react'
import { listPublicApprovedTrials } from '../services/trials'

export default function PublicTrialDiagrams() {
  const [trials, setTrials] = useState([])

  useEffect(() => {
    async function run() {
      try {
        setTrials(await listPublicApprovedTrials())
      } catch {
        setTrials([])
      }
    }
    run()
  }, [])

  const stats = useMemo(() => buildStats(trials), [trials])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Public Trial Diagrams</h1>
          <p className="mt-1 text-xs text-slate-600">
            Simple visual summaries generated from the approved trials currently visible in the public registry.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <Metric label="Approved trials" value={String(stats.total)} />
        <Metric label="Cities represented" value={String(stats.cities.length)} />
        <Metric label="Diseases represented" value={String(stats.diseases.length)} />
        <Metric label="Active recruiting" value={String(stats.recruiting)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartBlock title="Top diseases" rows={stats.diseases} emptyLabel="No disease data yet." />
        <ChartBlock title="Trial locations" rows={stats.cities} emptyLabel="No city data yet." />
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-soft">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  )
}

function ChartBlock({ title, rows, emptyLabel }) {
  const max = rows.length ? Math.max(...rows.map((row) => row.value)) : 1
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-3">
        {!rows.length && <p className="text-xs text-slate-500">{emptyLabel}</p>}
        {rows.map((row) => (
          <div key={row.label} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
              <span className="font-medium text-slate-800">{row.label}</span>
              <span>{row.value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-slate-900"
                style={{ width: `${Math.max(12, Math.round((row.value / max) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function buildStats(trials) {
  const diseaseCounts = new Map()
  const cityCounts = new Map()
  let recruiting = 0

  for (const trial of trials) {
    const diseases = String(trial?.data?.diseases || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    const city = String(trial?.data?.recruitmentCentreCity || '').trim()
    const status = String(trial?.data?.recruitmentStatus || '').trim().toLowerCase()

    for (const disease of diseases) {
      diseaseCounts.set(disease, (diseaseCounts.get(disease) || 0) + 1)
    }
    if (city) {
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1)
    }
    if (status.includes('recruit')) {
      recruiting += 1
    }
  }

  return {
    total: trials.length,
    recruiting,
    diseases: toRows(diseaseCounts),
    cities: toRows(cityCounts)
  }
}

function toRows(map) {
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, 8)
}
