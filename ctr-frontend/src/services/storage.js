const KEY = 'ctr.mockdb.v2'
const memoryStore = new Map()

function safeGetItem(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return memoryStore.has(key) ? memoryStore.get(key) : null
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    memoryStore.set(key, value)
  }
}

function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    memoryStore.delete(key)
  }
}

function nowIso() {
  return new Date().toISOString()
}

function ensureDemoUsers(db) {
  if (!db.users) db.users = []

  const DEMO_PASSWORD = 'Password@123'
  const demos = [
    { role: 'admin', email: 'admin@ctr.local', profile: { fullName: 'System Admin' } },
    { role: 'reviewer', email: 'reviewer@ctr.local', profile: { fullName: 'System Reviewer' } },
    { role: 'user', email: 'user@ctr.local', profile: { fullName: 'System User' } }
  ]

  let changed = false
  for (const d of demos) {
    const email = String(d.email).toLowerCase()
    const existing = db.users.find((u) => String(u.email || '').toLowerCase() === email)

    if (!existing) {
      db.users.push({
        id: uid(),
        role: d.role,
        email: d.email,
        password: DEMO_PASSWORD,
        mustChangePassword: false,
        createdAt: nowIso(),
        profile: d.profile || {}
      })
      changed = true
      continue
    }

    // Keep demo accounts always accessible (fixes cases where old data changed role/password).
    if (existing.role !== d.role) {
      existing.role = d.role
      changed = true
    }
    if (existing.password !== DEMO_PASSWORD) {
      existing.password = DEMO_PASSWORD
      changed = true
    }
    if (existing.mustChangePassword) {
      existing.mustChangePassword = false
      changed = true
    }
    if (!existing.createdAt) {
      existing.createdAt = nowIso()
      changed = true
    }
    if (d.profile && (!existing.profile || Object.keys(existing.profile).length === 0)) {
      existing.profile = d.profile
      changed = true
    }
  }

  if (changed) saveDb(db)
  return db
}

export function loadDb() {
  const raw = safeGetItem(KEY)
  if (!raw) return seedDb()
  try {
    const db = JSON.parse(raw)
    if (!db?.users || !db?.trials) return seedDb()
    return ensureDemoUsers(db)
  } catch {
    return seedDb()
  }
}

export function saveDb(db) {
  safeSetItem(KEY, JSON.stringify(db))
}

export function resetDb() {
  safeRemoveItem(KEY)
  return seedDb()
}

function seedDb() {
  const db = {
    users: [],
    trials: [],
    passwordResets: []
  }

  db.users.push({
    id: uid(),
    role: 'admin',
    email: 'admin@ctr.local',
    password: 'Password@123',
    mustChangePassword: false,
    createdAt: nowIso(),
    profile: {
      fullName: 'System Admin'
    }
  })

  db.users.push({
    id: uid(),
    role: 'reviewer',
    email: 'reviewer@ctr.local',
    password: 'Password@123',
    mustChangePassword: false,
    createdAt: nowIso(),
    profile: {
      fullName: 'System Reviewer'
    }
  })

  db.users.push({
    id: uid(),
    role: 'user',
    email: 'user@ctr.local',
    password: 'Password@123',
    mustChangePassword: false,
    createdAt: nowIso(),
    profile: {
      fullName: 'System User'
    }
  })

  saveDb(db)
  return db
}

export function uid() {
  return crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())
}

