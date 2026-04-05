import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { query } from './db.js'
import { requireAuth, requireRole, signToken } from './auth.js'
import { cleanEmail, publicUser, randomTempPassword } from './utils.js'
import { searchIcd } from './icd.js'

dotenv.config()

const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  })
)
app.use(express.json({ limit: '50mb' }))

function isStoredUpload(value) {
  return !!(
    value &&
    typeof value === 'object' &&
    typeof value.name === 'string' &&
    typeof value.contentBase64 === 'string' &&
    value.contentBase64
  )
}

function toPublicUpload(value) {
  if (isStoredUpload(value)) {
    return {
      name: value.name,
      type: value.type || 'application/octet-stream',
      size: value.size || 0,
      downloadable: true
    }
  }
  return value
}

function sanitizeTrialDataForPublic(data) {
  const next = { ...(data || {}) }
  next.ethicsApprovals = Array.isArray(next.ethicsApprovals)
    ? next.ethicsApprovals.map((item) => ({
        ...item,
        document: toPublicUpload(item?.document)
      }))
    : []
  next.resultsSummaryDocs = Array.isArray(next.resultsSummaryDocs)
    ? next.resultsSummaryDocs.map((item) => toPublicUpload(item))
    : []
  return next
}

function sanitizeTrialForPublic(trial) {
  return {
    ...trial,
    data: sanitizeTrialDataForPublic(trial?.data || {})
  }
}

function getApprovedTrialUpload(trial, category, index) {
  const data = trial?.data || {}
  const idx = Number(index)
  if (!Number.isInteger(idx) || idx < 0) return null

  if (category === 'ethics-approvals') {
    const items = Array.isArray(data.ethicsApprovals) ? data.ethicsApprovals : []
    return items[idx]?.document || null
  }

  if (category === 'results-summary') {
    const items = Array.isArray(data.resultsSummaryDocs) ? data.resultsSummaryDocs : []
    return items[idx] || null
  }

  return null
}

app.get('/api/health', async (_req, res) => {
  await query('SELECT 1')
  res.json({ ok: true })
})

app.get('/api/icd/search', requireAuth, async (req, res) => {
  const q = String(req.query.q || '').trim()
  if (q.length < 2) return res.json({ results: [] })

  const results = await searchIcd(q)
  return res.json({ results })
})


app.post('/api/auth/signup', async (req, res) => {
  const email = cleanEmail(req.body?.email)
  const password = String(req.body?.password || '')
  if (!email) return res.status(400).json({ message: 'Email is required.' })
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' })

  const existing = await query('SELECT id FROM users WHERE email = $1', [email])
  if (existing.rowCount) return res.status(409).json({ message: 'An account with this email already exists.' })

  const hash = await bcrypt.hash(password, 10)
  await query(
    `INSERT INTO users (role, email, password_hash, must_change_password, profile, registration_status)
     VALUES ('user', $1, $2, false, '{}'::jsonb, 'pending')`,
    [email, hash]
  )
  return res.json({ ok: true, message: 'Registration submitted. An administrator must approve your account before you can sign in.' })
})

app.post('/api/auth/login', async (req, res) => {
  const email = cleanEmail(req.body?.email)
  const password = String(req.body?.password || '')
  const result = await query('SELECT * FROM users WHERE email = $1', [email])
  const user = result.rows[0]
  if (!user) return res.status(401).json({ message: 'Invalid email or password.' })

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ message: 'Invalid email or password.' })

  if (user.registration_status === 'pending') {
    return res.status(403).json({ message: 'Your account is pending administrator approval.' })
  }
  if (user.registration_status === 'rejected') {
    return res.status(403).json({ message: 'Your registration was not approved.' })
  }

  const token = signToken(user)
  return res.json({ ok: true, token, user: publicUser(user) })
})

app.get('/api/auth/me', requireAuth, async (req, res) => {
  const result = await query('SELECT * FROM users WHERE id = $1', [req.auth.sub])
  const user = result.rows[0]
  if (!user) return res.status(401).json({ message: 'Session invalid.' })
  return res.json({ user: publicUser(user) })
})

app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  const currentPassword = String(req.body?.currentPassword || '')
  const newPassword = String(req.body?.newPassword || '')
  if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' })

  const result = await query('SELECT * FROM users WHERE id = $1', [req.auth.sub])
  const user = result.rows[0]
  if (!user) return res.status(404).json({ message: 'Account not found.' })

  const ok = await bcrypt.compare(currentPassword, user.password_hash)
  if (!ok) return res.status(400).json({ message: 'Current password is incorrect.' })

  const hash = await bcrypt.hash(newPassword, 10)
  await query(
    'UPDATE users SET password_hash = $1, must_change_password = false, updated_at = now() WHERE id = $2',
    [hash, req.auth.sub]
  )
  return res.json({ ok: true })
})

app.patch('/api/users/me/profile', requireAuth, async (req, res) => {
  const profile = req.body?.profile || {}
  const result = await query(
    `UPDATE users
     SET profile = COALESCE(profile, '{}'::jsonb) || $1::jsonb, updated_at = now()
     WHERE id = $2
     RETURNING *`,
    [JSON.stringify(profile), req.auth.sub]
  )
  return res.json({ user: publicUser(result.rows[0]) })
})

app.get('/api/admin/users', requireAuth, requireRole('admin'), async (_req, res) => {
  const result = await query('SELECT * FROM users ORDER BY created_at DESC')
  return res.json({ users: result.rows.map(publicUser) })
})

app.get('/api/admin/reviewers', requireAuth, requireRole('admin'), async (_req, res) => {
  const result = await query("SELECT * FROM users WHERE role = 'reviewer' ORDER BY created_at DESC")
  return res.json({ reviewers: result.rows.map(publicUser) })
})

app.post('/api/admin/reviewers', requireAuth, requireRole('admin'), async (req, res) => {
  const email = cleanEmail(req.body?.email)
  if (!email) return res.status(400).json({ message: 'Email is required.' })

  const existing = await query('SELECT id FROM users WHERE email = $1', [email])
  if (existing.rowCount) return res.status(409).json({ message: 'An account with this email already exists.' })

  const tempPassword = randomTempPassword()
  const hash = await bcrypt.hash(tempPassword, 10)
  await query(
    `INSERT INTO users (role, email, password_hash, must_change_password, profile, registration_status)
     VALUES ('reviewer', $1, $2, true, '{}'::jsonb, 'approved')`,
    [email, hash]
  )
  return res.json({ ok: true, tempPassword })
})

app.post('/api/admin/reviewers/reset-password', requireAuth, requireRole('admin'), async (req, res) => {
  const email = cleanEmail(req.body?.reviewerEmail)
  if (!email) return res.status(400).json({ message: 'Reviewer email is required.' })

  const userResult = await query("SELECT * FROM users WHERE role = 'reviewer' AND email = $1", [email])
  const reviewer = userResult.rows[0]
  if (!reviewer) return res.status(404).json({ message: 'Reviewer not found.' })

  const tempPassword = randomTempPassword()
  const hash = await bcrypt.hash(tempPassword, 10)
  await query(
    'UPDATE users SET password_hash = $1, must_change_password = true, updated_at = now() WHERE id = $2',
    [hash, reviewer.id]
  )
  return res.json({ ok: true, tempPassword })
})

app.get('/api/admin/dashboard', requireAuth, requireRole('admin'), async (_req, res) => {
  const stats = await query(
    `WITH role_counts AS (
      SELECT
        COUNT(*) FILTER (WHERE role = 'admin') AS admins,
        COUNT(*) FILTER (WHERE role = 'reviewer') AS reviewers,
        COUNT(*) FILTER (WHERE role = 'user') AS researchers
      FROM users
    ),
    trial_counts AS (
      SELECT
        COUNT(*) AS total_trials,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_trials
      FROM trials
    ),
    reg_pending AS (
      SELECT COUNT(*) AS pending_registrations
      FROM users
      WHERE role = 'user' AND registration_status = 'pending'
    )
    SELECT role_counts.*, trial_counts.*, reg_pending.pending_registrations
    FROM role_counts CROSS JOIN trial_counts CROSS JOIN reg_pending`
  )

  const recent = await query(
    `SELECT id, status, data, created_at, submitted_at, updated_at
     FROM trials
     ORDER BY COALESCE(submitted_at, created_at) DESC
     LIMIT 5`
  )
  return res.json({ stats: stats.rows[0], recentTrials: recent.rows })
})

app.post('/api/admin/users/:id/registration', requireAuth, requireRole('admin'), async (req, res) => {
  const action = String(req.body?.action || '').trim()
  const userId = req.params.id
  if (!['approve', 'reject'].includes(action)) return res.status(400).json({ message: 'action must be approve or reject.' })

  const result = await query(`SELECT * FROM users WHERE id = $1 AND role = 'user'`, [userId])
  const target = result.rows[0]
  if (!target) return res.status(404).json({ message: 'User not found.' })
  if (target.registration_status !== 'pending') {
    return res.status(400).json({ message: 'This account is not awaiting approval.' })
  }

  const nextStatus = action === 'approve' ? 'approved' : 'rejected'
  const updated = await query(
    `UPDATE users SET registration_status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
    [nextStatus, userId]
  )
  return res.json({ user: publicUser(updated.rows[0]) })
})

app.get('/api/admin/trials/pending-queue', requireAuth, requireRole('admin'), async (_req, res) => {
  const result = await query(
    `SELECT t.*, u.email AS researcher_email,
            r.email AS assigned_reviewer_email
     FROM trials t
     JOIN users u ON u.id = t.user_id
     LEFT JOIN users r ON r.id = t.assigned_reviewer_id
     WHERE t.status = 'pending'
     ORDER BY COALESCE(t.submitted_at, t.created_at) DESC`
  )
  return res.json({ trials: result.rows })
})

app.post('/api/admin/trials/:id/assign-reviewer', requireAuth, requireRole('admin'), async (req, res) => {
  const reviewerId = String(req.body?.reviewerId || '').trim()
  if (!reviewerId) return res.status(400).json({ message: 'reviewerId is required.' })

  const rev = await query("SELECT id FROM users WHERE id = $1 AND role = 'reviewer'", [reviewerId])
  if (!rev.rowCount) return res.status(400).json({ message: 'Invalid reviewer.' })

  const trialResult = await query('SELECT * FROM trials WHERE id = $1', [req.params.id])
  const trial = trialResult.rows[0]
  if (!trial) return res.status(404).json({ message: 'Trial not found.' })
  if (trial.status !== 'pending') return res.status(400).json({ message: 'Only pending trials can be assigned.' })

  const updated = await query(
    `UPDATE trials SET assigned_reviewer_id = $1, updated_at = now() WHERE id = $2 RETURNING *`,
    [reviewerId, req.params.id]
  )
  return res.json({ trial: updated.rows[0] })
})

app.post('/api/trials', requireAuth, requireRole('user'), async (req, res) => {
  const payload = req.body?.payload || {}
  const status = payload.status === 'draft' ? 'draft' : 'pending'
  const result = await query(
    `INSERT INTO trials (user_id, status, reviewer_comment, data, submitted_at)
     VALUES ($1, $2, '', $3::jsonb, CASE WHEN $2 = 'draft' THEN NULL ELSE now() END)
     RETURNING *`,
    [req.auth.sub, status, JSON.stringify(payload)]
  )
  return res.json({ trial: result.rows[0] })
})

app.patch('/api/trials/:id', requireAuth, requireRole('user'), async (req, res) => {
  const trialId = req.params.id
  const payload = req.body?.payload || {}
  const result = await query('SELECT * FROM trials WHERE id = $1', [trialId])
  const trial = result.rows[0]
  if (!trial) return res.status(404).json({ message: 'Trial not found.' })
  if (trial.user_id !== req.auth.sub) return res.status(403).json({ message: 'Not authorized.' })
  if (!['draft', 'approved'].includes(trial.status)) {
    return res.status(400).json({ message: 'Only draft or approved trials can be updated with this action.' })
  }

  const nextStatus = trial.status === 'approved' ? 'pending' : payload.status === 'draft' ? 'draft' : 'pending'
  const merged = { ...(trial.data || {}), ...payload }
  const update = await query(
    `UPDATE trials
     SET data = $1::jsonb,
         status = $2,
         submitted_at = CASE WHEN $2 = 'pending' THEN COALESCE(submitted_at, now()) ELSE NULL END,
         updated_at = now()
     WHERE id = $3
     RETURNING *`,
    [JSON.stringify(merged), nextStatus, trialId]
  )
  return res.json({ trial: update.rows[0] })
})

app.get('/api/trials/me', requireAuth, requireRole('user'), async (req, res) => {
  const result = await query(
    'SELECT * FROM trials WHERE user_id = $1 ORDER BY COALESCE(submitted_at, created_at) DESC',
    [req.auth.sub]
  )
  return res.json({ trials: result.rows })
})

app.get('/api/trials/:id', requireAuth, async (req, res) => {
  const trialId = req.params.id
  const result = await query('SELECT * FROM trials WHERE id = $1', [trialId])
  const trial = result.rows[0]
  if (!trial) return res.status(404).json({ message: 'Trial not found.' })

  if (req.auth.role === 'admin' || trial.user_id === req.auth.sub) {
    return res.json({ trial })
  }
  if (req.auth.role === 'reviewer') {
    const canSee =
      trial.assigned_reviewer_id === req.auth.sub || trial.reviewed_by === req.auth.sub
    if (canSee) return res.json({ trial })
  }
  return res.status(403).json({ message: 'Not authorized.' })
})

app.post('/api/trials/:id/resubmit', requireAuth, requireRole('user'), async (req, res) => {
  const payload = req.body?.payload || {}
  const trialId = req.params.id
  const result = await query('SELECT * FROM trials WHERE id = $1', [trialId])
  const trial = result.rows[0]
  if (!trial) return res.status(404).json({ message: 'Trial not found.' })
  if (trial.user_id !== req.auth.sub) return res.status(403).json({ message: 'Not authorized.' })
  if (trial.status !== 'rejected') return res.status(400).json({ message: 'Only rejected trials can be resubmitted.' })

  const merged = { ...(trial.data || {}), ...payload }
  const update = await query(
    `UPDATE trials
     SET data = $1::jsonb,
         status = 'pending',
         reviewer_comment = '',
         submitted_at = now(),
         rejected_at = NULL,
         assigned_reviewer_id = NULL,
         updated_at = now()
     WHERE id = $2
     RETURNING *`,
    [JSON.stringify(merged), trialId]
  )
  return res.json({ trial: update.rows[0] })
})

app.get('/api/reviewer/trials', requireAuth, requireRole('reviewer'), async (req, res) => {
  const status = String(req.query.status || '').trim()
  const reviewerId = req.auth.sub

  if (!status) {
    const all = await query(
      `SELECT * FROM trials
       WHERE (status = 'pending' AND assigned_reviewer_id = $1)
          OR (status = 'approved' AND reviewed_by = $1)
          OR (status = 'rejected' AND reviewed_by = $1)
       ORDER BY COALESCE(submitted_at, created_at) DESC`,
      [reviewerId]
    )
    return res.json({ trials: all.rows })
  }

  if (status === 'pending') {
    const filtered = await query(
      `SELECT * FROM trials
       WHERE status = 'pending' AND assigned_reviewer_id = $1
       ORDER BY COALESCE(submitted_at, created_at) DESC`,
      [reviewerId]
    )
    return res.json({ trials: filtered.rows })
  }

  if (status === 'approved' || status === 'rejected') {
    const filtered = await query(
      `SELECT * FROM trials
       WHERE status = $1 AND reviewed_by = $2
       ORDER BY COALESCE(submitted_at, created_at) DESC`,
      [status, reviewerId]
    )
    return res.json({ trials: filtered.rows })
  }

  return res.status(400).json({ message: 'Invalid status filter.' })
})

app.post('/api/reviewer/trials/:id/approve', requireAuth, requireRole('reviewer'), async (req, res) => {
  const existing = await query('SELECT * FROM trials WHERE id = $1', [req.params.id])
  const trialRow = existing.rows[0]
  if (!trialRow) return res.status(404).json({ message: 'Trial not found.' })
  if (trialRow.status !== 'pending') return res.status(400).json({ message: 'Only pending trials can be approved.' })
  if (trialRow.assigned_reviewer_id !== req.auth.sub) {
    return res.status(403).json({ message: 'You are not assigned to this trial.' })
  }

  const result = await query(
    `UPDATE trials
     SET status = 'approved',
         reviewer_comment = '',
         approved_at = now(),
         rejected_at = NULL,
         reviewed_by = $1,
         updated_at = now()
     WHERE id = $2
     RETURNING *`,
    [req.auth.sub, req.params.id]
  )
  const trial = result.rows[0]
  return res.json({ trial })
})

app.post('/api/reviewer/trials/:id/reject', requireAuth, requireRole('reviewer'), async (req, res) => {
  const reason = String(req.body?.reason || '').trim()
  if (!reason) return res.status(400).json({ message: 'Rejection reason is required.' })

  const existing = await query('SELECT * FROM trials WHERE id = $1', [req.params.id])
  const trialRow = existing.rows[0]
  if (!trialRow) return res.status(404).json({ message: 'Trial not found.' })
  if (trialRow.status !== 'pending') return res.status(400).json({ message: 'Only pending trials can be rejected.' })
  if (trialRow.assigned_reviewer_id !== req.auth.sub) {
    return res.status(403).json({ message: 'You are not assigned to this trial.' })
  }

  const result = await query(
    `UPDATE trials
     SET status = 'rejected',
         reviewer_comment = $1,
         rejected_at = now(),
         approved_at = NULL,
         reviewed_by = $2,
         updated_at = now()
     WHERE id = $3
     RETURNING *`,
    [reason, req.auth.sub, req.params.id]
  )
  const trial = result.rows[0]
  return res.json({ trial })
})

app.get('/api/trials/public/approved', async (_req, res) => {
  const result = await query(
    "SELECT * FROM trials WHERE status = 'approved' ORDER BY COALESCE(approved_at, updated_at, created_at) DESC"
  )
  return res.json({ trials: result.rows.map(sanitizeTrialForPublic) })
})

app.get('/api/trials/public/approved/:id/files/:category/:index', async (req, res) => {
  const trialResult = await query("SELECT * FROM trials WHERE id = $1 AND status = 'approved'", [req.params.id])
  const trial = trialResult.rows[0]
  if (!trial) return res.status(404).json({ message: 'Trial not found.' })

  const file = getApprovedTrialUpload(trial, req.params.category, req.params.index)
  if (!isStoredUpload(file)) {
    return res.status(404).json({ message: 'File content is unavailable for this record.' })
  }

  const safeName = String(file.name || 'trial-upload.bin').replace(/[\r\n"]/g, '_')
  const buffer = Buffer.from(file.contentBase64, 'base64')
  res.setHeader('Content-Type', file.type || 'application/octet-stream')
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`)
  return res.send(buffer)
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Internal server error.' })
})

const port = Number(process.env.PORT || 8080)
app.listen(port, () => {
  console.log(`CTR backend running on http://localhost:${port}`)
})







