// src/components/layout/ProtectedRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()

  // حالة التحميل الأولية — انتظر حتى يتحقق Firebase من الجلسة
  if (loading) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: '100vh',
          backgroundColor: '#0D1117',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Spinner */}
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '3px solid #30363D',
            borderTop: '3px solid #FF6B35',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />

        <p
          style={{
            color: '#8B949E',
            fontFamily: "'Noto Sans Arabic', sans-serif",
            fontSize: '14px',
          }}
        >
          جارٍ التحقق من الجلسة...
        </p>

        <style>{`
          @keyframes spin {
            0%   { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // غير مسجل → إعادة توجيه لصفحة الدخول
  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // مسجل → عرض المحتوى
  return children
}
