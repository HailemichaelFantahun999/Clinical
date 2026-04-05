import React, { useState, useMemo, useCallback, useEffect } from 'react'
import * as Sections from './TrialFormSections'
import { getUploadedFileName, readFileAsStoredUpload } from '../lib/trialFiles.js'

const constants = {
  healthConditions: [
    'Cancer',
    'Circulatory System Disorders',
    'Digestive System Diseases',
    'Ear, Nose & Throat',
    'Eye Diseases',
    'Genetic Disorders',
    'Haematological Disorders',
    'Infections & Infestations',
    'Injury / Occupational Diseases / Poisoning',
    'Mental & Behavioural Disorders',
    'Musculoskeletal Diseases',
    'Neonatal Diseases',
    'Nervous System Diseases',
    'Nutritional / Metabolic / Endocrine Disorders',
    'Oral Health',
    'Pregnancy & Childbirth',
    'Respiratory Diseases',
    'Skin & Connective Tissue Diseases',
    'Surgical Conditions',
    'Urological & Genital Diseases',
    'Obstetrics & Gynecology',
    'Paediatrics',
    'Kidney Disease',
    'Cardiology',
    'Orthopaedics',
    'Anaesthesia',
    'Other'
  ],
  trialDesigns: ['Controlled Clinical Trial (CCT)', 'Non-Randomized', 'Observational', 'Randomized Controlled Trial (RCT)'],
  trialPhases: ['Not Applicable', 'Phase 0', 'Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'],
  purposes: [
    'Diagnosis / Prognosis',
    'Early Detection / Screening',
    'Education / Training',
    'Prevention',
    'Prevention: Vaccines',
    'Physical Activity & Nutrition',
    'Psychosocial',
    'Rehabilitation',
    'Supportive Care',
    'Treatment: Drugs',
    'Treatment: Devices',
    'Treatment: Surgery',
    'Treatment: Other',
    'Other Intervention'
  ],
  recruitmentStatuses: [
    'Not Yet Recruiting',
    'Recruiting',
    'Active, Not Recruiting',
    'Follow-up Continuing',
    'Completed',
    'Suspended',
    'Terminated',
    'Withdrawn'
  ],
  allocationMethods: ['Randomized', 'Non-Randomized'],
  allocationConcealments: [
    'Not Concealed',
    'Off-site Sequence Holder',
    'Central Randomization (Phone/Fax)',
    'Numbered Containers',
    'Sealed Opaque Envelopes'
  ],
  maskingTypes: ['Open Label (No Blinding)', 'Blinding Used'],
  maskingRoles: ['Care Provider', 'Outcome Assessor', 'Participant'],
  interventionTypes: ['Experimental Group', 'Control Group'],
  natureOfControlOptions: ['Active Treatment', 'Placebo', 'Dose Comparison', 'Historical', 'Uncontrolled'],
  ageGroups: [
    'Newborn (0–1 month)',
    'Infant (1–24 months)',
    'Child (2–12 years)',
    'Adolescent (13–17 years)',
    'Adult (18–44 years)',
    'Middle-aged (45–64 years)',
    'Aged (65+)',
    '80+ years'
  ],
  ageUnits: ['Days', 'Weeks', 'Months', 'Years'],
  sexes: ['Male', 'Female', 'Both'],
  outcomeTypes: ['Primary', 'Secondary'],
  fundingSourceTypes: ['Government', 'Industry', 'University', 'Hospital', 'Foundation', 'Self-funded', 'Other'],
  sponsorLevels: ['Primary', 'Secondary'],
  sponsorTypes: ['Government', 'Industry', 'University', 'Hospital', 'Individual', 'Other'],
  contactRoles: ['Principal Investigator', 'Public Enquiries', 'Scientific Enquiries'],
  contactTitles: ['Dr', 'Mr', 'Mrs', 'Ms', 'Prof', 'Assoc. Prof', 'Other'],
  ipdAdditionalDocsOptions: [
    'Study Protocol',
    'Statistical Analysis Plan',
    'Informed Consent Form',
    'Clinical Study Report',
    'Analytic Code'
  ],
  countries: [
    'Ethiopia',
    'United States',
    'United Kingdom',
    'India',
    'Germany',
    'France',
    'Canada',
    'Australia',
    'Other'
  ]
}

const CONTACT_ROLES_REQUIRED = ['Principal Investigator', 'Public Enquiries', 'Scientific Enquiries']

function getInitialForm(initialValue, storageKey) {
  const base = {
    publicTitle: '',
    scientificTitle: '',
    briefSummary: '',
    trialDesign: '',
    trialPhase: '',
    acronym: '',
    healthConditions: [],
    purpose: '',
    anticipatedStartDate: '',
    actualStartDate: '',
    lastFollowUpDate: '',
    completionDate: '',
    targetParticipants: '',
    finalParticipants: '',
    recruitmentStatus: '',
    publicationUrl: '',
    hasSecondaryId: '',
    secondaryIds: '',
    secondaryIdIssuingAuthority: '',
    interventionAssignment: '',
    allocation: '',
    allocationConcealment: '',
    maskingType: '',
    maskingRoles: [],
    interventions: [],
    inclusionCriteria: '',
    exclusionCriteria: '',
    ageGroups: [],
    minAge: '',
    minAgeUnit: 'Years',
    maxAge: '',
    maxAgeUnit: 'Years',
    sex: '',
    outcomes: [],
    recruitmentCentres: [],
    ethicsApprovals: [],
    fundingSources: [],
    sponsors: [],
    hasCollaborator: '',
    collaboratorName: '',
    collaboratorAddress: '',
    collaboratorCity: '',
    collaboratorPostalCode: '',
    collaboratorCountry: '',
    contactPersons: [],
    ipdDescription: '',
    ipdAdditionalDocs: [],
    ipdSharingTimeframe: '',
    ipdAccessCriteria: '',
    ipdUrl: '',
    resultsAvailable: '',
    resultsSummaryDocs: [],
    resultsFirstPublicationDate: '',
    resultsUrls: [],
    resultsProtocolLink: ''
  }

  if (!initialValue) return base
  const merged = { ...base, ...initialValue }
  if (!merged.publicTitle && initialValue?.title) merged.publicTitle = String(initialValue.title)
  if ((!merged.healthConditions || merged.healthConditions.length === 0) && initialValue.diseases) {
    const d = initialValue.diseases
    merged.healthConditions = Array.isArray(d)
      ? d
      : String(d)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
  }
  if (storageKey && typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && parsed.form && typeof parsed.form === 'object') {
          return { ...merged, ...parsed.form }
        }
      }
    } catch {
    }
  }
  return merged
}

function interventionRowComplete(i) {
  if (!i || !i.type || !String(i.name || '').trim() || !String(i.duration || '').trim() || !String(i.description || '').trim() || !String(i.groupSize || '').trim()) {
    return false
  }
  if (i.type === 'Control Group' && !i.natureOfControl) return false
  return true
}

function ethicsRowComplete(item) {
  if (!item?.obtained) return false
  if (item.obtained === 'Yes') {
    return !!(
      item.date &&
      String(item.institutionAddress || '').trim() &&
      String(item.phone || '').trim() &&
      String(item.email || '').trim() &&
      String(item.city || '').trim() &&
      String(item.country || '').trim() &&
String(getUploadedFileName(item.document) || '').trim()
    )
  }
  if (item.obtained === 'No') {
    return !!(
      item.plannedSubmissionDate &&
      String(item.institutionAddress || '').trim() &&
      String(item.phone || '').trim() &&
      String(item.email || '').trim() &&
      String(item.city || '').trim() &&
      String(item.country || '').trim()
    )
  }
  return false
}

function fundingRowComplete(i) {
  return !!(i && String(i.name || '').trim() && i.type && String(i.address || '').trim() && String(i.city || '').trim() && i.country)
}

function sponsorRowComplete(i) {
  return !!(
    i &&
    i.level &&
    i.type &&
    String(i.name || '').trim() &&
    String(i.address || '').trim() &&
    String(i.city || '').trim() &&
    i.country
  )
}

function centreRowComplete(i) {
  return !!(i && String(i.name || '').trim() && String(i.street || '').trim() && String(i.city || '').trim() && i.country)
}

function contactRowComplete(c) {
  return !!(
    c &&
    c.role &&
    c.title &&
    String(c.firstName || '').trim() &&
    String(c.lastName || '').trim() &&
    String(c.email || '').trim() &&
    String(c.phone || '').trim() &&
    String(c.address || '').trim() &&
    String(c.city || '').trim() &&
    c.country &&
    String(c.affiliation || '').trim()
  )
}

export default function TrialForm({ initialValue, onSubmit, submitting, allowDrafts = true, storageKey = '' }) {
  const [form, setForm] = useState(() => getInitialForm(initialValue, storageKey))
  const [submitError, setSubmitError] = useState('')
  const [activeSection, setActiveSection] = useState(() => {
    if (!storageKey || typeof window === 'undefined') return 1
    try {
      const raw = window.localStorage.getItem(storageKey)
      const parsed = raw ? JSON.parse(raw) : null
      return Number(parsed?.activeSection) || 1
    } catch {
      return 1
    }
  })

  const sections = useMemo(
    () => [
      { id: 1, label: 'Trial Details' },
      { id: 2, label: 'Secondary Identifiers' },
      { id: 3, label: 'Study Design' },
      { id: 4, label: 'Interventions' },
      { id: 5, label: 'Eligibility Criteria' },
      { id: 6, label: 'Outcomes' },
      { id: 7, label: 'Recruitment Centres' },
      { id: 8, label: 'Ethics Approval' },
      { id: 9, label: 'Funding Sources' },
      { id: 10, label: 'Sponsors' },
      { id: 11, label: 'Collaborators' },
      { id: 12, label: 'Contact Persons' },
      { id: 13, label: 'Reporting & Results (IPD)' }
    ],
    []
  )

  const getSectionStatus = useCallback(
    (id) => {
      const f = form
      switch (id) {
        case 1:
          return f.publicTitle?.trim() &&
            f.scientificTitle?.trim() &&
            f.briefSummary?.trim() &&
            f.trialDesign &&
            f.trialPhase &&
            (f.healthConditions || []).length > 0 &&
            f.purpose &&
            f.anticipatedStartDate &&
            f.lastFollowUpDate &&
            f.targetParticipants !== '' &&
            f.targetParticipants !== undefined &&
            f.recruitmentStatus
            ? 'done'
            : 'pending'
        case 2:
          if (f.hasSecondaryId !== 'Yes' && f.hasSecondaryId !== 'No') return 'pending'
          if (f.hasSecondaryId === 'No') return 'done'
          return f.secondaryIds?.trim() && f.secondaryIdIssuingAuthority?.trim() ? 'done' : 'pending'
        case 3:
          if (!f.interventionAssignment || !f.allocation || !f.allocationConcealment || !f.maskingType) return 'pending'
          if (f.maskingType === 'Blinding Used' && (!f.maskingRoles || f.maskingRoles.length === 0)) return 'pending'
          return 'done'
        case 4:
          return f.interventions?.length > 0 && f.interventions.every(interventionRowComplete) ? 'done' : 'pending'
        case 5:
          return f.inclusionCriteria?.trim() &&
            f.exclusionCriteria?.trim() &&
            (f.ageGroups || []).length > 0 &&
            f.minAge !== '' &&
            f.maxAge !== '' &&
            f.sex
            ? 'done'
            : 'pending'
        case 6: {
          const hasPrimary = (f.outcomes || []).some(
            (o) => o.type === 'Primary' && o.description?.trim() && o.timepoints?.trim()
          )
          const hasSecondary = (f.outcomes || []).some(
            (o) => o.type === 'Secondary' && o.description?.trim() && o.timepoints?.trim()
          )
          return hasPrimary && hasSecondary ? 'done' : 'pending'
        }
        case 7:
          return f.recruitmentCentres?.length > 0 && f.recruitmentCentres.every(centreRowComplete) ? 'done' : 'pending'
        case 8:
          return f.ethicsApprovals?.length > 0 && f.ethicsApprovals.every(ethicsRowComplete) ? 'done' : 'pending'
        case 9:
          return f.fundingSources?.length > 0 && f.fundingSources.every(fundingRowComplete) ? 'done' : 'pending'
        case 10:
          return f.sponsors?.length > 0 && f.sponsors.every(sponsorRowComplete) ? 'done' : 'pending'
        case 11:
          if (f.hasCollaborator !== 'Yes' && f.hasCollaborator !== 'No') return 'pending'
          if (f.hasCollaborator === 'No') return 'done'
          return f.collaboratorName?.trim() &&
            f.collaboratorAddress?.trim() &&
            f.collaboratorCity?.trim() &&
            f.collaboratorCountry
            ? 'done'
            : 'pending'
        case 12: {
          const persons = f.contactPersons || []
          const okRoles = CONTACT_ROLES_REQUIRED.every((role) =>
            persons.some((c) => c.role === role && contactRowComplete(c))
          )
          return okRoles ? 'done' : 'pending'
        }
        case 13:
          if (!f.ipdDescription?.trim() || !f.ipdSharingTimeframe?.trim() || !f.ipdAccessCriteria?.trim()) return 'pending'
          if (f.resultsAvailable !== 'Yes' && f.resultsAvailable !== 'No') return 'pending'
          if (f.resultsAvailable === 'Yes') {
            if (!f.resultsSummaryDocs?.length) return 'pending'
          }
          return 'done'
        default:
          return 'pending'
      }
    },
    [form]
  )

  const allSectionsDone = sections.every((s) => getSectionStatus(s.id) === 'done')

  useEffect(() => {
    setForm(getInitialForm(initialValue, storageKey))
    if (!storageKey || typeof window === 'undefined') {
      setActiveSection(1)
      return
    }
    try {
      const raw = window.localStorage.getItem(storageKey)
      const parsed = raw ? JSON.parse(raw) : null
      setActiveSection(Number(parsed?.activeSection) || 1)
    } catch {
      setActiveSection(1)
    }
  }, [initialValue, storageKey])

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ form, activeSection }))
    } catch {
    }
  }, [form, activeSection, storageKey])


  function handleChange(e) {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox' && name === 'maskingRoles') {
      const role = value
      setForm((prev) => {
        const has = prev.maskingRoles.includes(role)
        return { ...prev, maskingRoles: has ? prev.maskingRoles.filter((r) => r !== role) : [...prev.maskingRoles, role] }
      })
      return
    }
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setSubmitError('')
  }

  function handleMultiSelect(name, value) {
    setForm((prev) => {
      const current = prev[name] || []
      const has = current.includes(value)
      return { ...prev, [name]: has ? current.filter((v) => v !== value) : [...current, value] }
    })
    setSubmitError('')
  }

  function addHealthCondition(value) {
    const nextValue = String(value || '').trim()
    if (!nextValue) return
    setForm((prev) => {
      const current = prev.healthConditions || []
      if (current.some((item) => String(item).toLowerCase() === nextValue.toLowerCase())) {
        return prev
      }
      return { ...prev, healthConditions: [...current, nextValue] }
    })
    setSubmitError('')
  }

  function removeHealthCondition(value) {
    const nextValue = String(value || '').trim().toLowerCase()
    setForm((prev) => ({
      ...prev,
      healthConditions: (prev.healthConditions || []).filter((item) => String(item).toLowerCase() !== nextValue)
    }))
    setSubmitError('')
  }

  function handleArrayChange(name, index, field, value) {
    setForm((prev) => {
      const arr = [...(prev[name] || [])]
      if (!arr[index]) arr[index] = {}
      arr[index] = { ...arr[index], [field]: value }
      return { ...prev, [name]: arr }
    })
    setSubmitError('')
  }

  function addArrayItem(name, template = {}) {
    setForm((prev) => ({ ...prev, [name]: [...(prev[name] || []), { ...template }] }))
    setSubmitError('')
  }

  function removeArrayItem(name, index) {
    setForm((prev) => ({ ...prev, [name]: (prev[name] || []).filter((_, i) => i !== index) }))
    setSubmitError('')
  }

  async function handleFileChange(e, _fieldPath, index) {
    const file = e.target.files?.[0]
    if (!file) {
      handleArrayChange('ethicsApprovals', index, 'document', '')
      return
    }
    const storedFile = await readFileAsStoredUpload(file)
    handleArrayChange('ethicsApprovals', index, 'document', storedFile)
    e.target.value = ''
  }

  async function appendResultsSummaryFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const storedFile = await readFileAsStoredUpload(file)
    setForm((prev) => ({
      ...prev,
      resultsSummaryDocs: [...(prev.resultsSummaryDocs || []), storedFile]
    }))
    setSubmitError('')
    e.target.value = ''
  }

  function removeResultsSummaryFile(index) {
    setForm((prev) => ({
      ...prev,
      resultsSummaryDocs: (prev.resultsSummaryDocs || []).filter((_, i) => i !== index)
    }))
  }

  function addResultsUrl() {
    setForm((prev) => ({ ...prev, resultsUrls: [...(prev.resultsUrls || []), ''] }))
  }

  function updateResultsUrl(index, value) {
    setForm((prev) => {
      const next = [...(prev.resultsUrls || [])]
      next[index] = value
      return { ...prev, resultsUrls: next }
    })
  }

  function removeResultsUrl(index) {
    setForm((prev) => ({
      ...prev,
      resultsUrls: (prev.resultsUrls || []).filter((_, i) => i !== index)
    }))
  }

  function validateSubmission() {
    for (const s of sections) {
      if (getSectionStatus(s.id) !== 'done') {
        setActiveSection(s.id)
        setSubmitError(`Complete section ${s.id} (${s.label}) before submitting.`)
        return false
      }
    }
    setSubmitError('')
    return true
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validateSubmission()) return
    const payload = {
      ...form,
      title: form.publicTitle,
      diseases: (form.healthConditions || []).join(', ')
    }
    if (storageKey && typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey)
    }
    onSubmit?.(payload)
  }

  function handleSaveDraft() {
    if (!onSubmit) return
    if (!form.publicTitle?.trim()) {
      setSubmitError('Public title is required to save a draft.')
      setActiveSection(1)
      return
    }
    setSubmitError('')
    if (storageKey && typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify({ form, activeSection }))
    }
    onSubmit({
      ...form,
      title: form.publicTitle,
      diseases: (form.healthConditions || []).join(', '),
      status: 'draft'
    })
  }

  const sectionProps = {
    form,
    handleChange,
    handleMultiSelect,
    handleArrayChange,
    addHealthCondition,
    removeHealthCondition,
    addArrayItem,
    removeArrayItem,
    handleFileChange,
    constants,
    appendResultsSummaryFile,
    removeResultsSummaryFile,
    addResultsUrl,
    updateResultsUrl,
    removeResultsUrl
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800" role="alert">
          {submitError}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <nav
          className="lg:w-72 lg:shrink-0 lg:sticky lg:top-4"
          aria-label="Form sections"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-soft">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Sections</p>
            <ul className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto pr-1 text-[12px]">
              {sections.map((s) => {
                const status = getSectionStatus(s.id)
                const active = activeSection === s.id
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setActiveSection(s.id)}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition ${
                        active ? 'bg-sky-50 text-sky-900 ring-1 ring-sky-200' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="min-w-0 font-medium">
                        <span className="text-slate-400">{s.id}.</span> {s.label}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          status === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {status === 'done' ? 'Done' : 'Pending'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
            {!allSectionsDone && (
              <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-500">
                Submit for review is available when every section shows Done.
              </p>
            )}
          </div>
        </nav>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft md:p-5">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                {activeSection}. {sections.find((x) => x.id === activeSection)?.label}
              </h2>
              <span className="text-[11px] text-slate-500">
                Section {activeSection} of {sections.length}
              </span>
            </div>

            <div className="space-y-1">
              {activeSection === 1 && <Sections.TrialDetails {...sectionProps} />}
              {activeSection === 2 && <Sections.SecondaryIdentifiers {...sectionProps} />}
              {activeSection === 3 && <Sections.StudyDesign {...sectionProps} />}
              {activeSection === 4 && <Sections.InterventionsList {...sectionProps} />}
              {activeSection === 5 && <Sections.EligibilityCriteria {...sectionProps} />}
              {activeSection === 6 && <Sections.OutcomesList {...sectionProps} />}
              {activeSection === 7 && <Sections.RecruitmentCentresList {...sectionProps} />}
              {activeSection === 8 && <Sections.EthicsApprovalsList {...sectionProps} />}
              {activeSection === 9 && <Sections.FundingSourcesList {...sectionProps} />}
              {activeSection === 10 && <Sections.SponsorsList {...sectionProps} />}
              {activeSection === 11 && <Sections.Collaborators {...sectionProps} />}
              {activeSection === 12 && <Sections.ContactPersonsList {...sectionProps} />}
              {activeSection === 13 && <Sections.ResultsIPD {...sectionProps} />}
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-[11px] text-slate-500">Your data is stored with your trial record.</p>
            <div className="flex gap-2">
              {allowDrafts && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSaveDraft}
                  className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save Draft
                </button>
              )}
              <button
                type="submit"
                disabled={submitting || !allSectionsDone}
                title={!allSectionsDone ? 'Complete all sections first' : undefined}
                className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-slate-50 shadow-soft hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? 'Submitting…' : 'Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}









