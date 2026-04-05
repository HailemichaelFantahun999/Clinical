import bcrypt from 'bcryptjs'
import { pool } from '../db.js'

async function upsertUser({ role, email, password, profile = {} }) {
  const hash = await bcrypt.hash(password, 10)
  await pool.query(
    `INSERT INTO users (role, email, password_hash, must_change_password, profile)
     VALUES ($1, $2, $3, false, $4::jsonb)
     ON CONFLICT (email) DO UPDATE
     SET role = EXCLUDED.role,
         password_hash = EXCLUDED.password_hash,
         must_change_password = false,
         profile = EXCLUDED.profile,
         updated_at = now()`,
    [role, email, hash, JSON.stringify(profile)]
  )
}

async function main() {
  await upsertUser({
    role: 'admin',
    email: 'admin@demo.local',
    password: 'demo-admin',
    profile: { fullName: 'Demo Administrator' }
  })
  await upsertUser({
    role: 'reviewer',
    email: 'reviewer@demo.local',
    password: 'demo-reviewer',
    profile: { fullName: 'Demo Reviewer' }
  })
  await upsertUser({
    role: 'user',
    email: 'researcher@demo.local',
    password: 'demo-researcher',
    profile: { fullName: 'Demo Researcher' }
  })
  console.log('Seed data upserted.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
