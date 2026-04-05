import React, { useMemo, useState } from 'react'

// Core option lists
const trialDesigns = [
  'Randomized controlled trial',
  'Non-randomized controlled trial',
  'Single arm trial',
  'Cohort study',
  'Case-control study',
  'Other'
]

const trialPhases = ['Phase I', 'Phase II', 'Phase III', 'Phase IV', 'Not applicable']

const recruitmentStatuses = [
  'Not yet recruiting',
  'Recruiting',
  'Completed',
  'Suspended',
  'Terminated',
  'Withdrawn'
]

const allocationOptions = ['RANDOMIZED', 'NON RANDOMIZED']

const maskingRoles = ['Care giver / Provider', 'Outcome Assessors', 'Participants']

const interventionTypes = ['Drug', 'Device', 'Behavioral', 'Procedure', 'Other']

const sexes = ['Male', 'Female', 'Both']

const outcomeTypes = ['Primary', 'Secondary', 'Other']

const fundingSourceTypes = ['Government', 'Industry', 'Institutional', 'Non-profit', 'Other']

const sponsorLevels = ['Primary sponsor', 'Secondary sponsor', 'Collaborating sponsor']

const contactRoles = ['Principal Investigator', 'Study Coordinator', 'Sub-Investigator', 'Other']

const yesNo = ['Yes', 'No']

function getInitialForm(initialValue) {
  const base = {
    // Section 1 — Trial Information
    title: '',
    briefSummary: '',
    trialDesign: '',
    trialPhase: '',
    diseases: '',
    purpose: '',
    anticipatedStartDate: '',
    actualStartDate: '',
    lastFollowUpDate: '',
    completionDate: '',
    targetParticipants: '',
    projectArea: '',
    recruitmentStatus: '',
    publicationUrl: '',

    // Section 2 — Study Design
    interventionAssignment: '',
    allocation: '',
    allocationConcealmentDescription: '',
    allocationSequenceGeneration: '',
    maskingEnabled: false,
    maskingRoles: [],

    // Section 3 — Interventions
    interventionType: '',
    interventionName: '',
    interventionDose: '',
    interventionDuration: '',
    interventionDescription: '',
    interventionGroupSize: '',

    // Section 4 — Eligibility Criteria
    inclusionCriteria: '',
    exclusionCriteria: '',
    minAge: '',
    maxAge: '',
    sex: '',

    // Section 5 — Outcome
    outcomeType: '',
    outcomeDescription: '',
    outcomeTimepoints: '',

    // Section 6 — Recruitment Centre
    recruitmentCentreName: '',
    recruitmentCentreStreet: '',
    recruitmentCentreCity: '',

    // Section 7 — Ethics Approval
    hasEthicsApproval: '',
    ethicsApprovalDate: '',
    ethicsCommitteeName: '',
    ethicsStreet: '',
    ethicsPhone: '',
    ethicsEmail: '',
    ethicsPlannedSubmissionDate: '',
    ethicsDocumentName: '',

    // Section 8 — Funding Sources
    fundingSourceName: '',
    fundingSourceType: '',

    // Section 9 — Sponsors
    sponsorLevel: '',
    sponsorName: '',
    sponsorCity: '',
    sponsorCountry: '',

    // Section 10 — Collaborators
    hasCollaborator: '',
    collaboratorName: '',
    collaboratorCountry: '',

    // Section 11 — Contact People
    contactRole: '',
    contactFirstName: '',
    contactLastName: '',
    contactTitle: '',
    contactEmail: '',
    contactPhone: '',
    contactCity: '',
    contactPosition: '',
    contactInstitution: '',

    // Section 12 — IPD Sharing Statement
    ipdDescription: '',
    ipdAdditionalDocsName: ''
  }

  if (!initialValue) return base
  return { ...base, ...initialValue }
}

export default function TrialForm({ initialValue, onSubmit, submitting }) {
  const [form, setForm] = useState(getInitialForm(initialValue))
  const [errors, setErrors] = useState({})
  const [activeSection, setActiveSection] = useState(1)

  const sections = useMemo(
    () => [
      { id: 1, label: 'Trial Information' },
      { id: 2, label: 'Study Design' },
      { id: 3, label: 'Interventions' },
      { id: 4, label: 'Eligibility Criteria' },
      { id: 5, label: 'Outcome' },
      { id: 6, label: 'Recruitment Centre' },
      { id: 7, label: 'Ethics Approval' },
      { id: 8, label: 'Funding Sources' },
      { id: 9, label: 'Sponsors' },
      { id: 10, label: 'Collaborators' },
      { id: 11, label: 'Contact People' },
      { id: 12, label: 'IPD Sharing Statement' }
    ],
    []
  )

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      if (name === 'maskingEnabled') {
        setForm((prev) => ({ ...prev, maskingEnabled: checked }))
        return
      }
    }
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    const { name } = e.target
    setForm((prev) => ({ ...prev, [name]: file ? file.name : '' }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function toggleMaskingRole(role) {
    setForm((prev) => {
      const has = prev.maskingRoles.includes(role)
      return { ...prev, maskingRoles: has ? prev.maskingRoles.filter((r) => r !== role) : [...prev.maskingRoles, role] }
    })
  }

  function validate() {
    const next = {}

    // Minimal required fields for a complete registry entry
    if (!form.title.trim()) next.title = 'Title is required.'
    if (!form.briefSummary.trim()) next.briefSummary = 'Brief summary is required.'
    if (!form.trialDesign) next.trialDesign = 'Please select a trial design.'
    if (!form.trialPhase) next.trialPhase = 'Please select trial phase.'
    if (!form.diseases.trim()) next.diseases = 'Please specify disease or condition.'
    if (!form.purpose.trim()) next.purpose = 'Purpose of the trial is required.'
    if (!form.anticipatedStartDate) next.anticipatedStartDate = 'Anticipated start date is required.'
    if (!form.targetParticipants) next.targetParticipants = 'Target number of participants is required.'
    if (!form.recruitmentStatus) next.recruitmentStatus = 'Recruitment status is required.'
    if (!form.interventionType) next.interventionType = 'Intervention type is required.'
    if (!form.interventionName.trim()) next.interventionName = 'Intervention name is required.'
    if (!form.inclusionCriteria.trim()) next.inclusionCriteria = 'Please list inclusion criteria.'
    if (!form.exclusionCriteria.trim()) next.exclusionCriteria = 'Please list exclusion criteria.'
    if (!form.minAge) next.minAge = 'Minimum age is required.'
    if (!form.maxAge) next.maxAge = 'Maximum age is required.'
    if (!form.sex) next.sex = 'Please select sex.'
    if (!form.outcomeType) next.outcomeType = 'Outcome type is required.'
    if (!form.outcomeDescription.trim()) next.outcomeDescription = 'Outcome description is required.'
    if (!form.recruitmentCentreName.trim()) next.recruitmentCentreName = 'Recruitment centre name is required.'
    if (!form.hasEthicsApproval) next.hasEthicsApproval = 'Please specify ethics approval status.'
    if (form.hasEthicsApproval === 'Yes' && !form.ethicsApprovalDate) {
      next.ethicsApprovalDate = 'Approval date is required.'
    }
    if (form.hasEthicsApproval === 'No' && !form.ethicsPlannedSubmissionDate) {
      next.ethicsPlannedSubmissionDate = 'Planned submission date is required.'
    }
    if (!form.fundingSourceName.trim()) next.fundingSourceName = 'Funding source name is required.'
    if (!form.fundingSourceType) next.fundingSourceType = 'Funding source type is required.'
    if (!form.sponsorLevel) next.sponsorLevel = 'Sponsor level is required.'
    if (!form.sponsorName.trim()) next.sponsorName = 'Sponsor name is required.'
    if (!form.contactRole) next.contactRole = 'Contact role is required.'
    if (!form.contactFirstName.trim()) next.contactFirstName = 'First name is required.'
    if (!form.contactLastName.trim()) next.contactLastName = 'Last name is required.'
    if (!form.contactEmail.trim()) next.contactEmail = 'Contact email is required.'

    setErrors(next)
    if (Object.keys(next).length) {
      // Jump to first section with an error
      const fieldToSection = [
        [1, ['title', 'briefSummary', 'trialDesign', 'trialPhase', 'diseases', 'purpose', 'anticipatedStartDate', 'targetParticipants', 'recruitmentStatus']],
        [2, ['interventionAssignment', 'allocation', 'allocationConcealmentDescription', 'allocationSequenceGeneration']],
        [3, ['interventionType', 'interventionName', 'interventionDose', 'interventionDuration', 'interventionDescription', 'interventionGroupSize']],
        [4, ['inclusionCriteria', 'exclusionCriteria', 'minAge', 'maxAge', 'sex']],
        [5, ['outcomeType', 'outcomeDescription', 'outcomeTimepoints']],
        [6, ['recruitmentCentreName', 'recruitmentCentreStreet', 'recruitmentCentreCity']],
        [7, ['hasEthicsApproval', 'ethicsApprovalDate', 'ethicsPlannedSubmissionDate']],
        [8, ['fundingSourceName', 'fundingSourceType']],
        [9, ['sponsorLevel', 'sponsorName']],
        [10, ['hasCollaborator', 'collaboratorName', 'collaboratorCountry']],
        [11, ['contactRole', 'contactFirstName', 'contactLastName', 'contactEmail']],
        [12, ['ipdDescription', 'ipdAdditionalDocsName']]
      ]
      for (const [sectionId, fields] of fieldToSection) {
        if (fields.some((f) => next[f])) {
          setActiveSection(sectionId)
          break
        }
      }
      return false
    }
    return true
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    onSubmit?.(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress indicator */}
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
        <div className="flex items-center justify-between">
          <span className="font-semibold uppercase tracking-wide">Clinical Trial Registry Form</span>
          <span>
            Section {activeSection} of {sections.length}
          </span>
        </div>
        <div className="mt-1 flex gap-1">
          {sections.map((s) => {
            const completed = s.id < activeSection
            const isActive = s.id === activeSection
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={`h-1.5 flex-1 rounded-full transition ${
                  isActive ? 'bg-sky-600' : completed ? 'bg-sky-300' : 'bg-slate-200'
                }`}
                aria-label={s.label}
              />
            )
          })}
        </div>
      </div>

      {/* Section 1 — Trial Information */}
      <SectionCard id={1} activeSection={activeSection} title="SECTION 1 — TRIAL INFORMATION">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title" name="title" required error={errors.title}>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="field-input"
              placeholder="e.g., Phase II trial of ..."
            />
          </Field>
          <Field
            label="Disease(s) or condition(s) being studied"
            name="diseases"
            required
            error={errors.diseases}
          >
            <input
              name="diseases"
              value={form.diseases}
              onChange={handleChange}
              className="field-input"
              placeholder="e.g., Type 2 Diabetes Mellitus"
            />
          </Field>
        </div>

        <Field
          label="Brief summary describing the background and objectives of trial"
          name="briefSummary"
          required
          error={errors.briefSummary}
        >
          <textarea
            name="briefSummary"
            value={form.briefSummary}
            onChange={handleChange}
            rows={4}
            className="field-input"
            placeholder="Provide a concise scientific summary, including background, rationale, and main objectives."
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="What type of trial design is being implemented?"
            name="trialDesign"
            required
            error={errors.trialDesign}
          >
            <select
              name="trialDesign"
              value={form.trialDesign}
              onChange={handleChange}
              className="field-input"
            >
              <option value="">Select design</option>
              {trialDesigns.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Trial Phase" name="trialPhase" required error={errors.trialPhase}>
            <select name="trialPhase" value={form.trialPhase} onChange={handleChange} className="field-input">
              <option value="">Select phase</option>
              {trialPhases.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Purpose of the Trial" name="purpose" required error={errors.purpose}>
          <textarea
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            rows={3}
            className="field-input"
            placeholder="Describe the main purpose of this trial."
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Anticipated Trial Start Date"
            name="anticipatedStartDate"
            required
            error={errors.anticipatedStartDate}
          >
            <input
              type="date"
              name="anticipatedStartDate"
              value={form.anticipatedStartDate}
              onChange={handleChange}
              className="field-input"
            />
          </Field>
          <Field label="Actual Trial Start Date" name="actualStartDate">
            <input
              type="date"
              name="actualStartDate"
              value={form.actualStartDate}
              onChange={handleChange}
              className="field-input"
            />
          </Field>
          <Field label="Anticipated Date of Last Follow up" name="lastFollowUpDate">
            <input
              type="date"
              name="lastFollowUpDate"
              value={form.lastFollowUpDate}
              onChange={handleChange}
              className="field-input"
            />
          </Field>
          <Field label="Completion Date" name="completionDate">
            <input
              type="date"
              name="completionDate"
              value={form.completionDate}
              onChange={handleChange}
              className="field-input"
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Target No. Of Participants"
            name="targetParticipants"
            required
            error={errors.targetParticipants}
          >
            <input
              type="number"
              min="0"
              name="targetParticipants"
              value={form.targetParticipants}
              onChange={handleChange}
              className="field-input"
            />
          </Field>
          <Field label="Area where the project taking place" name="projectArea">
            <input
              name="projectArea"
              value={form.projectArea}
              onChange={handleChange}
              className="field-input"
              placeholder="e.g., National, Regional hospital network"
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Recruitment Status"
            name="recruitmentStatus"
            required
            error={errors.recruitmentStatus}
          >
            <select
              name="recruitmentStatus"
              value={form.recruitmentStatus}
              onChange={handleChange}
              className="field-input"
            >
              <option value="">Select status</option>
              {recruitmentStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Publication URL" name="publicationUrl">
            <input
              type="url"
              name="publicationUrl"
              value={form.publicationUrl}
              onChange={handleChange}
              className="field-input"
              placeholder="https://"
            />
          </Field>
        </div>
      </SectionCard>

      {/* Section 2 — Study Design */}
      <SectionCard id={2} activeSection={activeSection} title="SECTION 2 — STUDY DESIGN">
        <Field
          label="Intervention Assignment"
          name="interventionAssignment"
          error={errors.interventionAssignment}
        >
          <input
            name="interventionAssignment"
            value={form.interventionAssignment}
            onChange={handleChange}
            className="field-input"
            placeholder="e.g., Parallel, Crossover, Factorial"
          />
        </Field>

        <Field
          label="Allocation to intervention"
          name="allocation"
          required
          error={errors.allocation}
        >
          <select name="allocation" value={form.allocation} onChange={handleChange} className="field-input">
            <option value="">Select allocation</option>
            {allocationOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>

        {form.allocation === 'NON RANDOMIZED' && (
          <Field
            label="Describe how the allocation sequence/code was concealed from the person allocating participants"
            name="allocationConcealmentDescription"
            error={errors.allocationConcealmentDescription}
          >
            <textarea
              name="allocationConcealmentDescription"
              value={form.allocationConcealmentDescription}
              onChange={handleChange}
              rows={3}
              className="field-input"
            />
          </Field>
        )}

        {form.allocation === 'RANDOMIZED' && (
          <Field
            label="Describe how the allocation sequence was generated"
            name="allocationSequenceGeneration"
            error={errors.allocationSequenceGeneration}
          >
            <textarea
              name="allocationSequenceGeneration"
              value={form.allocationSequenceGeneration}
              onChange={handleChange}
              rows={3}
              className="field-input"
            />
          </Field>
        )}

        <div className="mt-2 space-y-2">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              name="maskingEnabled"
              checked={!!form.maskingEnabled}
              onChange={handleChange}
              className="h-3 w-3 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span>Masking</span>
          </label>
          {form.maskingEnabled && (
            <div className="grid gap-2 md:grid-cols-3">
              {maskingRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleMaskingRole(role)}
                  className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[11px] font-medium ${
                    form.maskingRoles.includes(role)
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Section 3 — Interventions */}
      <SectionCard id={3} activeSection={activeSection} title="SECTION 3 — INTERVENTIONS">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Intervention Type"
            name="interventionType"
            required
            error={errors.interventionType}
          >
            <select
              name="interventionType"
              value={form.interventionType}
              onChange={handleChange}
              className="field-input"
            >
              <option value="">Select type</option>
              {interventionTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Intervention Name" name="interventionName" required error={errors.interventionName}>
            <input
              name="interventionName"
              value={form.interventionName}
              onChange={handleChange}
              className="field-input"
              placeholder="e.g., Drug X 10mg tablet"
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Dose (How much or how often)" name="interventionDose">
            <input
              name="interventionDose"
              value={form.interventionDose}
              onChange={handleChange}
              className="field-input"
              placeholder="e.g., 10mg twice daily"
            />
          </Field>
          <Field label="Duration (for how long)" name="interventionDuration">
            <input
              name="interventionDuration"
              value={form.interventionDuration}
              onChange={handleChange}
              className="field-input"
              placeholder="e.g., 12 weeks"
            />
          </Field>
        </div>

        <Field
          label="Intervention Description"
          name="interventionDescription"
          error={errors.interventionDescription}
        >
          <textarea
            name="interventionDescription"
            value={form.interventionDescription}
            onChange={handleChange}
            rows={3}
            className="field-input"
          />
        </Field>

        <Field label="Group Size" name="interventionGroupSize" error={errors.interventionGroupSize}>
          <input
            type="number"
            min="0"
            name="interventionGroupSize"
            value={form.interventionGroupSize}
            onChange={handleChange}
            className="field-input"
          />
        </Field>
      </SectionCard>

      {/* Section 4 — Eligibility Criteria */}
      <SectionCard id={4} activeSection={activeSection} title="SECTION 4 — ELIGIBILITY CRITERIA">
        <Field
          label="List Inclusion Criteria"
          name="inclusionCriteria"
          required
          error={errors.inclusionCriteria}
        >
          <textarea
            name="inclusionCriteria"
            value={form.inclusionCriteria}
            onChange={handleChange}
            rows={3}
            className="field-input"
          />
        </Field>

        <Field
          label="List Exclusion Criteria"
          name="exclusionCriteria"
          required
          error={errors.exclusionCriteria}
        >
          <textarea
            name="exclusionCriteria"
            value={form.exclusionCriteria}
            onChange={handleChange}
            rows={3}
            className="field-input"
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Minimum Age" name="minAge" required error={errors.minAge}>
            <input
              type="number"
              min="0"
              name="minAge"
              value={form.minAge}
              onChange={handleChange}
              className="field-input"
            />
          </Field>
          <Field label="Maximum Age" name="maxAge" required error={errors.maxAge}>
            <input
              type="number"
              min="0"
              name="maxAge"
              value={form.maxAge}
              onChange={handleChange}
              className="field-input"
            />
          </Field>
          <Field label="Sex" name="sex" required error={errors.sex}>
            <select name="sex" value={form.sex} onChange={handleChange} className="field-input">
              <option value="">Select</option>
              {sexes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </SectionCard>

      {/* Section 5 — Outcome */}
      <SectionCard id={5} activeSection={activeSection} title="SECTION 5 — OUTCOME">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Outcome Type" name="outcomeType" required error={errors.outcomeType}>
            <select name="outcomeType" value={form.outcomeType} onChange={handleChange} className="field-input">
              <option value="">Select type</option>
              {outcomeTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="Outcome Description"
          name="outcomeDescription"
          required
          error={errors.outcomeDescription}
        >
          <textarea
            name="outcomeDescription"
            value={form.outcomeDescription}
            onChange={handleChange}
            rows={3}
            className="field-input"
          />
        </Field>

        <Field
          label="Time points at which outcome measured"
          name="outcomeTimepoints"
          error={errors.outcomeTimepoints}
        >
          <input
            name="outcomeTimepoints"
            value={form.outcomeTimepoints}
            onChange={handleChange}
            className="field-input"
            placeholder="e.g., Baseline, week 4, week 12"
          />
        </Field>
      </SectionCard>

      {/* Section 6 — Recruitment Centre */}
      <SectionCard id={6} activeSection={activeSection} title="SECTION 6 — RECRUITMENT CENTRE">
        <Field
          label="Name of recruitment centre"
          name="recruitmentCentreName"
          required
          error={errors.recruitmentCentreName}
        >
          <input
            name="recruitmentCentreName"
            value={form.recruitmentCentreName}
            onChange={handleChange}
            className="field-input"
          />
        </Field>
        <Field label="Street address" name="recruitmentCentreStreet">
          <input
            name="recruitmentCentreStreet"
            value={form.recruitmentCentreStreet}
            onChange={handleChange}
            className="field-input"
          />
        </Field>
        <Field label="City" name="recruitmentCentreCity">
          <input
            name="recruitmentCentreCity"
            value={form.recruitmentCentreCity}
            onChange={handleChange}
            className="field-input"
          />
        </Field>
      </SectionCard>

      {/* Section 7 — Ethics Approval */}
      <SectionCard id={7} activeSection={activeSection} title="SECTION 7 — ETHICS APPROVAL">
        <Field
          label="Has the study received ethics committee approval?"
          name="hasEthicsApproval"
          required
          error={errors.hasEthicsApproval}
        >
          <select
            name="hasEthicsApproval"
            value={form.hasEthicsApproval}
            onChange={handleChange}
            className="field-input"
          >
            <option value="">Select</option>
            {yesNo.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>

        {form.hasEthicsApproval === 'Yes' && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Date of approval"
                name="ethicsApprovalDate"
                required
                error={errors.ethicsApprovalDate}
              >
                <input
                  type="date"
                  name="ethicsApprovalDate"
                  value={form.ethicsApprovalDate}
                  onChange={handleChange}
                  className="field-input"
                />
              </Field>
              <Field label="Name of ethics committee" name="ethicsCommitteeName">
                <input
                  name="ethicsCommitteeName"
                  value={form.ethicsCommitteeName}
                  onChange={handleChange}
                  className="field-input"
                />
              </Field>
            </div>
            <Field label="Street address" name="ethicsStreet">
              <input
                name="ethicsStreet"
                value={form.ethicsStreet}
                onChange={handleChange}
                className="field-input"
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Phone number" name="ethicsPhone">
                <input
                  name="ethicsPhone"
                  value={form.ethicsPhone}
                  onChange={handleChange}
                  className="field-input"
                />
              </Field>
              <Field label="Email address" name="ethicsEmail">
                <input
                  type="email"
                  name="ethicsEmail"
                  value={form.ethicsEmail}
                  onChange={handleChange}
                  className="field-input"
                />
              </Field>
            </div>
            <Field label="Upload ethics document" name="ethicsDocumentName">
              <FileInput
                name="ethicsDocumentName"
                fileName={form.ethicsDocumentName}
                onChange={handleFileChange}
                helperText="PDF or image, max 10MB."
              />
            </Field>
          </>
        )}

        {form.hasEthicsApproval === 'No' && (
          <>
            <Field
              label="Date the study will be submitted for approval"
              name="ethicsPlannedSubmissionDate"
              required
              error={errors.ethicsPlannedSubmissionDate}
            >
              <input
                type="date"
                name="ethicsPlannedSubmissionDate"
                value={form.ethicsPlannedSubmissionDate}
                onChange={handleChange}
                className="field-input"
              />
            </Field>
            <Field label="Name of ethics committee" name="ethicsCommitteeName">
              <input
                name="ethicsCommitteeName"
                value={form.ethicsCommitteeName}
                onChange={handleChange}
                className="field-input"
              />
            </Field>
            <Field label="Street address" name="ethicsStreet">
              <input
                name="ethicsStreet"
                value={form.ethicsStreet}
                onChange={handleChange}
                className="field-input"
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Phone number" name="ethicsPhone">
                <input
                  name="ethicsPhone"
                  value={form.ethicsPhone}
                  onChange={handleChange}
                  className="field-input"
                />
              </Field>
              <Field label="Email address" name="ethicsEmail">
                <input
                  type="email"
                  name="ethicsEmail"
                  value={form.ethicsEmail}
                  onChange={handleChange}
                  className="field-input"
                />
              </Field>
            </div>
          </>
        )}
      </SectionCard>

      {/* Section 8 — Funding Sources */}
      <SectionCard id={8} activeSection={activeSection} title="SECTION 8 — FUNDING SOURCES">
        <Field
          label="Name of Source"
          name="fundingSourceName"
          required
          error={errors.fundingSourceName}
        >
          <input
            name="fundingSourceName"
            value={form.fundingSourceName}
            onChange={handleChange}
            className="field-input"
          />
        </Field>
        <Field
          label="Funding Source Type"
          name="fundingSourceType"
          required
          error={errors.fundingSourceType}
        >
          <select
            name="fundingSourceType"
            value={form.fundingSourceType}
            onChange={handleChange}
            className="field-input"
          >
            <option value="">Select type</option>
            {fundingSourceTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </SectionCard>

      {/* Section 9 — Sponsors */}
      <SectionCard id={9} activeSection={activeSection} title="SECTION 9 — SPONSORS">
        <Field label="Sponsor Level" name="sponsorLevel" required error={errors.sponsorLevel}>
          <select
            name="sponsorLevel"
            value={form.sponsorLevel}
            onChange={handleChange}
            className="field-input"
          >
            <option value="">Select level</option>
            {sponsorLevels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Name" name="sponsorName" required error={errors.sponsorName}>
          <input
            name="sponsorName"
            value={form.sponsorName}
            onChange={handleChange}
            className="field-input"
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="City" name="sponsorCity">
            <input
              name="sponsorCity"
              value={form.sponsorCity}
              onChange={handleChange}
              className="field-input"
            />
          </Field>
          <Field label="Country" name="sponsorCountry">
            <input
              name="sponsorCountry"
              value={form.sponsorCountry}
              onChange={handleChange}
              className="field-input"
            />
          </Field>
        </div>
      </SectionCard>

      {/* Section 10 — Collaborators */}
      <SectionCard id={10} activeSection={activeSection} title="SECTION 10 — COLLABORATORS">
        <Field
          label="Is collaborator available for this trial?"
          name="hasCollaborator"
          error={errors.hasCollaborator}
        >
          <select
            name="hasCollaborator"
            value={form.hasCollaborator}
            onChange={handleChange}
            className="field-input"
          >
            <option value="">Select</option>
            {yesNo.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>

        {form.hasCollaborator === 'Yes' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" name="collaboratorName" error={errors.collaboratorName}>
              <input
                name="collaboratorName"
                value={form.collaboratorName}
                onChange={handleChange}
                className="field-input"
              />
            </Field>
            <Field label="Country" name="collaboratorCountry" error={errors.collaboratorCountry}>
              <input
                name="collaboratorCountry"
                value={form.collaboratorCountry}
                onChange={handleChange}
                className="field-input"
              />
            </Field>
          </div>
        )}
      </SectionCard>

      {/* Section 11 — Contact People */}
      <SectionCard id={11} activeSection={activeSection} title="SECTION 11 — CONTACT PEOPLE">
        <Field label="Role" name="contactRole" required error={errors.contactRole}>
          <select
            name="contactRole"
            value={form.contactRole}
            onChange={handleChange}
            className="field-input"
          >
            <option value="">Select role</option>
            {contactRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Title" name="contactTitle">
            <input
              name="contactTitle"
              value={form.contactTitle}
              onChange={handleChange}
              className="field-input"
              placeholder="e.g., Dr, Prof."
            />
          </Field>
          <Field label="First Name" name="contactFirstName" required error={errors.contactFirstName}>
            <input
              name="contactFirstName"
              value={form.contactFirstName}
              onChange={handleChange}
              className="field-input"
            />
          </Field>
          <Field label="Last Name" name="contactLastName" required error={errors.contactLastName}>
            <input
              name="contactLastName"
              value={form.contactLastName}
              onChange={handleChange}
              className="field-input"
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Email" name="contactEmail" required error={errors.contactEmail}>
            <input
              type="email"
              name="contactEmail"
              value={form.contactEmail}
              onChange={handleChange}
              className="field-input"
            />
          </Field>
          <Field label="Phone" name="contactPhone">
            <input
              name="contactPhone"
              value={form.contactPhone}
              onChange={handleChange}
              className="field-input"
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="City" name="contactCity">
            <input
              name="contactCity"
              value={form.contactCity}
              onChange={handleChange}
              className="field-input"
            />
          </Field>
          <Field label="Position / Affiliation" name="contactPosition">
            <input
              name="contactPosition"
              value={form.contactPosition}
              onChange={handleChange}
              className="field-input"
            />
          </Field>
        </div>

        <Field label="Institution working in" name="contactInstitution">
          <input
            name="contactInstitution"
            value={form.contactInstitution}
            onChange={handleChange}
            className="field-input"
          />
        </Field>
      </SectionCard>

      {/* Section 12 — IPD Sharing Statement */}
      <SectionCard id={12} activeSection={activeSection} title="SECTION 12 — IPD SHARING STATEMENT">
        <Field label="IPD Description" name="ipdDescription" error={errors.ipdDescription}>
          <textarea
            name="ipdDescription"
            value={form.ipdDescription}
            onChange={handleChange}
            rows={3}
            className="field-input"
            placeholder="Describe whether and how individual participant data (IPD) will be shared."
          />
        </Field>

        <Field label="Additional Document Types" name="ipdAdditionalDocsName">
          <FileInput
            name="ipdAdditionalDocsName"
            fileName={form.ipdAdditionalDocsName}
            onChange={handleFileChange}
            helperText="Upload any additional IPD-related documents."
          />
        </Field>
      </SectionCard>

      <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          <span>All fields are stored securely in the local demo database.</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              if (!onSubmit) return
              // Allow draft save with minimal validation: just require a title
              if (!form.title.trim()) {
                setErrors((prev) => ({ ...prev, title: 'Title is required to save a draft.' }))
                setActiveSection(1)
                return
              }
              onSubmit({ ...form, status: 'draft' })
            }}
            className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save Draft
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-slate-50 shadow-soft hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting ? 'Submitting…' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </form>
  )
}

function SectionCard({ id, activeSection, title, children }) {
  const isActive = id === activeSection
  return (
    <section
      className={`rounded-2xl border bg-white p-4 text-xs shadow-soft md:p-5 ${
        isActive ? 'border-sky-300 ring-1 ring-sky-100' : 'border-slate-200'
      }`}
    >
      <h2 className="text-[13px] font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}

function Field({ label, name, required, error, children }) {
  return (
    <label className="block text-xs">
      <span className="mb-1 inline-flex items-center gap-1 font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {error && (
        <p className="mt-1 text-[11px] font-medium text-rose-600" data-field={name}>
          {error}
        </p>
      )}
    </label>
  )
}

function FileInput({ name, fileName, onChange, helperText }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100">
        <span>Choose file</span>
        <input type="file" name={name} className="hidden" onChange={onChange} />
      </label>
      <div className="space-y-0.5">
        <div className="text-xs text-slate-600">{fileName || 'No file selected.'}</div>
        {helperText && <div className="text-[10px] text-slate-400">{helperText}</div>}
      </div>
    </div>
  )
}

