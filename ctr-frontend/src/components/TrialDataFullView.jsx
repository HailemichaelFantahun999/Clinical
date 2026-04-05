import React from 'react'
import { api } from '../services/api'
import { canDownloadUploadedFile, getUploadedFileName } from '../lib/trialFiles.js'

function Section({ title, id, children }) {
  return (
    <section id={id} className="scroll-mt-20 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wide text-slate-600">{title}</h3>
      <div className="mt-3 space-y-1.5 text-[11px] text-slate-700">{children}</div>
    </section>
  )
}

function Row({ label, value, multiline }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="grid gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-3">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className={`text-slate-800 ${multiline ? 'whitespace-pre-wrap' : ''}`}>{value}</dd>
    </div>
  )
}

const SECTION_NAV = [
  { id: 'trial-section-1', label: 'Trial details' },
  { id: 'trial-section-2', label: 'Secondary IDs' },
  { id: 'trial-section-3', label: 'Study design' },
  { id: 'trial-section-4', label: 'Interventions' },
  { id: 'trial-section-5', label: 'Eligibility' },
  { id: 'trial-section-6', label: 'Outcomes' },
  { id: 'trial-section-7', label: 'Recruitment' },
  { id: 'trial-section-8', label: 'Ethics' },
  { id: 'trial-section-9', label: 'Funding' },
  { id: 'trial-section-10', label: 'Sponsors' },
  { id: 'trial-section-11', label: 'Collaborators' },
  { id: 'trial-section-12', label: 'Contacts' },
  { id: 'trial-section-13', label: 'IPD & results' }
]

export function TrialDataNav({ className = '' }) {
  return (
    <nav className={`rounded-xl border border-slate-200 bg-slate-50/80 p-3 ${className}`} aria-label="Trial sections">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Jump to</p>
      <ul className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto text-[11px]">
        {SECTION_NAV.map((s, i) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="block rounded-lg px-2 py-1 text-slate-700 hover:bg-white hover:text-slate-900">
              {i + 1}. {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function TrialDataFullView({ trial, showRecordFooter = true, className = '', allowPublicDownloads = false }) {
  const d = trial?.data || {}

  return (
    <div className={`space-y-4 ${className}`}>
      <Section title="1. Trial details" id="trial-section-1">
        <dl className="space-y-1">
          <Row label="Public title" value={d.publicTitle || d.title} />
          <Row label="Scientific title" value={d.scientificTitle} />
          <Row label="Brief summary" value={d.briefSummary} multiline />
          <Row label="Trial design" value={d.trialDesign} />
          <Row label="Phase" value={d.trialPhase} />
          <Row label="Acronym" value={d.acronym} />
          <Row
            label="Health conditions"
            value={Array.isArray(d.healthConditions) ? d.healthConditions.join(', ') : d.diseases}
          />
          <Row label="Purpose" value={d.purpose} />
          <Row label="Anticipated start" value={d.anticipatedStartDate} />
          <Row label="Actual start" value={d.actualStartDate} />
          <Row label="Last follow-up" value={d.lastFollowUpDate} />
          <Row label="Completion" value={d.completionDate} />
          <Row label="Target participants" value={d.targetParticipants} />
          <Row label="Final participants" value={d.finalParticipants} />
          <Row label="Recruitment status" value={d.recruitmentStatus} />
          <Row label="Publication URL" value={d.publicationUrl} />
        </dl>
      </Section>

      <Section title="2. Secondary identifiers" id="trial-section-2">
        <dl className="space-y-1">
          <Row label="Secondary ID applicable" value={d.hasSecondaryId} />
          <Row label="Secondary ID(s)" value={d.secondaryIds} />
          <Row label="Issuing authority" value={d.secondaryIdIssuingAuthority} />
        </dl>
      </Section>

      <Section title="3. Study design" id="trial-section-3">
        <dl className="space-y-1">
          <Row label="Intervention assignment" value={d.interventionAssignment} />
          <Row label="Allocation" value={d.allocation} />
          <Row label="Allocation concealment" value={d.allocationConcealment} />
          <Row label="Masking" value={d.maskingType} />
          <Row label="Masking roles" value={Array.isArray(d.maskingRoles) ? d.maskingRoles.join(', ') : ''} />
        </dl>
      </Section>

      <Section title="4. Interventions" id="trial-section-4">
        {(Array.isArray(d.interventions) ? d.interventions : []).length === 0 && (
          <p className="text-[11px] italic text-slate-400">No interventions listed.</p>
        )}
        {(Array.isArray(d.interventions) ? d.interventions : []).map((it, i) => (
          <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
            <p className="text-[10px] font-semibold text-slate-600">Intervention {i + 1}</p>
            <dl className="mt-1 space-y-1">
              <Row label="Type" value={it.type} />
              <Row label="Name" value={it.name} />
              <Row label="Dose" value={it.dose} />
              <Row label="Duration" value={it.duration} />
              <Row label="Description" value={it.description} multiline />
              <Row label="Group size" value={it.groupSize} />
              <Row label="Nature of control" value={it.natureOfControl} />
            </dl>
          </div>
        ))}
      </Section>

      <Section title="5. Eligibility" id="trial-section-5">
        <dl className="space-y-1">
          <Row label="Inclusion" value={d.inclusionCriteria} multiline />
          <Row label="Exclusion" value={d.exclusionCriteria} multiline />
          <Row label="Age groups" value={Array.isArray(d.ageGroups) ? d.ageGroups.join(', ') : ''} />
          <Row label="Minimum age" value={`${d.minAge || ''} ${d.minAgeUnit || ''}`.trim()} />
          <Row label="Maximum age" value={`${d.maxAge || ''} ${d.maxAgeUnit || ''}`.trim()} />
          <Row label="Sex" value={d.sex} />
        </dl>
      </Section>

      <Section title="6. Outcomes" id="trial-section-6">
        {(Array.isArray(d.outcomes) ? d.outcomes : []).length === 0 && (
          <p className="text-[11px] italic text-slate-400">No outcomes listed.</p>
        )}
        {(Array.isArray(d.outcomes) ? d.outcomes : []).map((o, i) => (
          <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
            <dl className="space-y-1">
              <Row label="Type" value={o.type} />
              <Row label="Description" value={o.description} multiline />
              <Row label="Timepoints" value={o.timepoints} />
            </dl>
          </div>
        ))}
      </Section>

      <Section title="7. Recruitment centres" id="trial-section-7">
        {(Array.isArray(d.recruitmentCentres) ? d.recruitmentCentres : []).length === 0 && (
          <p className="text-[11px] italic text-slate-400">No centres listed.</p>
        )}
        {(Array.isArray(d.recruitmentCentres) ? d.recruitmentCentres : []).map((c, i) => (
          <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
            <dl className="space-y-1">
              <Row label="Name" value={c.name} />
              <Row label="Street" value={c.street} />
              <Row label="City" value={c.city} />
              <Row label="Postal code" value={c.postalCode} />
              <Row label="Country" value={c.country} />
              <Row label="Lat / Lng" value={[c.lat, c.lng].filter(Boolean).join(', ') || ''} />
            </dl>
          </div>
        ))}
      </Section>

      <Section title="8. Ethics approvals" id="trial-section-8">
        {(Array.isArray(d.ethicsApprovals) ? d.ethicsApprovals : []).length === 0 && (
          <p className="text-[11px] italic text-slate-400">No ethics records listed.</p>
        )}
        {(Array.isArray(d.ethicsApprovals) ? d.ethicsApprovals : []).map((e, i) => (
          <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
            <dl className="space-y-1">
              <Row label="Obtained" value={e.obtained} />
              <Row label="Date" value={e.date} />
              <Row label="Planned submission" value={e.plannedSubmissionDate} />
              <Row label="Institution address" value={e.institutionAddress} multiline />
              <Row label="Phone" value={e.phone} />
              <Row label="Email" value={e.email} />
              <Row label="City" value={e.city} />
              <Row label="Postal code" value={e.postalCode} />
              <Row label="Country" value={e.country} />
              <FileDownloadRow label="Document" file={e.document} href={allowPublicDownloads ? buildPublicTrialFileUrl(trial?.id || trial?.trial_id, trial?.status, 'ethics-approvals', i) : ''} />
            </dl>
          </div>
        ))}
      </Section>

      <Section title="9. Funding sources" id="trial-section-9">
        {(Array.isArray(d.fundingSources) ? d.fundingSources : []).length === 0 && (
          <p className="text-[11px] italic text-slate-400">No funding sources listed.</p>
        )}
        {(Array.isArray(d.fundingSources) ? d.fundingSources : []).map((f, i) => (
          <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
            <dl className="space-y-1">
              <Row label="Name" value={f.name} />
              <Row label="Type" value={f.type} />
              <Row label="Address" value={f.address} />
              <Row label="City" value={f.city} />
              <Row label="Postal code" value={f.postalCode} />
              <Row label="Country" value={f.country} />
            </dl>
          </div>
        ))}
      </Section>

      <Section title="10. Sponsors" id="trial-section-10">
        {(Array.isArray(d.sponsors) ? d.sponsors : []).length === 0 && (
          <p className="text-[11px] italic text-slate-400">No sponsors listed.</p>
        )}
        {(Array.isArray(d.sponsors) ? d.sponsors : []).map((s, i) => (
          <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
            <dl className="space-y-1">
              <Row label="Level" value={s.level} />
              <Row label="Name" value={s.name} />
              <Row label="Type" value={s.type} />
              <Row label="Address" value={s.address} />
              <Row label="City" value={s.city} />
              <Row label="Postal code" value={s.postalCode} />
              <Row label="Country" value={s.country} />
            </dl>
          </div>
        ))}
      </Section>

      <Section title="11. Collaborators" id="trial-section-11">
        <dl className="space-y-1">
          <Row label="Collaborators?" value={d.hasCollaborator} />
          <Row label="Name" value={d.collaboratorName} />
          <Row label="Address" value={d.collaboratorAddress} />
          <Row label="City" value={d.collaboratorCity} />
          <Row label="Postal code" value={d.collaboratorPostalCode} />
          <Row label="Country" value={d.collaboratorCountry} />
        </dl>
      </Section>

      <Section title="12. Contact persons" id="trial-section-12">
        {(Array.isArray(d.contactPersons) ? d.contactPersons : []).length === 0 && (
          <p className="text-[11px] italic text-slate-400">No contacts listed.</p>
        )}
        {(Array.isArray(d.contactPersons) ? d.contactPersons : []).map((c, i) => (
          <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
            <dl className="space-y-1">
              <Row label="Role" value={c.role} />
              <Row label="Title" value={c.title} />
              <Row label="Name" value={`${c.firstName || ''} ${c.lastName || ''}`.trim()} />
              <Row label="Email" value={c.email} />
              <Row label="Alt email" value={c.altEmail} />
              <Row label="Phone" value={c.phone} />
              <Row label="Affiliation" value={c.affiliation} />
              <Row label="Address" value={c.address} />
              <Row label="City" value={c.city} />
              <Row label="Postal code" value={c.postalCode} />
              <Row label="Country" value={c.country} />
            </dl>
          </div>
        ))}
      </Section>

      <Section title="13. Reporting, IPD & trial results" id="trial-section-13">
        <dl className="space-y-1">
          <Row label="IPD description" value={d.ipdDescription} multiline />
          <Row
            label="Additional documents"
            value={Array.isArray(d.ipdAdditionalDocs) ? d.ipdAdditionalDocs.join(', ') : ''}
          />
          <Row label="Sharing timeframe" value={d.ipdSharingTimeframe} />
          <Row label="Access criteria" value={d.ipdAccessCriteria} multiline />
          <Row label="IPD URL" value={d.ipdUrl} />
          <Row label="Results available" value={d.resultsAvailable} />
          <ResultsSummaryRows trialId={trial?.id || trial?.trial_id} trialStatus={trial?.status} files={Array.isArray(d.resultsSummaryDocs) ? d.resultsSummaryDocs : []} allowPublicDownloads={allowPublicDownloads} />
          <Row label="First publication date" value={d.resultsFirstPublicationDate} />
          <Row label="Results URLs" value={Array.isArray(d.resultsUrls) ? d.resultsUrls.join(', ') : ''} />
          <Row label="Protocol link" value={d.resultsProtocolLink} />
        </dl>
      </Section>

      {showRecordFooter && trial?.id && (
        <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
          Registry record ID: {trial.id}
          {(trial.submitted_at || trial.submittedAt || trial.created_at || trial.createdAt) && (
            <>
              {' '}
              · Saved / submitted {formatTs(trial.submitted_at || trial.submittedAt || trial.created_at || trial.createdAt)}
            </>
          )}
        </p>
      )}
    </div>
  )
}

function formatTs(v) {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString()
  } catch {
    return '—'
  }
}

function buildPublicTrialFileUrl(trialId, status, category, index) {
  if (!trialId || status !== 'approved') return ''
  const rawBaseUrl = String(api.defaults.baseURL || window.location.origin || '')
  const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, '').replace(/\/api$/, '')
  return `${normalizedBaseUrl}/api/trials/public/approved/${encodeURIComponent(trialId)}/files/${encodeURIComponent(category)}/${index}`
}

function FileDownloadRow({ label, file, href }) {
  const fileName = getUploadedFileName(file)
  if (!fileName) return null
  const downloadable = canDownloadUploadedFile(file) && href

  return (
    <div className="grid gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-3">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="flex flex-wrap items-center gap-2 text-slate-800">
        <span>{fileName}</span>
        {downloadable ? (
          <a href={href} className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-slate-800">
            Download
          </a>
        ) : (
          <span className="text-[10px] text-slate-400">Legacy upload unavailable</span>
        )}
      </dd>
    </div>
  )
}

function ResultsSummaryRows({ trialId, trialStatus, files, allowPublicDownloads }) {
  if (!files.length) return null

  return (
    <div className="grid gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-3">
      <dt className="font-medium text-slate-500">Results summary PDFs</dt>
      <dd className="space-y-2 text-slate-800">
        {files.map((file, index) => {
          const fileName = getUploadedFileName(file)
          if (!fileName) return null
          const href = allowPublicDownloads ? buildPublicTrialFileUrl(trialId, trialStatus, 'results-summary', index) : ''
          const downloadable = canDownloadUploadedFile(file) && href

          return (
            <div key={`${fileName}-${index}`} className="flex flex-wrap items-center gap-2">
              <span>{fileName}</span>
              {downloadable ? (
                <a href={href} className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-slate-800">
                  Download
                </a>
              ) : (
                <span className="text-[10px] text-slate-400">Legacy upload unavailable</span>
              )}
            </div>
          )
        })}
      </dd>
    </div>
  )
}
