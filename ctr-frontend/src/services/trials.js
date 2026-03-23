import { api } from './api'

function errorMessage(err, fallback = 'Request failed.') {
  return err?.response?.data?.message || err?.message || fallback
}

export async function createTrial({ payload }) {
  try {
    const { data } = await api.post('/api/trials', { payload })
    return data.trial
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to create trial.'))
  }
}

export async function listMyTrials() {
  try {
    const { data } = await api.get('/api/trials/me')
    return data.trials || []
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to load trials.'))
  }
}

export async function getTrialById({ trialId }) {
  try {
    const { data } = await api.get(`/api/trials/${encodeURIComponent(trialId)}`)
    return data.trial
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to load trial.'))
  }
}

export async function reviewerListTrials({ status }) {
  try {
    const q = status ? `?status=${encodeURIComponent(status)}` : ''
    const { data } = await api.get(`/api/reviewer/trials${q}`)
    return data.trials || []
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to load reviewer trials.'))
  }
}

export async function reviewerApprove({ trialId }) {
  try {
    const { data } = await api.post(`/api/reviewer/trials/${encodeURIComponent(trialId)}/approve`)
    return data.trial
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to approve trial.'))
  }
}

export async function reviewerReject({ trialId, reason }) {
  try {
    const { data } = await api.post(`/api/reviewer/trials/${encodeURIComponent(trialId)}/reject`, { reason })
    return data.trial
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to reject trial.'))
  }
}

export async function userResubmit({ trialId, payload }) {
  try {
    const { data } = await api.post(`/api/trials/${encodeURIComponent(trialId)}/resubmit`, { payload })
    return data.trial
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to resubmit trial.'))
  }
}

export async function listPublicApprovedTrials() {
  try {
    const { data } = await api.get('/api/trials/public/approved')
    return data.trials || []
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to load approved trials.'))
  }
}

export async function adminDashboardStats() {
  try {
    const { data } = await api.get('/api/admin/dashboard')
    return data
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to load dashboard stats.'))
  }
}
