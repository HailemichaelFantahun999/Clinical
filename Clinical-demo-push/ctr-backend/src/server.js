import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { query } from './db.js'
import { requireAuth, requireRole, signToken } from './auth.js'
import { cleanEmail, publicUser, randomTempPassword } from './utils.js'

dotenv.config()

const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  })
)
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', async (_req, res) => {
  await query('SELECT 1')
  res.json({ ok: true })
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
    `INSERT INTO users (role, email, password_hash, must_change_password, profile)
     VALUES ('user', $1, $2, false, '{}'::jsonb)`,
    [email, hash]
  )
  return res.json({ ok: true })
})

app.post('/api/auth/login', async (req, res) => {
  const email = cleanEmail(req.body?.email)
  const password = String(req.body?.password || '')
  const result = await query('SELECT * FROM users WHERE email = $1', [email])
  const user = result.rows[0]
  if (!user) return res.status(401).json({ message: 'Invalid email or password.' })

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ message: 'Invalid email or password.' })

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
    `INSERT INTO users (role, email, password_hash, must_change_password, profile)
     VALUES ('reviewer', $1, $2, true, '{}'::jsonb)`,
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
    )
    SELECT * FROM role_counts CROSS JOIN trial_counts`
  )

  const recent = await query(
    `SELECT id, status, data, created_at, submitted_at, updated_at
     FROM trials
     ORDER BY COALESCE(submitted_at, created_at) DESC
     LIMIT 5`
  )
  return res.json({ stats: stats.rows[0], recentTrials: recent.rows })
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

  if (req.auth.role === 'admin' || req.auth.role === 'reviewer' || trial.user_id === req.auth.sub) {
    return res.json({ trial })
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
         updated_at = now()
     WHERE id = $2
     RETURNING *`,
    [JSON.stringify(merged), trialId]
  )
  return res.json({ trial: update.rows[0] })
})

app.get('/api/reviewer/trials', requireAuth, requireRole('reviewer'), async (req, res) => {
  const status = String(req.query.status || '').trim()
  if (!status) {
    const all = await query('SELECT * FROM trials ORDER BY COALESCE(submitted_at, created_at) DESC')
    return res.json({ trials: all.rows })
  }
  const filtered = await query(
    'SELECT * FROM trials WHERE status = $1 ORDER BY COALESCE(submitted_at, created_at) DESC',
    [status]
  )
  return res.json({ trials: filtered.rows })
})

app.post('/api/reviewer/trials/:id/approve', requireAuth, requireRole('reviewer'), async (req, res) => {
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
  if (!trial) return res.status(404).json({ message: 'Trial not found.' })
  return res.json({ trial })
})

app.post('/api/reviewer/trials/:id/reject', requireAuth, requireRole('reviewer'), async (req, res) => {
  const reason = String(req.body?.reason || '').trim()
  if (!reason) return res.status(400).json({ message: 'Rejection reason is required.' })

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
  if (!trial) return res.status(404).json({ message: 'Trial not found.' })
  return res.json({ trial })
})

app.get('/api/trials/public/approved', async (_req, res) => {
  const result = await query(
    "SELECT * FROM trials WHERE status = 'approved' ORDER BY COALESCE(approved_at, updated_at, created_at) DESC"
  )
  return res.json({ trials: result.rows })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Internal server error.' })
})

const port = Number(process.env.PORT || 8080)
app.listen(port, () => {
  console.log(`CTR backend running on http://localhost:${port}`)
})
