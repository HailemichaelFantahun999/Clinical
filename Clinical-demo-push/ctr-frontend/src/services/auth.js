import {
  changeUserPassword,
  clearSession,
  createResearcher,
  createReviewer,
  findUserById,
  getSession,
  listUsers,
  resetReviewerPassword,
  setSession,
  updateUserProfile as updateStoredUserProfile
} from './storage'

function publicUser(user) {
  if (!user) return null
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    mustChangePassword: Boolean(user.mustChangePassword),
    profile: user.profile || {}
  }
}

export function getSessionState() {
  return getSession()
}

export function setSessionState(session) {
  setSession(session)
}

export function clearSessionState() {
  clearSession()
}

export async function signup({ email, password }) {
  createResearcher({ email, password })
  return { message: 'Account created. You can now enter the researcher demo workspace.' }
}

export async function login({ email, password, role }) {
  const users = listUsers()
  let user = null

  if (role) {
    user = users.find((item) => item.role === role) || null
  } else {
    const normalized = String(email || '').trim().toLowerCase()
    user = users.find((item) => String(item.email || '').toLowerCase() === normalized) || null
  }

  if (!user) {
    throw new Error('Use the demo workspace buttons or sign up as a researcher.')
  }

  if (!role && String(password || '').trim().length === 0) {
    throw new Error('Password is required.')
  }

  setSession({ userId: user.id })
  return { ok: true, user: publicUser(user) }
}

export function logout() {
  clearSession()
}

export async function getCurrentUser() {
  const session = getSession()
  if (!session?.userId) return null
  return publicUser(findUserById(session.userId))
}

export async function changePassword({ currentPassword, newPassword }) {
  const session = getSession()
  if (!session?.userId) throw new Error('You must be signed in.')
  const updated = changeUserPassword({ userId: session.userId, currentPassword, newPassword })
  return publicUser(updated)
}

export async function adminCreateReviewer({ email }) {
  return createReviewer({ email })
}

export async function adminResetReviewerPassword({ reviewerEmail }) {
  return resetReviewerPassword({ reviewerEmail })
}

export async function adminListUsers() {
  return listUsers().map(publicUser)
}

export async function adminListReviewers() {
  return listUsers().filter((user) => user.role === 'reviewer').map(publicUser)
}

export async function updateUserProfile({ profile }) {
  const session = getSession()
  if (!session?.userId) throw new Error('You must be signed in.')
  const updated = updateStoredUserProfile({ userId: session.userId, profile })
  return publicUser(updated)
}
