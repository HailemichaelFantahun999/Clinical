const DB_KEY = 'ectr.demo.db.v1'
const SESSION_KEY = 'ectr.demo.session.v1'
const memoryStore = new Map()

function safeGetItem(key) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return memoryStore.has(key) ? memoryStore.get(key) : null
  }
}

function safeSetItem(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    memoryStore.set(key, value)
  }
}

function safeRemoveItem(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    memoryStore.delete(key)
  }
}

function nowIso() {
  return new Date().toISOString()
}

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

function uid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function buildUsers() {
  const adminId = uid()
  const reviewerId = uid()
  const researcherId = uid()
  const reviewerTwoId = uid()
  const researcherTwoId = uid()

  return {
    adminId,
    reviewerId,
    researcherId,
    reviewerTwoId,
    researcherTwoId,
    users: [
      {
        id: adminId,
        role: 'admin',
        email: 'admin@demo.local',
        password: 'demo',
        mustChangePassword: false,
        createdAt: daysAgo(180),
        profile: { fullName: 'Demo System Administrator' }
      },
      {
        id: reviewerId,
        role: 'reviewer',
        email: 'reviewer@demo.local',
        password: 'demo',
        mustChangePassword: false,
        createdAt: daysAgo(170),
        profile: { fullName: 'Demo Lead Reviewer' }
      },
      {
        id: reviewerTwoId,
        role: 'reviewer',
        email: 'quality@demo.local',
        password: 'demo',
        mustChangePassword: false,
        createdAt: daysAgo(168),
        profile: { fullName: 'Quality Review Officer' }
      },
      {
        id: researcherId,
        role: 'user',
        email: 'researcher@demo.local',
        password: 'demo',
        mustChangePassword: false,
        createdAt: daysAgo(165),
        profile: {
          fullName: 'Dr Hana Tesfaye',
          institution: 'Addis Ababa University College of Health Sciences',
          phone: '+251 911 222 333'
        }
      },
      {
        id: researcherTwoId,
        role: 'user',
        email: 'coordinator@demo.local',
        password: 'demo',
        mustChangePassword: false,
        createdAt: daysAgo(150),
        profile: {
          fullName: 'Dr Samuel Bekele',
          institution: 'St. Paul Hospital Millennium Medical College',
          phone: '+251 922 555 000'
        }
      }
    ]
  }
}

function makeTrial(overrides) {
  return {
    id: uid(),
    status: 'pending',
    userId: '',
    assignedReviewerId: '',
    reviewedBy: '',
    reviewerComment: '',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    submittedAt: nowIso(),
    approvedAt: null,
    rejectedAt: null,
    data: {},
    ...overrides
  }
}

function seedDb() {
  const { adminId, reviewerId, reviewerTwoId, researcherId, researcherTwoId, users } = buildUsers()

  const trials = [
    makeTrial({
      status: 'approved',
      userId: researcherId,
      assignedReviewerId: reviewerId,
      reviewedBy: reviewerId,
      reviewerComment: '',
      createdAt: daysAgo(70),
      updatedAt: daysAgo(40),
      submittedAt: daysAgo(68),
      approvedAt: daysAgo(40),
      data: {
        title: 'Community-based hypertension screening and lifestyle support trial in Addis Ababa',
        briefSummary: 'A pragmatic trial evaluating blood-pressure screening, referral uptake, and structured lifestyle support delivered through urban community health teams.',
        trialDesign: 'Randomized Controlled Trial',
        trialPhase: 'Not Applicable',
        diseases: 'Hypertension, Cardiovascular disease prevention',
        anticipatedStartDate: daysAgo(120),
        completionDate: daysFromNow(120),
        recruitmentStatus: 'Recruiting',
        contactTitle: 'Dr',
        contactFirstName: 'Hana',
        contactLastName: 'Tesfaye',
        contactInstitution: 'Addis Ababa University College of Health Sciences',
        contactEmail: 'researcher@demo.local',
        recruitmentCentreCity: 'Addis Ababa',
        targetParticipants: '420'
      }
    }),
    makeTrial({
      status: 'approved',
      userId: researcherTwoId,
      assignedReviewerId: reviewerTwoId,
      reviewedBy: reviewerTwoId,
      reviewerComment: '',
      createdAt: daysAgo(95),
      updatedAt: daysAgo(28),
      submittedAt: daysAgo(92),
      approvedAt: daysAgo(28),
      data: {
        title: 'Maternal anemia treatment adherence study across public antenatal clinics',
        briefSummary: 'A multicentre implementation study measuring adherence to iron supplementation counseling, refill attendance, and maternal follow-up outcomes.',
        trialDesign: 'Observational Cohort',
        trialPhase: 'Not Applicable',
        diseases: 'Maternal anemia, Pregnancy complications',
        anticipatedStartDate: daysAgo(160),
        completionDate: daysFromNow(90),
        recruitmentStatus: 'Active, Not Recruiting',
        contactTitle: 'Dr',
        contactFirstName: 'Samuel',
        contactLastName: 'Bekele',
        contactInstitution: 'St. Paul Hospital Millennium Medical College',
        contactEmail: 'coordinator@demo.local',
        recruitmentCentreCity: 'Addis Ababa',
        targetParticipants: '300'
      }
    }),
    makeTrial({
      status: 'approved',
      userId: researcherId,
      assignedReviewerId: reviewerId,
      reviewedBy: reviewerId,
      reviewerComment: '',
      createdAt: daysAgo(130),
      updatedAt: daysAgo(20),
      submittedAt: daysAgo(126),
      approvedAt: daysAgo(20),
      data: {
        title: 'Type 2 diabetes digital follow-up and medication reminder pilot',
        briefSummary: 'A follow-up pilot exploring the effect of mobile reminders and remote nurse check-ins on medication continuation and glycaemic monitoring.',
        trialDesign: 'Controlled Clinical Trial',
        trialPhase: 'Not Applicable',
        diseases: 'Type 2 diabetes mellitus',
        anticipatedStartDate: daysAgo(180),
        completionDate: daysFromNow(150),
        recruitmentStatus: 'Recruiting',
        contactTitle: 'Dr',
        contactFirstName: 'Hana',
        contactLastName: 'Tesfaye',
        contactInstitution: 'Addis Ababa University College of Health Sciences',
        contactEmail: 'researcher@demo.local',
        recruitmentCentreCity: 'Bahir Dar',
        targetParticipants: '180'
      }
    }),
    makeTrial({
      status: 'pending',
      userId: researcherId,
      assignedReviewerId: reviewerId,
      reviewedBy: '',
      reviewerComment: '',
      createdAt: daysAgo(7),
      updatedAt: daysAgo(2),
      submittedAt: daysAgo(2),
      data: {
        title: 'Tuberculosis contact tracing support pilot in peri-urban districts',
        briefSummary: 'A field pilot assessing trial procedures for contact tracing support, adherence counseling, and visit completion among household contacts.',
        trialDesign: 'Controlled Clinical Trial',
        trialPhase: 'Phase 2',
        diseases: 'Tuberculosis',
        anticipatedStartDate: daysFromNow(14),
        completionDate: daysFromNow(260),
        recruitmentStatus: 'Not Yet Recruiting',
        contactTitle: 'Dr',
        contactFirstName: 'Hana',
        contactLastName: 'Tesfaye',
        contactInstitution: 'Addis Ababa University College of Health Sciences',
        contactEmail: 'researcher@demo.local',
        recruitmentCentreCity: 'Adama',
        targetParticipants: '220'
      }
    }),
    makeTrial({
      status: 'rejected',
      userId: researcherId,
      assignedReviewerId: reviewerId,
      reviewedBy: reviewerId,
      reviewerComment: 'Please clarify the primary endpoint timing, update the recruitment centre address, and add a more detailed informed-consent plan.',
      createdAt: daysAgo(18),
      updatedAt: daysAgo(6),
      submittedAt: daysAgo(16),
      rejectedAt: daysAgo(6),
      data: {
        title: 'Neonatal sepsis rapid response bundle evaluation',
        briefSummary: 'An implementation trial assessing protocol adherence and early response timing for neonatal sepsis management in referral facilities.',
        trialDesign: 'Randomized Controlled Trial',
        trialPhase: 'Phase 3',
        diseases: 'Neonatal sepsis',
        anticipatedStartDate: daysFromNow(35),
        completionDate: daysFromNow(320),
        recruitmentStatus: 'Not Yet Recruiting',
        contactTitle: 'Dr',
        contactFirstName: 'Hana',
        contactLastName: 'Tesfaye',
        contactInstitution: 'Addis Ababa University College of Health Sciences',
        contactEmail: 'researcher@demo.local',
        recruitmentCentreCity: 'Jimma',
        targetParticipants: '240'
      }
    }),
    makeTrial({
      status: 'draft',
      userId: researcherId,
      assignedReviewerId: '',
      reviewedBy: '',
      reviewerComment: '',
      createdAt: daysAgo(4),
      updatedAt: daysAgo(1),
      submittedAt: null,
      data: {
        title: 'Draft malaria prevention adherence registry entry',
        briefSummary: 'Draft protocol information for a malaria prevention adherence project.',
        trialDesign: 'Observational',
        trialPhase: 'Not Applicable',
        diseases: 'Malaria',
        anticipatedStartDate: daysFromNow(45),
        completionDate: daysFromNow(365),
        recruitmentStatus: 'Not Yet Recruiting',
        contactTitle: 'Dr',
        contactFirstName: 'Hana',
        contactLastName: 'Tesfaye',
        contactInstitution: 'Addis Ababa University College of Health Sciences',
        contactEmail: 'researcher@demo.local',
        recruitmentCentreCity: 'Hawassa',
        targetParticipants: '160'
      }
    })
  ]

  const db = { users, trials, passwordResets: [] }
  saveDb(db)
  return db
}

export function loadDb() {
  const raw = safeGetItem(DB_KEY)
  if (!raw) return seedDb()
  try {
    const parsed = JSON.parse(raw)
    if (!parsed?.users || !parsed?.trials) return seedDb()
    return parsed
  } catch {
    return seedDb()
  }
}

export function saveDb(db) {
  safeSetItem(DB_KEY, JSON.stringify(db))
}

export function resetDb() {
  safeRemoveItem(DB_KEY)
  safeRemoveItem(SESSION_KEY)
  return seedDb()
}

export function getSession() {
  const raw = safeGetItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setSession(session) {
  safeSetItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  safeRemoveItem(SESSION_KEY)
}

export function listUsers() {
  return [...loadDb().users]
}

export function findUserById(userId) {
  return loadDb().users.find((user) => user.id === userId) || null
}

export function createResearcher({ email, password }) {
  const db = loadDb()
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) throw new Error('Email is required.')
  if (db.users.some((user) => String(user.email || '').toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email already exists.')
  }

  const user = {
    id: uid(),
    role: 'user',
    email: normalizedEmail,
    password: String(password || 'demo'),
    mustChangePassword: false,
    createdAt: nowIso(),
    profile: { fullName: '', institution: '', phone: '' }
  }
  db.users.push(user)
  saveDb(db)
  return user
}

export function createReviewer({ email }) {
  const db = loadDb()
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) throw new Error('Reviewer email is required.')
  if (db.users.some((user) => String(user.email || '').toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email already exists.')
  }
  const tempPassword = 'demo-reviewer'
  const reviewer = {
    id: uid(),
    role: 'reviewer',
    email: normalizedEmail,
    password: tempPassword,
    mustChangePassword: true,
    createdAt: nowIso(),
    profile: { fullName: 'New Reviewer' }
  }
  db.users.push(reviewer)
  saveDb(db)
  return { reviewer, tempPassword }
}

export function resetReviewerPassword({ reviewerEmail }) {
  const db = loadDb()
  const reviewer = db.users.find(
    (user) => user.role === 'reviewer' && String(user.email || '').toLowerCase() === String(reviewerEmail || '').trim().toLowerCase()
  )
  if (!reviewer) throw new Error('Reviewer not found.')
  reviewer.password = 'demo-reset'
  reviewer.mustChangePassword = true
  saveDb(db)
  return { tempPassword: reviewer.password }
}

export function updateUserProfile({ userId, profile }) {
  const db = loadDb()
  const user = db.users.find((item) => item.id === userId)
  if (!user) throw new Error('User not found.')
  user.profile = { ...(user.profile || {}), ...(profile || {}) }
  saveDb(db)
  return user
}

export function changeUserPassword({ userId, currentPassword, newPassword }) {
  const db = loadDb()
  const user = db.users.find((item) => item.id === userId)
  if (!user) throw new Error('Account not found.')
  if (String(currentPassword || '') !== String(user.password || '')) {
    throw new Error('Current password is incorrect.')
  }
  user.password = String(newPassword || '')
  user.mustChangePassword = false
  saveDb(db)
  return user
}

export function createTrialRecord({ userId, payload }) {
  const db = loadDb()
  const reviewer = db.users.find((user) => user.role === 'reviewer')
  const status = payload.status === 'draft' ? 'draft' : 'pending'
  const trial = makeTrial({
    userId,
    status,
    assignedReviewerId: status === 'pending' ? reviewer?.id || '' : '',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    submittedAt: status === 'pending' ? nowIso() : null,
    data: { ...(payload || {}) }
  })
  db.trials.unshift(trial)
  saveDb(db)
  return trial
}

export function listTrialsForUser(userId) {
  return loadDb().trials.filter((trial) => trial.userId === userId)
}

export function getTrial(trialId) {
  return loadDb().trials.find((trial) => trial.id === trialId) || null
}

export function listReviewerTrials(reviewerId, status = '') {
  return loadDb().trials.filter((trial) => {
    const belongs = trial.assignedReviewerId === reviewerId || trial.reviewedBy === reviewerId
    if (!belongs) return false
    if (!status) return true
    return trial.status === status
  })
}

export function approveTrial({ reviewerId, trialId }) {
  const db = loadDb()
  const trial = db.trials.find((item) => item.id === trialId)
  if (!trial) throw new Error('Trial not found.')
  trial.status = 'approved'
  trial.reviewedBy = reviewerId
  trial.assignedReviewerId = reviewerId
  trial.reviewerComment = ''
  trial.updatedAt = nowIso()
  trial.approvedAt = nowIso()
  saveDb(db)
  return trial
}

export function rejectTrial({ reviewerId, trialId, reason }) {
  const db = loadDb()
  const trial = db.trials.find((item) => item.id === trialId)
  if (!trial) throw new Error('Trial not found.')
  trial.status = 'rejected'
  trial.reviewedBy = reviewerId
  trial.assignedReviewerId = reviewerId
  trial.reviewerComment = String(reason || '').trim()
  trial.updatedAt = nowIso()
  trial.rejectedAt = nowIso()
  saveDb(db)
  return trial
}

export function resubmitTrial({ userId, trialId, payload }) {
  const db = loadDb()
  const reviewer = db.users.find((user) => user.role === 'reviewer')
  const trial = db.trials.find((item) => item.id === trialId && item.userId === userId)
  if (!trial) throw new Error('Trial not found.')
  trial.data = { ...(trial.data || {}), ...(payload || {}) }
  trial.status = 'pending'
  trial.assignedReviewerId = reviewer?.id || ''
  trial.reviewedBy = ''
  trial.reviewerComment = ''
  trial.updatedAt = nowIso()
  trial.submittedAt = nowIso()
  saveDb(db)
  return trial
}

export function listPublicTrials() {
  return loadDb().trials.filter((trial) => trial.status === 'approved')
}

export function getAdminDashboard() {
  const db = loadDb()
  const users = db.users
  const trials = db.trials
  return {
    stats: {
      total_trials: trials.length,
      pending_trials: trials.filter((trial) => trial.status === 'pending').length
    },
    recentTrials: [...trials]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5),
    users
  }
}
