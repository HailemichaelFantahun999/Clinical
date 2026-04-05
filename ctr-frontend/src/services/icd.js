import { api } from './api.js'

export async function searchIcdDiseases(query) {
  const text = String(query || '').trim()
  if (text.length < 2) return []

  const { data } = await api.get('/api/icd/search', {
    params: { q: text }
  })

  return Array.isArray(data?.results) ? data.results : []
}
