import {
  approveTrial,
  createTrialRecord,
  getAdminDashboard,
  getSession,
  getTrial,
  listPublicTrials,
  listReviewerTrials,
  listTrialsForUser,
  rejectTrial,
  resubmitTrial
} from './storage'

function requireUserId() {
  const session = getSession()
  if (!session?.userId) throw new Error('You must be signed in.')
  return session.userId
}

export async function createTrial({ payload }) {
  return createTrialRecord({ userId: requireUserId(), payload })
}

export async function listMyTrials() {
  return listTrialsForUser(requireUserId())
}

export async function getTrialById({ trialId }) {
  const trial = getTrial(trialId)
  if (!trial) throw new Error('Trial not found.')
  return trial
}

export async function reviewerListTrials({ status }) {
  return listReviewerTrials(requireUserId(), status || '')
}

export async function reviewerApprove({ trialId }) {
  return approveTrial({ reviewerId: requireUserId(), trialId })
}

export async function reviewerReject({ trialId, reason }) {
  return rejectTrial({ reviewerId: requireUserId(), trialId, reason })
}

export async function userResubmit({ trialId, payload }) {
  return resubmitTrial({ userId: requireUserId(), trialId, payload })
}

export async function listPublicApprovedTrials() {
  return listPublicTrials()
}

export async function adminDashboardStats() {
  return getAdminDashboard()
}
