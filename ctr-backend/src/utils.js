export function cleanEmail(value) {
  return String(value || '').trim().toLowerCase()
}

export function publicUser(row) {
  return {
    id: row.id,
    role: row.role,
    email: row.email,
    mustChangePassword: !!row.must_change_password,
    createdAt: row.created_at,
    profile: row.profile || {},
    registrationStatus: row.registration_status || 'approved'
  }
}

export function randomTempPassword() {
  const part = Math.random().toString(36).slice(2, 8)
  return `CTR@${part}9`
}
