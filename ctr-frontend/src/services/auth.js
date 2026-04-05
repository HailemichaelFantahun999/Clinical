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
  try {
    const { data } = await api.post('/api/auth/signup', { email, password })
    return { ok: data?.ok, message: data?.message }
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to sign up.'))
  }
}

export async function login({ email, password }) {
  // Offline Vercel Mock Logic: Let it pass for ANY login attempt!
  const cleanEmail = String(email || '').toLowerCase().trim();
  
  let role = 'user';
  if (cleanEmail.includes('admin')) role = 'admin';
  else if (cleanEmail.includes('review')) role = 'reviewer';
  
  const mockToken = `mock-token-${role}`;
  setApiToken(mockToken);
  
  localStorage.setItem('mock_user_info', JSON.stringify({
    id: `mock-id-${role}`,
    email: cleanEmail || `${role}@ctr.local`,
    role: role,
    registrationStatus: 'approved',
    profile: { fullName: `Demo ${role}`, institution: 'Ethiopian Clinical Trial Registry' }
  }));
  return { ok: true };
}

export function logout() {
  clearSession()
}

export async function getCurrentUser() {
  const token = getApiToken()
  if (!token) return null

  // Demo mock fallback
  if (token.startsWith('mock-token-')) {
    const mockData = localStorage.getItem('mock_user_info');
    if (mockData) {
      return JSON.parse(mockData);
    }
  }

  try {
    const { data } = await api.get('/api/auth/me')
    return data.user
  } catch {
    clearSession()
    return null
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

export async function adminReviewRegistration({ userId, action }) {
  try {
    const { data } = await api.post(`/api/admin/users/${encodeURIComponent(userId)}/registration`, { action })
    return data.user
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to update registration.'))
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
