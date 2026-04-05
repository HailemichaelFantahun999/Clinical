const ICD_TOKEN_URL = 'https://icdaccessmanagement.who.int/connect/token'
const ICD_API_BASE_URL = 'https://id.who.int/icd/release/11'

let cachedToken = {
  accessToken: '',
  expiresAt: 0
}

function getRequiredEnv(name) {
  const value = String(process.env[name] || '').trim()
  if (!value) {
    const error = new Error(`Missing required ICD configuration: ${name}`)
    error.statusCode = 503
    throw error
  }
  return value
}

function getIcdConfig() {
  return {
    clientId: getRequiredEnv('ICD_API_CLIENT_ID'),
    clientSecret: getRequiredEnv('ICD_API_CLIENT_SECRET'),
    releaseId: String(process.env.ICD_API_RELEASE_ID || '2025-01').trim() || '2025-01',
    linearization: String(process.env.ICD_API_LINEARIZATION || 'mms').trim() || 'mms',
    language: String(process.env.ICD_API_LANGUAGE || 'en').trim() || 'en'
  }
}

async function getIcdAccessToken(config) {
  const now = Date.now()
  if (cachedToken.accessToken && cachedToken.expiresAt - 60000 > now) {
    return cachedToken.accessToken
  }

  const basicAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'icdapi_access'
  })

  const response = await fetch(ICD_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })

  if (!response.ok) {
    const details = await response.text()
    const error = new Error(`ICD token request failed with status ${response.status}: ${details}`)
    error.statusCode = 502
    throw error
  }

  const data = await response.json()
  cachedToken = {
    accessToken: String(data.access_token || ''),
    expiresAt: now + Number(data.expires_in || 3600) * 1000
  }

  return cachedToken.accessToken
}

function extractText(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map((item) => extractText(item)).find(Boolean) || ''
  }
  if (typeof value === 'object') {
    return (
      extractText(value['@value']) ||
      extractText(value.label) ||
      extractText(value.value) ||
      extractText(value.title)
    )
  }
  return ''
}

function normalizeIcdResult(item) {
  const title = extractText(item?.title) || extractText(item?.label)
  const code = String(item?.theCode || item?.code || '').trim()
  const uri = String(item?.id || item?.source || item?.foundationUri || '').trim()
  const chapter = extractText(item?.chapter) || extractText(item?.chapterTitle)
  const isResidual = Boolean(item?.isResidual)

  if (!title) return null

  return {
    id: uri || `${code}:${title}`,
    title,
    code,
    chapter,
    uri,
    isResidual,
    displayLabel: code ? `${title} (${code})` : title
  }
}

export async function searchIcd(queryText) {
  const q = String(queryText || '').trim()
  if (q.length < 2) return []

  const config = getIcdConfig()
  const token = await getIcdAccessToken(config)

  const params = new URLSearchParams({
    q,
    useFlexisearch: 'true',
    flatResults: 'true'
  })

  const response = await fetch(
    `${ICD_API_BASE_URL}/${encodeURIComponent(config.releaseId)}/${encodeURIComponent(config.linearization)}/search?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'API-Version': 'v2',
        'Accept-Language': config.language,
        Accept: 'application/json'
      }
    }
  )

  if (!response.ok) {
    const details = await response.text()
    const error = new Error(`ICD search failed with status ${response.status}: ${details}`)
    error.statusCode = 502
    throw error
  }

  const data = await response.json()
  const rawResults = Array.isArray(data?.destinationEntities)
    ? data.destinationEntities
    : Array.isArray(data?.entities)
      ? data.entities
      : []

  const seen = new Set()

  return rawResults
    .map(normalizeIcdResult)
    .filter(Boolean)
    .filter((item) => {
      const key = `${item.code}|${item.title}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 10)
}
