/**
 * Client-side filters for approved trials (trial row + data JSON).
 */

export const PURPOSE_OPTIONS = [
  'Diagnosis / Prognosis',
  'Early detection /Screening',
  'Other Interventions',
  'Physical activity and nutrition',
  'Prevention',
  'Prevention: Vaccines',
  'Psychosocial',
  'Rehabilitation',
  'Supportive care',
  'Treatment: Devices',
  'Treatment: Drugs',
  'Treatment: Other',
  'Treatment: Surgery'
]

export const ALLOCATION_OPTIONS = ['Non-randomised', 'Randomized']

export const RECRUITMENT_OPTIONS = [
  'Active, not recruiting',
  'Closed to recruitment, follow-up continuing',
  'Completed',
  'Not yet recruiting',
  'Recruiting',
  'Stopped early/ terminated',
  'Suspended',
  'Withdrawn'
]

export const DISEASE_OPTIONS = [
  'Anaesthesia',
  'Cancer',
  'Cardiology',
  'Circulatory System',
  'Digestive System',
  'Ear, Nose and Throat',
  'Eye Diseases',
  'Genetic Diseases',
  'Haematological Disorders',
  'Infections and Infestations',
  'Injury, Occupational Diseases, Poisoning',
  'Kidney Disease',
  'Mental and Behavioural Disorders',
  'Musculoskeletal Diseases',
  'Neonatal Diseases',
  'Nervous System Diseases',
  'Nutritional, Metabolic, Endocrine',
  'Obstetrics and Gynecology',
  'Oral Health',
  'Orthopaedics',
  'Other',
  'Paediatrics',
  'Pregnancy and Childbirth',
  'Respiratory',
  'Skin and Connective Tissue Diseases',
  'Surgery',
  'Urological and Genital Diseases'
]

export const GENDER_OPTIONS = ['Both', 'Female', 'Male']

export const ETHICS_STATUS_OPTIONS = ['Not Approved', 'Approved']

export const SPONSOR_NATURE_OPTIONS = [
  'Charities/Societies/Foundation',
  'Commercial Sector/Industry',
  'Funding Agency',
  'Hospital',
  'Individual',
  'Other',
  'Other Collaborative Groups',
  'University'
]

export const FUNDING_SOURCE_TYPE_OPTIONS = [
  'Charities/Societies/Foundation',
  'Commercial Sector / Industry',
  'Funding Agency',
  'Government Body',
  'Hospital',
  'Other',
  'Other Collaborative Groups',
  'Self Funded',
  'University'
]

export const PHASE_OPTIONS = ['Not Applicable', 'Phase-0', 'Phase-1', 'Phase-2', 'Phase-3', 'Phase-4']

export const AGE_UNIT_OPTIONS = ['Day(s)', 'Week(s)', 'Month(s)', 'Year(s)']

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[–—-]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Map search recruitment label to likely stored values */
const RECRUITMENT_ALIASES = {
  'active, not recruiting': ['active, not recruiting', 'active not recruiting'],
  'closed to recruitment, follow-up continuing': [
    'closed to recruitment',
    'follow-up continuing',
    'follow up continuing',
    'follow-up'
  ],
  completed: ['completed'],
  'not yet recruiting': ['not yet recruiting'],
  recruiting: ['recruiting'],
  'stopped early/ terminated': ['terminated', 'stopped', 'withdrawn'],
  suspended: ['suspended'],
  withdrawn: ['withdrawn']
}

function recruitmentMatches(stored, selectedLabel) {
  const s = norm(stored)
  const key = norm(selectedLabel)
  const aliases = RECRUITMENT_ALIASES[key] || [key.replace(/,/g, '')]
  return aliases.some((a) => s.includes(a) || s === a)
}

function diseaseMatchesTrialCategory(categoryLabel, healthConditions) {
  const cat = norm(categoryLabel)
  const list = Array.isArray(healthConditions) ? healthConditions : []
  return list.some((h) => {
    const n = norm(h)
    return n.includes(cat) || cat.includes(n) || fuzzyWordsOverlap(n, cat)
  })
}

function fuzzyWordsOverlap(a, b) {
  const wa = a.split(/[^a-z0-9]+/).filter(Boolean)
  const wb = b.split(/[^a-z0-9]+/).filter(Boolean)
  return wa.some((w) => w.length > 3 && wb.some((x) => x.includes(w) || w.includes(x)))
}

function purposeMatches(trialPurpose, selected, mode) {
  if (!selected.length) return true
  const tp = norm(trialPurpose)
  const checks = selected.map((p) => {
    const n = norm(p)
    return tp.includes(n) || n.includes(tp) || fuzzyWordsOverlap(tp, n)
  })
  return mode === 'and' ? checks.every(Boolean) : checks.some(Boolean)
}

function allocationMatches(stored, selected, mode) {
  if (!selected.length) return true
  const s = norm(stored)
  const ok = (label) => {
    const n = norm(label)
    if (n.includes('non')) return s.includes('non') && s.includes('random')
    if (n.includes('random') && !n.includes('non')) return s.includes('random') && !s.includes('non')
    return false
  }
  const results = selected.map(ok)
  return mode === 'and' ? results.every(Boolean) : results.some(Boolean)
}

function recruitmentMulti(stored, selected, mode) {
  if (!selected.length) return true
  const results = selected.map((sel) => recruitmentMatches(stored, sel))
  return mode === 'and' ? results.every(Boolean) : results.some(Boolean)
}

function diseaseMulti(healthConditions, selected, mode) {
  if (!selected.length) return true
  const results = selected.map((cat) => diseaseMatchesTrialCategory(cat, healthConditions))
  return mode === 'and' ? results.every(Boolean) : results.some(Boolean)
}

function genderMatches(stored, selected, mode) {
  if (!selected.length) return true
  const s = norm(stored)
  const results = selected.map((g) => {
    const n = norm(g)
    if (n === 'both') return s === 'both' || s === 'all'
    return s === n || s === 'both'
  })
  return mode === 'and' ? results.every(Boolean) : results.some(Boolean)
}

function ethicsStatus(trial) {
  const d = trial.data || {}
  const rows = Array.isArray(d.ethicsApprovals) ? d.ethicsApprovals : []
  if (!rows.length) return 'Not Approved'
  const anyYes = rows.some((r) => r.obtained === 'Yes')
  return anyYes ? 'Approved' : 'Not Approved'
}

function ethicsMatches(trial, selected, mode) {
  if (!selected.length) return true
  const st = ethicsStatus(trial)
  const results = selected.map((x) => norm(x) === norm(st))
  return mode === 'and' ? results.every(Boolean) : results.some(Boolean)
}

function sponsorNatureMatches(data, selected, mode) {
  if (!selected.length) return true
  const sponsors = Array.isArray(data.sponsors) ? data.sponsors : []
  const types = sponsors.map((s) => norm(s.type || ''))
  const results = selected.map((sel) => {
    const n = norm(sel)
    return types.some((t) => t.includes(n) || n.includes(t) || fuzzyWordsOverlap(t, n))
  })
  return mode === 'and' ? results.every(Boolean) : results.some(Boolean)
}

function fundingTypeMatches(data, selected, mode) {
  if (!selected.length) return true
  const rows = Array.isArray(data.fundingSources) ? data.fundingSources : []
  const types = rows.map((r) => norm(r.type || ''))
  const results = selected.map((sel) => {
    const n = norm(sel)
    return types.some((t) => t.includes(n) || n.includes(t) || fuzzyWordsOverlap(t, n))
  })
  return mode === 'and' ? results.every(Boolean) : results.some(Boolean)
}

function phaseKey(label) {
  const n = norm(label)
  if (n.includes('not applicable')) return 'na'
  const m = n.match(/phase[-\s]*([0-4])/)
  return m ? `p${m[1]}` : n
}

function phaseMatches(stored, selected, mode) {
  if (!selected.length) return true
  const sk = phaseKey(stored || '')
  const results = selected.map((ph) => phaseKey(ph) === sk)
  return mode === 'and' ? results.every(Boolean) : results.some(Boolean)
}

const UNIT_TO_DAYS = {
  'day(s)': 1,
  'week(s)': 7,
  'month(s)': 30.44,
  'year(s)': 365.25
}

function toDays(value, unitLabel) {
  const u = norm(unitLabel)
  const key = Object.keys(UNIT_TO_DAYS).find((k) => norm(k) === u || u.includes(k.replace(/[()]/g, '')))
  const mult = key ? UNIT_TO_DAYS[key] : 365.25
  const n = Number(value)
  if (Number.isNaN(n)) return null
  return n * mult
}

function ageRangeOverlap(data, f) {
  const hasMin = f.minAge !== '' && f.minAge != null && f.minAgeUnit
  const hasMax = f.maxAge !== '' && f.maxAge != null && f.maxAgeUnit
  if (!hasMin && !hasMax) return true

  const tMin = toDays(data.minAge, data.minAgeUnit || 'Years')
  const tMax = toDays(data.maxAge, data.maxAgeUnit || 'Years')
  if (tMin == null || tMax == null) return true

  const lo = Math.min(tMin, tMax)
  const hi = Math.max(tMin, tMax)

  let fLo = 0
  let fHi = Infinity
  if (hasMin) {
    const v = toDays(f.minAge, f.minAgeUnit)
    if (v != null) fLo = v
  }
  if (hasMax) {
    const v = toDays(f.maxAge, f.maxAgeUnit)
    if (v != null) fHi = v
  }
  if (fLo > fHi) [fLo, fHi] = [fHi, fLo]

  return !(hi < fLo || fHi < lo)
}

function interventionTextMatch(data, q) {
  if (!q.trim()) return true
  const n = norm(q)
  const parts = []
  const ints = Array.isArray(data.interventions) ? data.interventions : []
  ints.forEach((i) => {
    parts.push(i.name, i.description, i.dose, i.duration)
  })
  const blob = norm(parts.join(' '))
  return blob.includes(n) || n.split(/\s+/).every((w) => w.length < 2 || blob.includes(w))
}

function interventionCodeMatch(data, q) {
  if (!q.trim()) return true
  const n = norm(q)
  const codes = [data.secondaryIds, data.acronym, data.publicTitle].map(norm).join(' ')
  return codes.includes(n) || codes.split(/[\s,;]+/).some((c) => c && (c.includes(n) || n.includes(c)))
}

function dateInRange(iso, from, to) {
  if (!from && !to) return true
  if (!iso) return false
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return false
  if (from) {
    const f = new Date(from)
    f.setHours(0, 0, 0, 0)
    if (t < f.getTime()) return false
  }
  if (to) {
    const x = new Date(to)
    x.setHours(23, 59, 59, 999)
    if (t > x.getTime()) return false
  }
  return true
}

function countriesMatch(data, q) {
  if (!q.trim()) return true
  const n = norm(q)
  const centres = Array.isArray(data.recruitmentCentres) ? data.recruitmentCentres : []
  const countries = centres.map((c) => norm(c.country))
  return countries.some((c) => c.includes(n) || n.includes(c))
}

function findPiContact(data) {
  const persons = Array.isArray(data.contactPersons) ? data.contactPersons : []
  const pi = persons.find((p) => norm(p.role || '').includes('principal investigator'))
  if (pi) return pi
  if (data.contactRole && norm(data.contactRole).includes('principal')) {
    return {
      firstName: data.contactFirstName,
      lastName: data.contactLastName,
      country: data.contactCountry
    }
  }
  return null
}

function piCountryMatch(data, q) {
  if (!q.trim()) return true
  const n = norm(q)
  const pi = findPiContact(data)
  if (!pi || !pi.country) return false
  return norm(pi.country).includes(n) || n.includes(norm(pi.country))
}

function piNameMatch(data, q) {
  if (!q.trim()) return true
  const n = norm(q)
  const pi = findPiContact(data)
  if (!pi) return false
  const name = norm(`${pi.firstName || ''} ${pi.lastName || ''}`)
  return name.includes(n) || n.split(/\s+/).every((w) => w.length < 2 || name.includes(w))
}

export function getDefaultFilters() {
  return {
    interventionText: '',
    interventionCode: '',
    interventionTextCodeMode: 'and',
    purposes: [],
    purposeMode: 'or',
    allocation: [],
    allocationMode: 'or',
    recruitment: [],
    recruitmentMode: 'or',
    disease: [],
    diseaseMode: 'or',
    gender: [],
    genderMode: 'or',
    minAge: '',
    minAgeUnit: 'Year(s)',
    maxAge: '',
    maxAgeUnit: 'Year(s)',
    ethics: [],
    ethicsMode: 'or',
    registrationDateFrom: '',
    registrationDateTo: '',
    trialStartDateFrom: '',
    trialStartDateTo: '',
    countriesRecruitment: '',
    sponsorNature: [],
    sponsorNatureMode: 'or',
    fundingSourceType: [],
    fundingSourceTypeMode: 'or',
    countryPI: '',
    piName: '',
    phase: [],
    phaseMode: 'or'
  }
}

export function trialMatchesFilters(trial, f) {
  const d = trial.data || {}

  const textOk = interventionTextMatch(d, f.interventionText)
  const codeOk = interventionCodeMatch(d, f.interventionCode)
  let icOk = true
  if (f.interventionText.trim() && f.interventionCode.trim()) {
    icOk = f.interventionTextCodeMode === 'and' ? textOk && codeOk : textOk || codeOk
  } else if (f.interventionText.trim()) icOk = textOk
  else if (f.interventionCode.trim()) icOk = codeOk

  if (!icOk) return false
  if (!purposeMatches(d.purpose, f.purposes, f.purposeMode)) return false
  if (!allocationMatches(d.allocation, f.allocation, f.allocationMode)) return false
  if (!recruitmentMulti(d.recruitmentStatus, f.recruitment, f.recruitmentMode)) return false
  if (!diseaseMulti(d.healthConditions, f.disease, f.diseaseMode)) return false
  if (!genderMatches(d.sex, f.gender, f.genderMode)) return false
  if (!ageRangeOverlap(d, f)) return false
  if (!ethicsMatches(trial, f.ethics, f.ethicsMode)) return false

  const regDate = trial.submitted_at || trial.created_at
  if (!dateInRange(regDate, f.registrationDateFrom, f.registrationDateTo)) return false
  const start = d.actualStartDate || d.anticipatedStartDate
  if (!dateInRange(start, f.trialStartDateFrom, f.trialStartDateTo)) return false

  if (!countriesMatch(d, f.countriesRecruitment)) return false
  if (!sponsorNatureMatches(d, f.sponsorNature, f.sponsorNatureMode)) return false
  if (!fundingTypeMatches(d, f.fundingSourceType, f.fundingSourceTypeMode)) return false
  if (!piCountryMatch(d, f.countryPI)) return false
  if (!piNameMatch(d, f.piName)) return false
  if (!phaseMatches(d.trialPhase, f.phase, f.phaseMode)) return false

  return true
}

export function filterApprovedTrials(trials, filters) {
  return trials.filter((t) => trialMatchesFilters(t, filters))
}
