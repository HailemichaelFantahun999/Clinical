import React from 'react'
import {
  PURPOSE_OPTIONS,
  ALLOCATION_OPTIONS,
  RECRUITMENT_OPTIONS,
  DISEASE_OPTIONS,
  GENDER_OPTIONS,
  ETHICS_STATUS_OPTIONS,
  SPONSOR_NATURE_OPTIONS,
  FUNDING_SOURCE_TYPE_OPTIONS,
  PHASE_OPTIONS,
  AGE_UNIT_OPTIONS
} from '../lib/publicTrialFilters.js'

function toggleInArray(arr, v) {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
}

function AndOr({ value, onChange, idPrefix }) {
  return (
    <div className="flex flex-wrap gap-3 text-[11px]" role="radiogroup" aria-label="Match mode">
      <label className="inline-flex cursor-pointer items-center gap-1.5">
        <input
          type="radio"
          name={`${idPrefix}-mode`}
          checked={value === 'and'}
          onChange={() => onChange('and')}
          className="text-sky-600"
        />
        AND
      </label>
      <label className="inline-flex cursor-pointer items-center gap-1.5">
        <input
          type="radio"
          name={`${idPrefix}-mode`}
          checked={value === 'or'}
          onChange={() => onChange('or')}
          className="text-sky-600"
        />
        OR
      </label>
    </div>
  )
}

function CheckboxGrid({ options, selected, onToggle, columns = 1 }) {
  return (
    <div
      className={`grid gap-1.5 text-[11px] ${
        columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : ''
      }`}
    >
      {options.map((opt) => (
        <label key={opt} className="flex cursor-pointer items-start gap-2 rounded-lg px-1 py-0.5 hover:bg-slate-50">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => onToggle(opt)}
            className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-sky-600"
          />
          <span className="leading-snug text-slate-700">{opt}</span>
        </label>
      ))}
    </div>
  )
}

function FilterBlock({ title, children, mode, setMode }) {
  const id = title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3" role="group" aria-label={title}>
      <div className="font-semibold text-slate-800">{title}</div>
      <div className="mt-2 space-y-2">
        <AndOr value={mode} onChange={setMode} idPrefix={id} />
        {children}
      </div>
    </div>
  )
}

export default function PublicTrialFiltersPanel({ filters, onChange, onReset, sticky = true }) {
  const f = filters
  const patch = onChange

  return (
    <aside className="lg:w-[22rem] lg:shrink-0">
      <div
        className={`${sticky ? 'sticky top-4 max-h-[calc(100vh-5rem)] overflow-y-auto' : ''} rounded-2xl border border-slate-200 bg-white p-4 shadow-soft`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-600">Filters</h2>
          <button type="button" onClick={onReset} className="text-[11px] font-medium text-sky-700 hover:underline">
            Clear all
          </button>
        </div>

        <div className="mt-4 space-y-5 text-xs">


          <FilterBlock title="Purpose of trial" mode={f.purposeMode} setMode={(purposeMode) => patch({ purposeMode })}>
            <CheckboxGrid
              options={PURPOSE_OPTIONS}
              selected={f.purposes}
              onToggle={(opt) => patch({ purposes: toggleInArray(f.purposes, opt) })}
              columns={2}
            />
          </FilterBlock>

          <FilterBlock title="Allocation to intervention" mode={f.allocationMode} setMode={(allocationMode) => patch({ allocationMode })}>
            <CheckboxGrid
              options={ALLOCATION_OPTIONS}
              selected={f.allocation}
              onToggle={(opt) => patch({ allocation: toggleInArray(f.allocation, opt) })}
            />
          </FilterBlock>

          <FilterBlock title="Recruitment status" mode={f.recruitmentMode} setMode={(recruitmentMode) => patch({ recruitmentMode })}>
            <CheckboxGrid
              options={RECRUITMENT_OPTIONS}
              selected={f.recruitment}
              onToggle={(opt) => patch({ recruitment: toggleInArray(f.recruitment, opt) })}
              columns={2}
            />
          </FilterBlock>

          <FilterBlock title="Disease category" mode={f.diseaseMode} setMode={(diseaseMode) => patch({ diseaseMode })}>
            <CheckboxGrid
              options={DISEASE_OPTIONS}
              selected={f.disease}
              onToggle={(opt) => patch({ disease: toggleInArray(f.disease, opt) })}
              columns={2}
            />
          </FilterBlock>

          <FilterBlock title="Gender" mode={f.genderMode} setMode={(genderMode) => patch({ genderMode })}>
            <CheckboxGrid options={GENDER_OPTIONS} selected={f.gender} onToggle={(opt) => patch({ gender: toggleInArray(f.gender, opt) })} />
          </FilterBlock>

          <fieldset>
            <legend className="mb-2 font-semibold text-slate-800">Age group</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block text-[11px]">
                <span className="mb-0.5 block text-slate-600">Min age</span>
                <div className="flex gap-1">
                  <input
                    type="number"
                    min="0"
                    value={f.minAge}
                    onChange={(e) => patch({ minAge: e.target.value })}
                    className="field-input min-w-0 flex-1 text-xs"
                  />
                  <select
                    value={f.minAgeUnit}
                    onChange={(e) => patch({ minAgeUnit: e.target.value })}
                    className="field-input w-[5.5rem] shrink-0 text-[10px]"
                  >
                    {AGE_UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="block text-[11px]">
                <span className="mb-0.5 block text-slate-600">Max age</span>
                <div className="flex gap-1">
                  <input
                    type="number"
                    min="0"
                    value={f.maxAge}
                    onChange={(e) => patch({ maxAge: e.target.value })}
                    className="field-input min-w-0 flex-1 text-xs"
                  />
                  <select
                    value={f.maxAgeUnit}
                    onChange={(e) => patch({ maxAgeUnit: e.target.value })}
                    className="field-input w-[5.5rem] shrink-0 text-[10px]"
                  >
                    {AGE_UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            </div>
          </fieldset>

          <FilterBlock title="Ethics application status" mode={f.ethicsMode} setMode={(ethicsMode) => patch({ ethicsMode })}>
            <CheckboxGrid options={ETHICS_STATUS_OPTIONS} selected={f.ethics} onToggle={(opt) => patch({ ethics: toggleInArray(f.ethics, opt) })} />
          </FilterBlock>

          <fieldset>
            <legend className="mb-2 font-semibold text-slate-800">Registration date</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-[11px]">
                <span className="mb-0.5 block text-slate-600">From</span>
                <input type="date" value={f.registrationDateFrom} onChange={(e) => patch({ registrationDateFrom: e.target.value })} className="field-input text-xs" />
              </label>
              <label className="text-[11px]">
                <span className="mb-0.5 block text-slate-600">To</span>
                <input type="date" value={f.registrationDateTo} onChange={(e) => patch({ registrationDateTo: e.target.value })} className="field-input text-xs" />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 font-semibold text-slate-800">Trial start date</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-[11px]">
                <span className="mb-0.5 block text-slate-600">From</span>
                <input type="date" value={f.trialStartDateFrom} onChange={(e) => patch({ trialStartDateFrom: e.target.value })} className="field-input text-xs" />
              </label>
              <label className="text-[11px]">
                <span className="mb-0.5 block text-slate-600">To</span>
                <input type="date" value={f.trialStartDateTo} onChange={(e) => patch({ trialStartDateTo: e.target.value })} className="field-input text-xs" />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1 font-semibold text-slate-800">Countries of recruitment</legend>
            <input
              type="text"
              value={f.countriesRecruitment}
              onChange={(e) => patch({ countriesRecruitment: e.target.value })}
              className="field-input text-xs"
              placeholder="Match any recruitment centre country"
            />
          </fieldset>

          <FilterBlock title="Nature of sponsor" mode={f.sponsorNatureMode} setMode={(sponsorNatureMode) => patch({ sponsorNatureMode })}>
            <CheckboxGrid
              options={SPONSOR_NATURE_OPTIONS}
              selected={f.sponsorNature}
              onToggle={(opt) => patch({ sponsorNature: toggleInArray(f.sponsorNature, opt) })}
              columns={2}
            />
          </FilterBlock>

          <FilterBlock title="Funding source type" mode={f.fundingSourceTypeMode} setMode={(fundingSourceTypeMode) => patch({ fundingSourceTypeMode })}>
            <CheckboxGrid
              options={FUNDING_SOURCE_TYPE_OPTIONS}
              selected={f.fundingSourceType}
              onToggle={(opt) => patch({ fundingSourceType: toggleInArray(f.fundingSourceType, opt) })}
              columns={2}
            />
          </FilterBlock>

          <fieldset>
            <legend className="mb-1 font-semibold text-slate-800">Country of principal investigator</legend>
            <input
              type="text"
              value={f.countryPI}
              onChange={(e) => patch({ countryPI: e.target.value })}
              className="field-input text-xs"
            />
          </fieldset>

          <fieldset>
            <legend className="mb-1 font-semibold text-slate-800">Name of principal investigator</legend>
            <input
              type="text"
              value={f.piName}
              onChange={(e) => patch({ piName: e.target.value })}
              className="field-input text-xs"
            />
          </fieldset>

          <FilterBlock title="Phase" mode={f.phaseMode} setMode={(phaseMode) => patch({ phaseMode })}>
            <CheckboxGrid options={PHASE_OPTIONS} selected={f.phase} onToggle={(opt) => patch({ phase: toggleInArray(f.phase, opt) })} />
          </FilterBlock>
        </div>
      </div>
    </aside>
  )
}

