import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { AppToasterProvider } from './context/ToasterContext.jsx'
import PublicLayout from './layouts/PublicLayout.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import RequireAuth from './routes/RequireAuth.jsx'
import RequireRole from './routes/RequireRole.jsx'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import PublicTrials from './pages/PublicTrials.jsx'
import PublicTrialDiagrams from './pages/PublicTrialDiagrams.jsx'

import UserDashboard from './pages/user/UserDashboard.jsx'
import SubmitTrial from './pages/user/SubmitTrial.jsx'
import MyTrials from './pages/user/MyTrials.jsx'

import ReviewerDashboard from './pages/reviewer/ReviewerDashboard.jsx'
import TrialReview from './pages/reviewer/TrialReview.jsx'

import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import CreateReviewer from './pages/admin/CreateReviewer.jsx'
import ResetReviewerPassword from './pages/admin/ResetReviewerPassword.jsx'
import ManageReviewers from './pages/admin/ManageReviewers.jsx'
import ViewUsers from './pages/admin/ViewUsers.jsx'
import AssignTrials from './pages/admin/AssignTrials.jsx'

export default function App() {
  return (
    <AppToasterProvider>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/trials" element={<PublicTrials />} />
            <Route path="/trials/diagrams" element={<PublicTrialDiagrams />} />
          </Route>

          <Route
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<Navigate to="/dashboard/redirect" replace />} />
            <Route path="/dashboard/redirect" element={<DashboardRedirect />} />

            <Route
              path="/dashboard/user"
              element={
                <RequireRole allow={['user']}>
                  <UserDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/dashboard/user/submit"
              element={
                <RequireRole allow={['user']}>
                  <SubmitTrial />
                </RequireRole>
              }
            />
            <Route
              path="/dashboard/user/my-trials"
              element={
                <RequireRole allow={['user']}>
                  <MyTrials />
                </RequireRole>
              }
            />

            <Route
              path="/dashboard/reviewer"
              element={
                <RequireRole allow={['reviewer']}>
                  <ReviewerDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/dashboard/reviewer/review/:trialId"
              element={
                <RequireRole allow={['reviewer']}>
                  <TrialReview />
                </RequireRole>
              }
            />

            <Route
              path="/dashboard/admin"
              element={
                <RequireRole allow={['admin']}>
                  <AdminDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/dashboard/admin/create-reviewer"
              element={
                <RequireRole allow={['admin']}>
                  <CreateReviewer />
                </RequireRole>
              }
            />
            <Route
              path="/dashboard/admin/manage-reviewers"
              element={
                <RequireRole allow={['admin']}>
                  <ManageReviewers />
                </RequireRole>
              }
            />
            <Route
              path="/dashboard/admin/reset-reviewer-password"
              element={
                <RequireRole allow={['admin']}>
                  <ResetReviewerPassword />
                </RequireRole>
              }
            />
            <Route
              path="/dashboard/admin/users"
              element={
                <RequireRole allow={['admin']}>
                  <ViewUsers />
                </RequireRole>
              }
            />
            <Route
              path="/dashboard/admin/assign-trials"
              element={
                <RequireRole allow={['admin']}>
                  <AssignTrials />
                </RequireRole>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </AppToasterProvider>
  )
}

function DashboardRedirect() {
  return (
    <RequireAuth>
      <RoleRedirect />
    </RequireAuth>
  )
}

function RoleRedirect() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />
  if (user.role === 'reviewer') return <Navigate to="/dashboard/reviewer" replace />
  return <Navigate to="/dashboard/user" replace />
}



