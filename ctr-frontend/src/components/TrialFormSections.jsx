import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getUploadedFileName } from '../lib/trialFiles.js'
import { searchIcdDiseases } from '../services/icd.js'

export function Field({ label, name, required, error, children }) {
  return (
    <label className="block text-xs">
      <span className="mb-1 inline-flex items-center gap-1 font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {error && (
        <p className="mt-1 text-[11px] font-medium text-rose-600">
          {error}
        </p>
      )}
    </label>
  )
}

export function FileInput({ name, fileName, onChange, helperText }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100">
        <span>Choose file</span>
        <input type="file" name={name} className="hidden" onChange={onChange} />
      </label>
      <div className="space-y-0.5">
        <div className="text-xs text-slate-600">{getUploadedFileName(fileName) || 'No file selected.'}</div>
        {helperText && <div className="text-[10px] text-slate-400">{helperText}</div>}
      </div>
    </div>
  )
}

export function Multiselect({ options, selected, onChange, name }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
      {options.map((opt) => (
        <label key={opt} className="flex items-start gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => onChange(name, opt)}
            className="mt-0.5 h-3 w-3 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  )
}

function IcdDiseaseSelector({ selected, onAdd, onRemove }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestIdRef = useRef(0)

  const normalizedSelected = useMemo(
    () => (selected || []).map((item) => String(item).trim().toLowerCase()),
    [selected]
  )

  useEffect(() => {
    const text = String(query || '').trim()
    if (text.length < 2) {
      setResults([])
      setLoading(false)
      setError('')
      return undefined
    }

    const currentRequestId = requestIdRef.current + 1
    requestIdRef.current = currentRequestId
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const nextResults = await searchIcdDiseases(text)
        if (requestIdRef.current !== currentRequestId) return
        setResults(nextResults)
      } catch (err) {
        if (requestIdRef.current !== currentRequestId) return
        setResults([])
        setError(err?.response?.data?.message || err?.message || 'Unable to search ICD right now.')
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setLoading(false)
        }
      }
    }, 250)

    return () => window.clearTimeout(timer)
  }, [query])

  function addValue(value) {
    const nextValue = String(value || '').trim()
    if (!nextValue) return
    onAdd(nextValue)
    setQuery('')
    setResults([])
    setError('')
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    if (results.length > 0) {
      addValue(results[0].displayLabel || results[0].title)
      return
    }
    addValue(query)
  }

  const canAddManual = String(query || '').trim().length > 0 && !normalizedSelected.includes(String(query || '').trim().toLowerCase())

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Health Condition(s) Studied *</h3>
        <span className="text-[10px] text-slate-400">Search WHO ICD-11 terms</span>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="field-input"
            placeholder="Type at least 2 characters to search ICD"
          />
          <button
            type="button"
            onClick={() => addValue(query)}
            disabled={!canAddManual}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add typed term
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          Pick a suggestion to save the ICD disease name and code. If the API is unavailable, you can still add a manual term.
        </p>

        {(loading || error || results.length > 0) && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2">
            {loading && <p className="px-2 py-1 text-[11px] text-slate-500">Searching ICD...</p>}
            {!loading && error && <p className="px-2 py-1 text-[11px] text-rose-600">{error}</p>}
            {!loading && !error && results.length === 0 && (
              <p className="px-2 py-1 text-[11px] text-slate-500">No ICD matches found for this search.</p>
            )}
            {!loading && !error && results.length > 0 && (
              <div className="space-y-1">
                {results.map((result) => {
                  const nextLabel = result.displayLabel || result.title
                  const selectedAlready = normalizedSelected.includes(String(nextLabel).trim().toLowerCase())
                  return (
                    <div
                      key={result.id}
                      className="flex items-start justify-between gap-3 rounded-lg px-3 py-2 hover:bg-white"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-medium text-slate-800">{result.title}</span>
                        <span className="block text-[10px] text-slate-500">
                          {result.code || 'No code'}{result.chapter ? ' - ' + result.chapter : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => addValue(nextLabel)}
                        disabled={selectedAlready}
                        className="shrink-0 rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-semibold text-sky-700 hover:bg-sky-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                      >
                        {selectedAlready ? 'Added' : 'Select'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {(selected || []).map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] text-sky-900 ring-1 ring-sky-200"
            >
              <span>{item}</span>
              <button type="button" onClick={() => onRemove(item)} className="text-sky-700 hover:text-rose-600">
                Remove
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TrialDetails({ form, handleChange, handleMultiSelect, constants, addHealthCondition, removeHealthCondition }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Public Title" name="publicTitle" required>
          <input name="publicTitle" value={form.publicTitle} onChange={handleChange} className="field-input" placeholder="Simplified title for the public" />
        </Field>
        <Field label="Official Scientific Title" name="scientificTitle" required>
          <input name="scientificTitle" value={form.scientificTitle} onChange={handleChange} className="field-input" placeholder="Formal scientific title" />
        </Field>
      </div>
      <Field label="Brief Summary (Background & Objectives)" name="briefSummary" required>
        <textarea name="briefSummary" value={form.briefSummary} onChange={handleChange} rows={4} className="field-input" />
      </Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Trial Design Type" name="trialDesign" required>
          <select name="trialDesign" value={form.trialDesign} onChange={handleChange} className="field-input">
            <option value="">Select design</option>
            {constants.trialDesigns.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Trial Phase" name="trialPhase" required>
          <select name="trialPhase" value={form.trialPhase} onChange={handleChange} className="field-input">
            <option value="">Select phase</option>
            {constants.trialPhases.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Acronym" name="acronym">
          <input name="acronym" value={form.acronym} onChange={handleChange} className="field-input" />
        </Field>
      </div>
      <IcdDiseaseSelector selected={form.healthConditions} onAdd={addHealthCondition} onRemove={removeHealthCondition} />
      <Field label="Purpose of the Trial" name="purpose" required>
        <select name="purpose" value={form.purpose} onChange={handleChange} className="field-input">
          <option value="">Select purpose</option>
          {constants.purposes.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Anticipated Start Date" name="anticipatedStartDate" required>
          <input type="date" name="anticipatedStartDate" value={form.anticipatedStartDate} onChange={handleChange} className="field-input" />
        </Field>
        <Field label="Actual Start Date" name="actualStartDate">
          <input type="date" name="actualStartDate" value={form.actualStartDate} onChange={handleChange} className="field-input" />
        </Field>
        <Field label="Anticipated Last Follow-up Date" name="lastFollowUpDate" required>
          <input type="date" name="lastFollowUpDate" value={form.lastFollowUpDate} onChange={handleChange} className="field-input" />
        </Field>
        <Field label="Completion Date" name="completionDate">
          <input type="date" name="completionDate" value={form.completionDate} onChange={handleChange} className="field-input" />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Target Number of Participants" name="targetParticipants" required>
          <input type="number" name="targetParticipants" value={form.targetParticipants} onChange={handleChange} className="field-input" />
        </Field>
        <Field label="Final Number of Participants" name="finalParticipants">
          <input type="number" name="finalParticipants" value={form.finalParticipants} onChange={handleChange} className="field-input" />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Recruitment Status" name="recruitmentStatus" required>
          <select name="recruitmentStatus" value={form.recruitmentStatus} onChange={handleChange} className="field-input">
            <option value="">Select status</option>
            {constants.recruitmentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Publication URL" name="publicationUrl">
          <input type="url" name="publicationUrl" value={form.publicationUrl} onChange={handleChange} className="field-input" placeholder="https://" />
        </Field>
      </div>
    </div>
  )
}

export function DynamicList({ title, name, items, onAdd, onRemove, renderItem, template }) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</h3>
        <button
          type="button"
          onClick={() => onAdd(name, template)}
          className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700 hover:bg-sky-100"
        >
          <span>Add New</span>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
      {items.length === 0 ? (
        <p className="py-2 text-center text-[11px] italic text-slate-400">No entries added yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="relative rounded-lg border border-slate-100 bg-slate-50/50 p-3 pt-6">
              <button
                type="button"
                onClick={() => onRemove(name, index)}
                className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function SecondaryIdentifiers({ form, handleChange }) {
  return (
    <div className="space-y-4">
      <Field label="Is a Secondary ID applicable? *" name="hasSecondaryId">
        <select name="hasSecondaryId" value={form.hasSecondaryId} onChange={handleChange} className="field-input">
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </Field>
      {form.hasSecondaryId === 'Yes' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Secondary ID(s)" name="secondaryIds" required>
            <input name="secondaryIds" value={form.secondaryIds} onChange={handleChange} className="field-input" />
          </Field>
          <Field label="Issuing Authority / Trial Registry *" name="secondaryIdIssuingAuthority" required>
            <input name="secondaryIdIssuingAuthority" value={form.secondaryIdIssuingAuthority} onChange={handleChange} className="field-input" />
          </Field>
        </div>
      )}
    </div>
  )
}

export function StudyDesign({ form, handleChange, constants, handleMultiSelect }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Intervention Assignment *" name="interventionAssignment">
          <select name="interventionAssignment" value={form.interventionAssignment} onChange={handleChange} className="field-input">
            <option value="">Select</option>
            {['Crossover', 'Factorial', 'Parallel', 'Single Group'].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>
        <Field label="Allocation Method *" name="allocation">
          <select name="allocation" value={form.allocation} onChange={handleChange} className="field-input">
            <option value="">Select</option>
            {constants.allocationMethods.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Allocation Concealment *" name="allocationConcealment">
        <select name="allocationConcealment" value={form.allocationConcealment} onChange={handleChange} className="field-input">
          <option value="">Select concealment</option>
          {constants.allocationConcealments.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Masking (Blinding) *" name="maskingType">
        <select name="maskingType" value={form.maskingType} onChange={handleChange} className="field-input">
          <option value="">Select masking</option>
          {constants.maskingTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      {form.maskingType === 'Blinding Used' && (
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Blinded Roles</h3>
          <Multiselect name="maskingRoles" options={constants.maskingRoles} selected={form.maskingRoles} onChange={handleMultiSelect} />
        </div>
      )}
    </div>
  )
}

export function InterventionsList({ form, handleArrayChange, addArrayItem, removeArrayItem, constants }) {
  return (
    <DynamicList
      title="Interventions"
      name="interventions"
      items={form.interventions}
      onAdd={addArrayItem}
      onRemove={removeArrayItem}
      template={{ type: '', name: '', dose: '', duration: '', description: '', groupSize: '', natureOfControl: '' }}
      renderItem={(item, index) => (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Intervention Type *" name={`interventions.${index}.type`}>
              <select value={item.type} onChange={(e) => handleArrayChange('interventions', index, 'type', e.target.value)} className="field-input text-xs">
                <option value="">Select</option>
                {constants.interventionTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Intervention Name *" name={`interventions.${index}.name`}>
              <input value={item.name} onChange={(e) => handleArrayChange('interventions', index, 'name', e.target.value)} className="field-input text-xs" />
            </Field>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Dose (Frequency/Amount)" name={`interventions.${index}.dose`}>
              <input value={item.dose} onChange={(e) => handleArrayChange('interventions', index, 'dose', e.target.value)} className="field-input text-xs" />
            </Field>
            <Field label="Duration *" name={`interventions.${index}.duration`}>
              <input value={item.duration} onChange={(e) => handleArrayChange('interventions', index, 'duration', e.target.value)} className="field-input text-xs" />
            </Field>
          </div>
          <Field label="Description *" name={`interventions.${index}.description`}>
            <textarea value={item.description} onChange={(e) => handleArrayChange('interventions', index, 'description', e.target.value)} rows={2} className="field-input text-xs" />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Group Size *" name={`interventions.${index}.groupSize`}>
              <input type="number" value={item.groupSize} onChange={(e) => handleArrayChange('interventions', index, 'groupSize', e.target.value)} className="field-input text-xs" />
            </Field>
            {item.type === 'Control Group' && (
              <Field label="Nature of Control *" name={`interventions.${index}.natureOfControl`}>
                <select value={item.natureOfControl} onChange={(e) => handleArrayChange('interventions', index, 'natureOfControl', e.target.value)} className="field-input text-xs">
                  <option value="">Select</option>
                  {constants.natureOfControlOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>
        </div>
      )}
    />
  )
}

export function EligibilityCriteria({ form, handleChange, handleMultiSelect, constants }) {
  return (
    <div className="space-y-4">
      <Field label="Inclusion Criteria * (multi-line)" name="inclusionCriteria">
        <textarea name="inclusionCriteria" value={form.inclusionCriteria} onChange={handleChange} rows={4} className="field-input text-xs" />
      </Field>
      <Field label="Exclusion Criteria * (multi-line)" name="exclusionCriteria">
        <textarea name="exclusionCriteria" value={form.exclusionCriteria} onChange={handleChange} rows={4} className="field-input text-xs" />
      </Field>
      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Age Group *</h3>
        <Multiselect name="ageGroups" options={constants.ageGroups} selected={form.ageGroups} onChange={handleMultiSelect} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Minimum Age *" name="minAge">
          <div className="flex gap-2">
            <input type="number" name="minAge" value={form.minAge} onChange={handleChange} className="field-input" />
            <select name="minAgeUnit" value={form.minAgeUnit} onChange={handleChange} className="field-input w-24">
              {constants.ageUnits.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </Field>
        <Field label="Maximum Age *" name="maxAge">
          <div className="flex gap-2">
            <input type="number" name="maxAge" value={form.maxAge} onChange={handleChange} className="field-input" />
            <select name="maxAgeUnit" value={form.maxAgeUnit} onChange={handleChange} className="field-input w-24">
              {constants.ageUnits.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </Field>
      </div>
      <Field label="Sex *" name="sex">
        <select name="sex" value={form.sex} onChange={handleChange} className="field-input">
          <option value="">Select</option>
          {constants.sexes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
    </div>
  )
}

export function OutcomesList({ form, handleArrayChange, addArrayItem, removeArrayItem, constants }) {
  return (
    <div className="space-y-3">
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
        Include at least one <strong>primary</strong> and one <strong>secondary</strong> outcome (you may add more entries).
      </p>
    <DynamicList
      title="Outcomes"
      name="outcomes"
      items={form.outcomes}
      onAdd={addArrayItem}
      onRemove={removeArrayItem}
      template={{ type: '', description: '', timepoints: '' }}
      renderItem={(item, index) => (
        <div className="space-y-3">
          <Field label="Outcome Type *" name={`outcomes.${index}.type`}>
            <select value={item.type} onChange={(e) => handleArrayChange('outcomes', index, 'type', e.target.value)} className="field-input text-xs">
              <option value="">Select</option>
              {constants.outcomeTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Description *" name={`outcomes.${index}.description`}>
            <textarea value={item.description} onChange={(e) => handleArrayChange('outcomes', index, 'description', e.target.value)} rows={2} className="field-input text-xs" />
          </Field>
          <Field label="Timepoint(s) *" name={`outcomes.${index}.timepoints`}>
            <input value={item.timepoints} onChange={(e) => handleArrayChange('outcomes', index, 'timepoints', e.target.value)} className="field-input text-xs" placeholder="e.g., Baseline, Week 12" />
          </Field>
        </div>
      )}
    />
    </div>
  )
}

export function RecruitmentCentresList({ form, handleArrayChange, addArrayItem, removeArrayItem, constants }) {
  return (
    <DynamicList
      title="Recruitment Centres"
      name="recruitmentCentres"
      items={form.recruitmentCentres}
      onAdd={addArrayItem}
      onRemove={removeArrayItem}
      template={{ name: '', street: '', city: '', postalCode: '', country: '', lat: '', lng: '' }}
      renderItem={(item, index) => (
        <div className="space-y-3">
          <Field label="Centre Name *" name={`recruitmentCentres.${index}.name`}>
            <input value={item.name} onChange={(e) => handleArrayChange('recruitmentCentres', index, 'name', e.target.value)} className="field-input text-xs" />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Street Address *" name={`recruitmentCentres.${index}.street`}>
              <input value={item.street} onChange={(e) => handleArrayChange('recruitmentCentres', index, 'street', e.target.value)} className="field-input text-xs" />
            </Field>
            <Field label="City *" name={`recruitmentCentres.${index}.city`}>
              <input value={item.city} onChange={(e) => handleArrayChange('recruitmentCentres', index, 'city', e.target.value)} className="field-input text-xs" />
            </Field>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Postal Code" name={`recruitmentCentres.${index}.postalCode`}>
              <input value={item.postalCode} onChange={(e) => handleArrayChange('recruitmentCentres', index, 'postalCode', e.target.value)} className="field-input text-xs" />
            </Field>
            <Field label="Country *" name={`recruitmentCentres.${index}.country`}>
              <select value={item.country} onChange={(e) => handleArrayChange('recruitmentCentres', index, 'country', e.target.value)} className="field-input text-xs">
                <option value="">Select country</option>
                {constants.countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Latitude (Optional)" name={`recruitmentCentres.${index}.lat`}>
              <input type="number" step="any" value={item.lat} onChange={(e) => handleArrayChange('recruitmentCentres', index, 'lat', e.target.value)} className="field-input text-xs" />
            </Field>
            <Field label="Longitude (Optional)" name={`recruitmentCentres.${index}.lng`}>
              <input type="number" step="any" value={item.lng} onChange={(e) => handleArrayChange('recruitmentCentres', index, 'lng', e.target.value)} className="field-input text-xs" />
            </Field>
          </div>
        </div>
      )}
    />
  )
}

export function EthicsApprovalsList({ form, handleArrayChange, addArrayItem, removeArrayItem, handleFileChange, constants }) {
  return (
    <DynamicList
      title="Ethics Approvals"
      name="ethicsApprovals"
      items={form.ethicsApprovals}
      onAdd={addArrayItem}
      onRemove={removeArrayItem}
      template={{ obtained: '', date: '', institutionAddress: '', phone: '', email: '', city: '', postalCode: '', country: '', document: '', plannedSubmissionDate: '' }}
      renderItem={(item, index) => (
        <div className="space-y-3">
          <Field label="Has Ethics Approval Been Obtained? *" name={`ethicsApprovals.${index}.obtained`}>
            <select value={item.obtained} onChange={(e) => handleArrayChange('ethicsApprovals', index, 'obtained', e.target.value)} className="field-input text-xs">
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
          {item.obtained === 'Yes' ? (
            <>
              <Field label="Approval Date *" name={`ethicsApprovals.${index}.date`}>
                <input type="date" value={item.date} onChange={(e) => handleArrayChange('ethicsApprovals', index, 'date', e.target.value)} className="field-input text-xs" />
              </Field>
              <Field label="Institution Address *" name={`ethicsApprovals.${index}.institutionAddress`}>
                <input value={item.institutionAddress} onChange={(e) => handleArrayChange('ethicsApprovals', index, 'institutionAddress', e.target.value)} className="field-input text-xs" />
              </Field>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Phone *" name={`ethicsApprovals.${index}.phone`}>
                  <input value={item.phone} onChange={(e) => handleArrayChange('ethicsApprovals', index, 'phone', e.target.value)} className="field-input text-xs" />
                </Field>
                <Field label="Email *" name={`ethicsApprovals.${index}.email`}>
                  <input type="email" value={item.email} onChange={(e) => handleArrayChange('ethicsApprovals', index, 'email', e.target.value)} className="field-input text-xs" />
                </Field>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="City *" name={`ethicsApprovals.${index}.city`}>
                  <input value={item.city} onChange={(e) => handleArrayChange('ethicsApprovals', index, 'city', e.target.value)} className="field-input text-xs" />
                </Field>
                <Field label="Postal Code" name={`ethicsApprovals.${index}.postalCode`}>
                  <input value={item.postalCode} onChange={(e) => handleArrayChange('ethicsApprovals', index, 'postalCode', e.target.value)} className="field-input text-xs" />
                </Field>
                <Field label="Country *" name={`ethicsApprovals.${index}.country`}>
                  <select value={item.country} onChange={(e) => handleArrayChange('ethicsApprovals', index, 'country', e.target.value)} className="field-input text-xs">
                    <option value="">Select country</option>
                    {constants.countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Upload Ethics Document (PDF) *" name={`ethicsApprovals.${index}.document`}>
                <FileInput name={`ethicsApprovals.${index}.document`} fileName={item.document} onChange={(e) => handleFileChange(e, `ethicsApprovals.document`, index)} helperText="Max 10MB" />
              </Field>
            </>
          ) : item.obtained === 'No' ? (
            <>
              <Field label="Planned Submission Date *" name={`ethicsApprovals.${index}.plannedSubmissionDate`}>
                <input type="date" value={item.plannedSubmissionDate} onChange={(e) => handleArrayChange('ethicsApprovals', index, 'plannedSubmissionDate', e.target.value)} className="field-input text-xs" />
              </Field>
              <Field label="Institution Address *" name={`ethicsApprovals.${index}.institutionAddress`}>
                <input value={item.institutionAddress} onChange={(e) => handleArrayChange('ethicsApprovals', index, 'institutionAddress', e.target.value)} className="field-input text-xs" />
              </Field>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Phone *" name={`ethicsApprovals.${index}.phone`}>
                  <input value={item.phone} onChange={(e) => handleArrayChange('ethicsApprovals', index, 'phone', e.target.value)} className="field-input text-xs" />
                </Field>
                <Field label="Email *" name={`ethicsApprovals.${index}.email`}>
                  <input type="email" value={item.email} onChange={(e) => handleArrayChange('ethicsApprovals', index, 'email', e.target.value)} className="field-input text-xs" />
                </Field>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="City *" name={`ethicsApprovals.${index}.city`}>
                  <input value={item.city} onChange={(e) => handleArrayChange('ethicsApprovals', index, 'city', e.target.value)} className="field-input text-xs" />
                </Field>
                <Field label="Postal Code" name={`ethicsApprovals.${index}.postalCode`}>
                  <input value={item.postalCode} onChange={(e) => handleArrayChange('ethicsApprovals', index, 'postalCode', e.target.value)} className="field-input text-xs" />
                </Field>
                <Field label="Country *" name={`ethicsApprovals.${index}.country`}>
                  <select value={item.country} onChange={(e) => handleArrayChange('ethicsApprovals', index, 'country', e.target.value)} className="field-input text-xs">
                    <option value="">Select country</option>
                    {constants.countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Upload Supporting Document (PDF)" name={`ethicsApprovals.${index}.document`}>
                <FileInput name={`ethicsApprovals.${index}.document`} fileName={item.document} onChange={(e) => handleFileChange(e, `ethicsApprovals.document`, index)} helperText="Max 10MB" />
              </Field>
            </>
          ) : null}
        </div>
      )}
    />
  )
}

export function FundingSourcesList({ form, handleArrayChange, addArrayItem, removeArrayItem, constants }) {
  return (
    <DynamicList
      title="Funding Sources"
      name="fundingSources"
      items={form.fundingSources}
      onAdd={addArrayItem}
      onRemove={removeArrayItem}
      template={{ name: '', type: '', address: '', city: '', postalCode: '', country: '' }}
      renderItem={(item, index) => (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Source Name *" name={`fundingSources.${index}.name`}>
              <input value={item.name} onChange={(e) => handleArrayChange('fundingSources', index, 'name', e.target.value)} className="field-input text-xs" />
            </Field>
            <Field label="Funding Type *" name={`fundingSources.${index}.type`}>
              <select value={item.type} onChange={(e) => handleArrayChange('fundingSources', index, 'type', e.target.value)} className="field-input text-xs">
                <option value="">Select type</option>
                {constants.fundingSourceTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Address *" name={`fundingSources.${index}.address`}>
            <input value={item.address} onChange={(e) => handleArrayChange('fundingSources', index, 'address', e.target.value)} className="field-input text-xs" />
          </Field>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="City *" name={`fundingSources.${index}.city`}>
              <input value={item.city} onChange={(e) => handleArrayChange('fundingSources', index, 'city', e.target.value)} className="field-input text-xs" />
            </Field>
            <Field label="Postal Code" name={`fundingSources.${index}.postalCode`}>
              <input value={item.postalCode} onChange={(e) => handleArrayChange('fundingSources', index, 'postalCode', e.target.value)} className="field-input text-xs" />
            </Field>
            <Field label="Country *" name={`fundingSources.${index}.country`}>
              <select value={item.country} onChange={(e) => handleArrayChange('fundingSources', index, 'country', e.target.value)} className="field-input text-xs">
                <option value="">Select country</option>
                {constants.countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </div>
      )}
    />
  )
}

export function SponsorsList({ form, handleArrayChange, addArrayItem, removeArrayItem, constants }) {
  return (
    <DynamicList
      title="Sponsors"
      name="sponsors"
      items={form.sponsors}
      onAdd={addArrayItem}
      onRemove={removeArrayItem}
      template={{ level: '', name: '', address: '', city: '', postalCode: '', country: '', type: '' }}
      renderItem={(item, index) => (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Sponsor Level *" name={`sponsors.${index}.level`}>
              <select value={item.level} onChange={(e) => handleArrayChange('sponsors', index, 'level', e.target.value)} className="field-input text-xs">
                <option value="">Select</option>
                {constants.sponsorLevels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Sponsor Type *" name={`sponsors.${index}.type`}>
              <select value={item.type} onChange={(e) => handleArrayChange('sponsors', index, 'type', e.target.value)} className="field-input text-xs">
                <option value="">Select type</option>
                {constants.sponsorTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Name *" name={`sponsors.${index}.name`}>
            <input value={item.name} onChange={(e) => handleArrayChange('sponsors', index, 'name', e.target.value)} className="field-input text-xs" />
          </Field>
          <Field label="Address *" name={`sponsors.${index}.address`}>
            <input value={item.address} onChange={(e) => handleArrayChange('sponsors', index, 'address', e.target.value)} className="field-input text-xs" />
          </Field>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="City *" name={`sponsors.${index}.city`}>
              <input value={item.city} onChange={(e) => handleArrayChange('sponsors', index, 'city', e.target.value)} className="field-input text-xs" />
            </Field>
            <Field label="Postal Code" name={`sponsors.${index}.postalCode`}>
              <input value={item.postalCode} onChange={(e) => handleArrayChange('sponsors', index, 'postalCode', e.target.value)} className="field-input text-xs" />
            </Field>
            <Field label="Country *" name={`sponsors.${index}.country`}>
              <select value={item.country} onChange={(e) => handleArrayChange('sponsors', index, 'country', e.target.value)} className="field-input text-xs">
                <option value="">Select country</option>
                {constants.countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </div>
      )}
    />
  )
}

export function Collaborators({ form, handleChange, constants }) {
  return (
    <div className="space-y-4">
      <Field label="Are there collaborators? *" name="hasCollaborator">
        <select name="hasCollaborator" value={form.hasCollaborator} onChange={handleChange} className="field-input">
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </Field>
      {form.hasCollaborator === 'Yes' && (
        <div className="space-y-4 rounded-xl border border-slate-200 p-4">
          <Field label="Name" name="collaboratorName">
            <input name="collaboratorName" value={form.collaboratorName} onChange={handleChange} className="field-input" />
          </Field>
          <Field label="Address" name="collaboratorAddress">
            <input name="collaboratorAddress" value={form.collaboratorAddress} onChange={handleChange} className="field-input" />
          </Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="City" name="collaboratorCity">
              <input name="collaboratorCity" value={form.collaboratorCity} onChange={handleChange} className="field-input" />
            </Field>
            <Field label="Postal Code" name="collaboratorPostalCode">
              <input name="collaboratorPostalCode" value={form.collaboratorPostalCode} onChange={handleChange} className="field-input" />
            </Field>
            <Field label="Country" name="collaboratorCountry">
              <select name="collaboratorCountry" value={form.collaboratorCountry} onChange={handleChange} className="field-input">
                <option value="">Select country</option>
                {constants.countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </div>
      )}
    </div>
  )
}

export function ContactPersonsList({ form, handleArrayChange, addArrayItem, removeArrayItem, constants }) {
  return (
    <div className="space-y-3">
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
        Add at least one contact for each role: Principal Investigator, Public Enquiries, and Scientific Enquiries.
      </p>
    <DynamicList
      title="Contact Persons"
      name="contactPersons"
      items={form.contactPersons}
      onAdd={addArrayItem}
      onRemove={removeArrayItem}
      template={{ role: '', title: '', firstName: '', lastName: '', email: '', altEmail: '', phone: '', address: '', city: '', postalCode: '', country: '', affiliation: '' }}
      renderItem={(item, index) => (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Role *" name={`contactPersons.${index}.role`}>
              <select value={item.role} onChange={(e) => handleArrayChange('contactPersons', index, 'role', e.target.value)} className="field-input text-xs">
                <option value="">Select role</option>
                {constants.contactRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Title *" name={`contactPersons.${index}.title`}>
              <select value={item.title} onChange={(e) => handleArrayChange('contactPersons', index, 'title', e.target.value)} className="field-input text-xs">
                <option value="">Select</option>
                {constants.contactTitles.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="First Name *" name={`contactPersons.${index}.firstName`}>
              <input value={item.firstName} onChange={(e) => handleArrayChange('contactPersons', index, 'firstName', e.target.value)} className="field-input text-xs" />
            </Field>
            <Field label="Last Name *" name={`contactPersons.${index}.lastName`}>
              <input value={item.lastName} onChange={(e) => handleArrayChange('contactPersons', index, 'lastName', e.target.value)} className="field-input text-xs" />
            </Field>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Email *" name={`contactPersons.${index}.email`}>
              <input type="email" value={item.email} onChange={(e) => handleArrayChange('contactPersons', index, 'email', e.target.value)} className="field-input text-xs" />
            </Field>
            <Field label="Additional Email" name={`contactPersons.${index}.altEmail`}>
              <input type="email" value={item.altEmail} onChange={(e) => handleArrayChange('contactPersons', index, 'altEmail', e.target.value)} className="field-input text-xs" />
            </Field>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Phone *" name={`contactPersons.${index}.phone`}>
              <input value={item.phone} onChange={(e) => handleArrayChange('contactPersons', index, 'phone', e.target.value)} className="field-input text-xs" />
            </Field>
            <Field label="Affiliation / Position *" name={`contactPersons.${index}.affiliation`}>
              <input value={item.affiliation} onChange={(e) => handleArrayChange('contactPersons', index, 'affiliation', e.target.value)} className="field-input text-xs" />
            </Field>
          </div>
          <Field label="Address *" name={`contactPersons.${index}.address`}>
            <input value={item.address} onChange={(e) => handleArrayChange('contactPersons', index, 'address', e.target.value)} className="field-input text-xs" />
          </Field>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="City *" name={`contactPersons.${index}.city`}>
              <input value={item.city} onChange={(e) => handleArrayChange('contactPersons', index, 'city', e.target.value)} className="field-input text-xs" />
            </Field>
            <Field label="Postal Code" name={`contactPersons.${index}.postalCode`}>
              <input value={item.postalCode} onChange={(e) => handleArrayChange('contactPersons', index, 'postalCode', e.target.value)} className="field-input text-xs" />
            </Field>
            <Field label="Country *" name={`contactPersons.${index}.country`}>
              <select value={item.country} onChange={(e) => handleArrayChange('contactPersons', index, 'country', e.target.value)} className="field-input text-xs">
                <option value="">Select country</option>
                {constants.countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </div>
      )}
    />
    </div>
  )
}

export function ResultsIPD({
  form,
  handleChange,
  handleMultiSelect,
  constants,
  appendResultsSummaryFile,
  removeResultsSummaryFile,
  addResultsUrl,
  updateResultsUrl,
  removeResultsUrl
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border border-slate-200 p-4">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">IPD Sharing Statement</h3>
        <Field label="IPD Sharing Description *" name="ipdDescription">
          <textarea name="ipdDescription" value={form.ipdDescription} onChange={handleChange} rows={3} className="field-input" placeholder="Describe whether and how individual participant data will be shared." />
        </Field>
        <div className="rounded-lg bg-slate-50 p-3">
          <h4 className="mb-2 text-[10px] font-bold uppercase text-slate-400">Additional Documents</h4>
          <Multiselect name="ipdAdditionalDocs" options={constants.ipdAdditionalDocsOptions} selected={form.ipdAdditionalDocs} onChange={handleMultiSelect} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Sharing Timeframe *" name="ipdSharingTimeframe">
            <input name="ipdSharingTimeframe" value={form.ipdSharingTimeframe} onChange={handleChange} className="field-input" />
          </Field>
          <Field label="Access Criteria *" name="ipdAccessCriteria">
            <input name="ipdAccessCriteria" value={form.ipdAccessCriteria} onChange={handleChange} className="field-input" />
          </Field>
        </div>
        <Field label="URL" name="ipdUrl">
          <input type="url" name="ipdUrl" value={form.ipdUrl} onChange={handleChange} className="field-input" placeholder="https://" />
        </Field>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 p-4 font-normal">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-rose-500">Trial Results</h3>
        <Field label="Are Results Available? *" name="resultsAvailable">
          <select name="resultsAvailable" value={form.resultsAvailable} onChange={handleChange} className="field-input">
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </Field>
        {form.resultsAvailable === 'Yes' && (
          <div className="space-y-4">
            <Field label="Upload Result Summary PDF(s) *" name="resultsSummaryDocs">
              <div className="space-y-2">
                <FileInput
                  name="resultsSummaryDocs_new"
                  fileName=""
                  onChange={appendResultsSummaryFile}
                  helperText="You may upload multiple files one at a time."
                />
                <div className="flex flex-wrap gap-2">
                  {(form.resultsSummaryDocs || []).map((f, index) => (
                    <span
                      key={`${getUploadedFileName(f)}-${index}`}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600"
                    >
                      {getUploadedFileName(f)}
                      <button
                        type="button"
                        onClick={() => removeResultsSummaryFile(index)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </Field>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-slate-700">Results URL(s)</span>
                <button
                  type="button"
                  onClick={addResultsUrl}
                  className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Add URL
                </button>
              </div>
              {(form.resultsUrls || []).map((url, uidx) => (
                <div key={uidx} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateResultsUrl(uidx, e.target.value)}
                    className="field-input flex-1 text-xs"
                    placeholder="https://"
                  />
                  <button
                    type="button"
                    onClick={() => removeResultsUrl(uidx)}
                    className="rounded-lg border border-slate-200 px-2 text-[10px] text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="First Publication Date" name="resultsFirstPublicationDate">
                <input type="date" name="resultsFirstPublicationDate" value={form.resultsFirstPublicationDate} onChange={handleChange} className="field-input" />
              </Field>
              <Field label="Protocol Link" name="resultsProtocolLink">
                <input type="url" name="resultsProtocolLink" value={form.resultsProtocolLink} onChange={handleChange} className="field-input" />
              </Field>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}








