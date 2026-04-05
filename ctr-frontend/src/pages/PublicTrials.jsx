import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicTrialDetail from '../components/PublicTrialDetail.jsx'
import PublicTrialFiltersPanel from '../components/PublicTrialFiltersPanel.jsx'
import { filterApprovedTrials, getDefaultFilters } from '../lib/publicTrialFilters.js'
import { listPublicApprovedTrials } from '../services/trials'

export default function PublicTrials() {
  const [trials, setTrials] = useState([
    {
      id: 'mock-1',
      status: 'approved',
      data: {
        scientificTitle: 'Phase III Study of Novacell in Advanced Lung Cancer',
        trialTitle: 'Phase III Study of Novacell in Advanced Lung Cancer',
        primarySponsor: 'Memorial Sloan Kettering Cancer Center',
        condition: 'Lung Cancer',
        phase: 'Phase 3',
        design: 'Randomized, Double-Blind',
        gender: 'Both',
        minAge: 18,
        contactFirstName: 'Jane',
        contactLastName: 'Doe',
        contactTitle: 'Dr.',
        contactInstitution: 'Memorial Sloan Kettering Cancer Center',
        contactEmail: 'jane.doe@example.com'
      }
    },
    {
      id: 'mock-2',
      status: 'approved',
      data: {
        scientificTitle: 'Efficacy of Cognitive Behavioral Therapy for Insomnia',
        trialTitle: 'Efficacy of Cognitive Behavioral Therapy for Insomnia',
        primarySponsor: 'King\'s College London',
        condition: 'Chronic Insomnia',
        phase: 'Phase 2',
        design: 'Open Label',
        gender: 'Both',
        minAge: 18,
        contactFirstName: 'John',
        contactLastName: 'Smith',
        contactTitle: 'Prof.',
        contactInstitution: 'King\'s College London',
        contactEmail: 'john.smith@example.co.uk'
      }
    }
  ])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(getDefaultFilters)

  useEffect(() => {
    async function run() {
      setLoading(true)
      try {
        const rows = await listPublicApprovedTrials()
        if (rows && rows.length > 0) setTrials(rows)
      } catch {
        // Fallback to sample dummy data when DB is missing (e.g. Vercel)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const filtered = useMemo(() => filterApprovedTrials(trials, filters), [trials, filters])
  const patch = useCallback((partial) => setFilters((prev) => ({ ...prev, ...partial })), [])
  const reset = useCallback(() => setFilters(getDefaultFilters()), [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Search trials</h1>
          <p className="mt-1 max-w-2xl text-xs text-slate-600">
            Search and explore <strong>approved</strong> trials registered in ECTR. Use the filters to narrow results,
            open a trial to view the full registry record, or switch to diagrams for a visual summary.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/trials/diagrams"
            className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-100"
          >
            Open diagrams
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
        <Link to="/trials" className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
          List view
        </Link>
        <Link to="/trials/diagrams" className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
          Diagram view
        </Link>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <PublicTrialFiltersPanel filters={filters} onChange={patch} onReset={reset} />

        <div className="min-w-0 flex-1 space-y-4">
          <p className="text-[11px] text-slate-600">
            {loading ? (
              'Loading approved trials...'
            ) : (
              <>
                Showing <strong>{filtered.length}</strong> of <strong>{trials.length}</strong> approved trial
                {trials.length === 1 ? '' : 's'}.
              </>
            )}
          </p>

          {!loading && !trials.length && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-soft">
              No approved trials yet. Approved studies will appear here for public search.
            </div>
          )}

          {!loading && !!trials.length && !filtered.length && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-900">
              No trials match your filters. Try clearing some criteria or use broader keywords.
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((t) => (
              <PublicTrialDetail key={t.id} trial={t} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
