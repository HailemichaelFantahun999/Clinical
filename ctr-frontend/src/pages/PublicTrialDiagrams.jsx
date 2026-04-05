import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicTrialFiltersPanel from '../components/PublicTrialFiltersPanel.jsx'
import { DISEASE_OPTIONS, PHASE_OPTIONS, RECRUITMENT_OPTIONS, filterApprovedTrials, getDefaultFilters } from '../lib/publicTrialFilters.js'
import { listPublicApprovedTrials } from '../services/trials'

const CHART_COLORS = ['#0f766e', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#22c55e', '#f97316', '#64748b']

export default function PublicTrialDiagrams() {
  const [trials, setTrials] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(getDefaultFilters)

  useEffect(() => {
    async function run() {
      setLoading(true)
      try {
        const rows = await listPublicApprovedTrials()
        setTrials(rows)
      } catch {
        setTrials([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const filtered = useMemo(() => filterApprovedTrials(trials, filters), [trials, filters])
  const patch = useCallback((partial) => setFilters((prev) => ({ ...prev, ...partial })), [])
  const reset = useCallback(() => setFilters(getDefaultFilters()), [])
  const stats = useMemo(() => buildDiagramStats(filtered), [filtered])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Trial diagrams</h1>
          <p className="mt-1 max-w-3xl text-xs text-slate-600">
            Filter <strong>approved</strong> trials and explore a visual summary of the registry. The charts update from
            the same public filters used in search.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/trials"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to search
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-soft hover:bg-slate-800"
          >
            Register a trial
          </Link>
        </div>
      </div>

      <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-soft">
        <Link to="/trials" className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
          List view
        </Link>
        <Link to="/trials/diagrams" className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
          Diagram view
        </Link>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <PublicTrialFiltersPanel filters={filters} onChange={patch} onReset={reset} />

        <div className="min-w-0 flex-1 space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Approved trials shown" value={loading ? '...' : String(filtered.length)} note="Filtered public registry records" tone="teal" />
            <MetricCard label="Countries of recruitment" value={loading ? '...' : String(stats.countryCount)} note="Unique countries across filtered trials" tone="sky" />
            <MetricCard label="Trial phases used" value={loading ? '...' : String(stats.phaseCount)} note="Distinct phases in the current result set" tone="amber" />
            <MetricCard label="Disease categories" value={loading ? '...' : String(stats.diseaseCount)} note="Categories represented after filtering" tone="rose" />
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-soft">
              Loading approved-trial diagrams...
            </div>
          ) : !trials.length ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-soft">
              No approved trials yet. Diagrams will appear here once approved records exist.
            </div>
          ) : !filtered.length ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-8 text-sm text-amber-900">
              No approved trials match your current filters. Clear a few filters to see the diagrams fill in again.
            </div>
          ) : (
            <>
              <div className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
                <ChartCard
                  title="Recruitment status"
                  description="See where filtered approved trials currently sit in the recruitment lifecycle."
                >
                  <BarChart rows={stats.recruitmentRows} emptyLabel="No recruitment data in the filtered trials." />
                </ChartCard>

                <ChartCard title="Participant sex" description="Quick split of sex eligibility across the filtered approved trials.">
                  <DonutChart rows={stats.genderRows} emptyLabel="No sex eligibility values available." />
                </ChartCard>
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
                <ChartCard
                  title="Top disease categories"
                  description="The most represented health condition groupings in the filtered public registry."
                >
                  <BarChart rows={stats.diseaseRows} emptyLabel="No disease categories matched in the filtered trials." compact />
                </ChartCard>

                <ChartCard title="Trial phase" description="Distribution of phases in the filtered approved trials.">
                  <BarChart rows={stats.phaseRows} emptyLabel="No phase data in the filtered trials." />
                </ChartCard>
              </div>

              <ChartCard title="Registration timeline" description="How the filtered approved trials were registered over time.">
                <TimelineChart rows={stats.timelineRows} emptyLabel="Not enough registration dates to draw a timeline." />
              </ChartCard>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function buildDiagramStats(trials) {
  const recruitmentRows = buildOptionCounts(trials, RECRUITMENT_OPTIONS, (trial, label) =>
    includesNormalized(trial?.data?.recruitmentStatus, label)
  )

  const phaseRows = buildOptionCounts(trials, PHASE_OPTIONS, (trial, label) => normalizePhase(trial?.data?.trialPhase) === normalizePhase(label))
  const genderRows = buildGenderRows(trials)
  const diseaseRows = buildDiseaseRows(trials)
  const timelineRows = buildTimelineRows(trials)
  const countryCount = countUniqueCountries(trials)
  const phaseCount = phaseRows.filter((row) => row.value > 0).length
  const diseaseCount = diseaseRows.filter((row) => row.value > 0).length

  return {
    recruitmentRows,
    phaseRows,
    genderRows,
    diseaseRows,
    timelineRows,
    countryCount,
    phaseCount,
    diseaseCount
  }
}

function buildOptionCounts(trials, options, matcher) {
  return options
    .map((label) => ({ label, value: trials.filter((trial) => matcher(trial, label)).length }))
    .filter((row) => row.value > 0)
}

function buildGenderRows(trials) {
  const labels = ['Both', 'Female', 'Male', 'Unspecified']
  return labels
    .map((label) => ({
      label,
      value: trials.filter((trial) => {
        const value = normalizeText(trial?.data?.sex)
        if (!value) return label === 'Unspecified'
        return label === 'Unspecified' ? false : value === normalizeText(label)
      }).length
    }))
    .filter((row) => row.value > 0)
}

function buildDiseaseRows(trials) {
  return DISEASE_OPTIONS.map((label) => ({
    label,
    value: trials.filter((trial) => {
      const conditions = Array.isArray(trial?.data?.healthConditions) ? trial.data.healthConditions : []
      const normalizedLabel = normalizeText(label)
      return conditions.some((condition) => includesNormalized(condition, normalizedLabel) || includesNormalized(normalizedLabel, condition))
    }).length
  }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, 8)
}

function buildTimelineRows(trials) {
  const counts = new Map()
  trials.forEach((trial) => {
    const value = trial?.submitted_at || trial?.created_at
    if (!value) return
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    counts.set(key, (counts.get(key) || 0) + 1)
  })

  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12)
    .map(([key, value]) => ({
      label: formatMonthKey(key),
      value
    }))
}

function countUniqueCountries(trials) {
  const values = new Set()
  trials.forEach((trial) => {
    const centres = Array.isArray(trial?.data?.recruitmentCentres) ? trial.data.recruitmentCentres : []
    centres.forEach((centre) => {
      const country = normalizeText(centre?.country)
      if (country) values.add(country)
    })
  })
  return values.size
}

function MetricCard({ label, value, note, tone }) {
  const tones = {
    teal: 'from-teal-600/10 to-cyan-500/10 border-teal-100',
    sky: 'from-sky-600/10 to-blue-500/10 border-sky-100',
    amber: 'from-amber-500/10 to-orange-400/10 border-amber-100',
    rose: 'from-rose-500/10 to-pink-500/10 border-rose-100'
  }

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${tones[tone]} bg-white p-4 shadow-soft`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-slate-900">{value}</div>
      <p className="mt-2 text-xs text-slate-600">{note}</p>
    </div>
  )
}

function ChartCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function BarChart({ rows, emptyLabel, compact = false }) {
  if (!rows.length) return <EmptyChart label={emptyLabel} />
  const max = Math.max(...rows.map((row) => row.value), 1)

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {rows.map((row, index) => (
        <div key={row.label} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-xs text-slate-700">
            <span className="min-w-0 truncate font-medium">{row.label}</span>
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{row.value}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max((row.value / max) * 100, row.value ? 8 : 0)}%`,
                background: CHART_COLORS[index % CHART_COLORS.length]
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ rows, emptyLabel }) {
  if (!rows.length) return <EmptyChart label={emptyLabel} />
  const total = rows.reduce((sum, row) => sum + row.value, 0)
  let cursor = 0
  const gradients = rows.map((row, index) => {
    const start = total ? (cursor / total) * 100 : 0
    cursor += row.value
    const end = total ? (cursor / total) * 100 : 0
    return `${CHART_COLORS[index % CHART_COLORS.length]} ${start}% ${end}%`
  })

  return (
    <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
      <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full" style={{ background: `conic-gradient(${gradients.join(', ')})` }}>
        <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
          <div className="text-2xl font-semibold text-slate-900">{total}</div>
          <div className="text-[11px] text-slate-500">Trials</div>
        </div>
      </div>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.label} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
              <span className="truncate font-medium text-slate-700">{row.label}</span>
            </div>
            <div className="shrink-0 font-semibold text-slate-900">{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TimelineChart({ rows, emptyLabel }) {
  if (!rows.length) return <EmptyChart label={emptyLabel} />
  const max = Math.max(...rows.map((row) => row.value), 1)

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {rows.map((row, index) => (
        <div key={row.label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <div className="text-[11px] font-semibold text-slate-500">{row.label}</div>
          <div className="mt-3 flex items-end gap-3">
            <div className="flex h-28 w-10 items-end rounded-full bg-white p-1 shadow-inner">
              <div
                className="w-full rounded-full"
                style={{
                  height: `${Math.max((row.value / max) * 100, row.value ? 12 : 0)}%`,
                  background: CHART_COLORS[index % CHART_COLORS.length]
                }}
              />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{row.value}</div>
              <div className="text-[11px] text-slate-500">registered</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyChart({ label }) {
  return <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{label}</div>
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim()
}

function includesNormalized(left, right) {
  const a = normalizeText(left)
  const b = normalizeText(right)
  if (!a || !b) return false
  return a.includes(b) || b.includes(a)
}

function normalizePhase(value) {
  return normalizeText(value).replace(/\s+/g, '').replace(/_/g, '-').replace('phase', 'phase-')
}

function formatMonthKey(key) {
  const [year, month] = key.split('-').map(Number)
  const date = new Date(year, (month || 1) - 1, 1)
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

