import { uid } from './storage'

// Mock "email sending" to keep the UI flow testable.
// In a real backend, these would be server-side emails.
export function sendEmail({ to, subject, body }) {
  const item = {
    id: uid(),
    to,
    subject,
    body,
    sentAt: new Date().toISOString()
  }
  const key = 'ctr.mockEmails.v1'
  const prev = JSON.parse(localStorage.getItem(key) || '[]')
  localStorage.setItem(key, JSON.stringify([item, ...prev]))
  return item
}

export function listEmails() {
  const key = 'ctr.mockEmails.v1'
  return JSON.parse(localStorage.getItem(key) || '[]')
}

