import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { useAuthStore } from './store/authStore'
import { onAuthChange, createUserIfNotExists } from './services/auth'

import ProtectedRoute from './components/layout/ProtectedRoute'

import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ExamPage from './pages/ExamPage'
import SummaryPage from './pages/SummaryPage'
import ResultPage from './pages/ResultPage'
import UpgradePage from './pages/UpgradePage'
import AdminPage from './pages/AdminPage'

// مكوّن Landing يعيد التوجيه للـ Dashboard إذا المستخدم مسجّل
function LandingRoute() {
  const { user, loading } = useAuthStore()

  if (loading) return null // ProtectedRoute يعالج loading spinner

  if (user) return <Navigate to="/dashboard" replace />

  return <Landing />
}

export default function App() {
  const { setUser, clearUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userData = await createUserIfNotExists(firebaseUser)
          setUser(userData)
        } else {
          clearUser()
        }
      } catch (error) {
        console.error('App onAuthChange error:', error)
        // Fallback: استخدم بيانات Firebase مباشرةً إذا فشل Firestore
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            plan: 'free',
            planExpiresAt: null,
            dailyUsage: { count: 0, resetAt: null },
          })
        } else {
          clearUser()
        }
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [setUser, clearUser, setLoading])

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#161B22',
            color: '#E6EDF3',
            border: '1px solid #30363D',
            fontFamily: "'Noto Sans Arabic', sans-serif",
            direction: 'rtl',
            borderRadius: '12px',
          },
          success: {
            iconTheme: { primary: '#3FB950', secondary: '#0D1117' },
          },
          error: {
            iconTheme: { primary: '#F85149', secondary: '#0D1117' },
          },
        }}
      />
      <Routes>
        {/* الصفحة الرئيسية — تعيد للـ Dashboard إذا مسجّل */}
        <Route path="/" element={<LandingRoute />} />

        {/* صفحة تسجيل الدخول */}
        <Route path="/auth" element={<Auth />} />

        {/* الصفحات المحمية */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam"
          element={
            <ProtectedRoute>
              <ExamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/summary"
          element={
            <ProtectedRoute>
              <SummaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/result/:requestId"
          element={
            <ProtectedRoute>
              <ResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upgrade"
          element={
            <ProtectedRoute>
              <UpgradePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* أي مسار غير معروف → الرئيسية */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
