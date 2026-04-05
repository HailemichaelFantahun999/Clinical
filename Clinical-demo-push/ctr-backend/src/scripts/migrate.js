import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from '../db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const sqlDir = path.resolve(__dirname, '../../sql')

async function main() {
  const files = (await fs.readdir(sqlDir))
    .filter((name) => name.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b))

  for (const file of files) {
    const sql = await fs.readFile(path.join(sqlDir, file), 'utf8')
    await pool.query(sql)
    console.log(`Migration applied: ${file}`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
