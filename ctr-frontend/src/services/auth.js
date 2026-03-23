import { api, getApiToken, setApiToken } from './api'

function errorMessage(err, fallback = 'Request failed.') {
  return err?.response?.data?.message || err?.message || fallback
}

export function getSession() {
  return getApiToken() ? { token: getApiToken() } : null
}

export function setSession(session) {
  setApiToken(session?.token || '')
}

export function clearSession() {
  setApiToken('')
}

export async function signup({ email, password }) {
  // Mock signup: always succeeds
  return { message: 'Signup successful. Please login.' }
}

export async function login({ email, password }) {
  // Mock login: determines role from the email (e.g., admin@test.com = admin)
  setApiToken('mock-token-12345')
  const role = email.includes('admin') ? 'admin' : (email.includes('reviewer') ? 'reviewer' : 'user')
  localStorage.setItem('mock_user_role', role)
  return { ok: true }
}

export function logout() {
  clearSession()
}

export async function getCurrentUser() {
  const token = getApiToken()
  if (!token) return null
  
  // Mock user profile retrieval based on the role stored at login
  const role = localStorage.getItem('mock_user_role') || 'user'
  return {
    id: `mock-${role}-id`,
    name: 'Demo ' + role.charAt(0).toUpperCase() + role.slice(1),
    email: `demo@${role}.com`,
    role: role,
    profile: {}
  }
}

export async function changePassword({ currentPassword, newPassword }) {
  try {
    const { data } = await api.post('/api/auth/change-password', { currentPassword, newPassword })
    return data
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to change password.'))
  }
}

export async function adminCreateReviewer({ email }) {
  try {
    const { data } = await api.post('/api/admin/reviewers', { email })
    return data
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to create reviewer.'))
  }
}

export async function adminResetReviewerPassword({ reviewerEmail }) {
  try {
    const { data } = await api.post('/api/admin/reviewers/reset-password', { reviewerEmail })
    return data
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to reset reviewer password.'))
  }
}

export async function adminListUsers() {
  try {
    const { data } = await api.get('/api/admin/users')
    return data.users || []
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to list users.'))
  }
}

export async function adminListReviewers() {
  try {
    const { data } = await api.get('/api/admin/reviewers')
    return data.reviewers || []
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to list reviewers.'))
  }
}

export async function updateUserProfile({ profile }) {
  try {
    const { data } = await api.patch('/api/users/me/profile', { profile })
    return data.user
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to update profile.'))
  }
}
