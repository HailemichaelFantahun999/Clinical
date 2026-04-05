import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as auth from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function run() {
      const u = await auth.getCurrentUser()
      setUser(u)
      setLoading(false)
    }
    run()
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      async signup(payload) {
        return auth.signup(payload)
      },

      async login(payload) {
        const res = await auth.login(payload)
        setUser(await auth.getCurrentUser())
        return res
      },
      logout() {
        auth.logout()
        setUser(null)
      },
      async changePassword(payload) {
        const res = await auth.changePassword(payload)
        setUser(await auth.getCurrentUser())
        return res
      },
      async updateProfile(payload) {
        const updated = await auth.updateUserProfile(payload)
        setUser(updated)
        return updated
      },
      async adminCreateReviewer(payload) {
        return auth.adminCreateReviewer(payload)
      },
      async adminResetReviewerPassword(payload) {
        return auth.adminResetReviewerPassword(payload)
      },
      async adminListReviewers(payload) {
        return auth.adminListReviewers(payload)
      },
      async adminListUsers(payload) {
        return auth.adminListUsers(payload)
      },
      async adminReviewRegistration(payload) {
        return auth.adminReviewRegistration(payload)
      }
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

