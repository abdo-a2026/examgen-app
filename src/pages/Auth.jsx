// src/pages/Auth.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithGoogle } from '../services/auth'
import { useAuthStore } from '../store/authStore'

export default function Auth() {
  const navigate = useNavigate()
  const { user, loading } = useAuthStore()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState(null)

  // إذا المستخدم مسجل بالفعل → اذهب للـ dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true)
      setError(null)
      await signInWithGoogle()
      // onAuthChange في App.jsx سيتولى الباقي
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول. حاول مرة أخرى.')
    } finally {
      setSigningIn(false)
    }
  }

  // لا نعرض شيئاً أثناء التحقق الأولي
  if (loading) return null

  return (
    <div dir="rtl" style={styles.page}>
      {/* خلفية نجوم زخرفية */}
      <div style={styles.bgDots} aria-hidden="true" />

      {/* بطاقة تسجيل الدخول */}
      <div style={styles.card}>
        {/* الشعار */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 2L3 8v12l11 6 11-6V8L14 2z"
                fill="#FF6B35"
                fillOpacity="0.15"
                stroke="#FF6B35"
                strokeWidth="1.5"
              />
              <path
                d="M9 13h10M9 17h6M14 9v10"
                stroke="#FF6B35"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span style={styles.logoText}>ExamGen AI</span>
        </div>

        {/* العنوان */}
        <h1 style={styles.title}>مرحباً بك</h1>
        <p style={styles.subtitle}>
          حوّل ملفات PDF إلى امتحانات احترافية وملخصات منظمة
          <br />
          بأسلوب وزارة التربية العراقية
        </p>

        {/* الفواصل */}
        <div style={styles.divider} />

        {/* رسالة الخطأ */}
        {error && (
          <div style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" stroke="#F85149" strokeWidth="1.5" />
              <path d="M12 8v4M12 16h.01" stroke="#F85149" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* زر Google */}
        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          style={{
            ...styles.googleBtn,
            ...(signingIn ? styles.googleBtnDisabled : {}),
          }}
          onMouseEnter={(e) => {
            if (!signingIn) {
              e.currentTarget.style.background = '#1C2128'
              e.currentTarget.style.borderColor = '#FF6B35'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#161B22'
            e.currentTarget.style.borderColor = '#30363D'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {signingIn ? (
            <>
              <div style={styles.btnSpinner} />
              <span>جارٍ تسجيل الدخول...</span>
            </>
          ) : (
            <>
              {/* Google Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>تسجيل الدخول بـ Google</span>
            </>
          )}
        </button>

        {/* نص الخصوصية */}
        <p style={styles.privacyText}>
          بالدخول، أنت توافق على استخدام بيانات حسابك لإنشاء جلسة آمنة.
          <br />
          لا نخزن كلمات المرور — تسجيل الدخول عبر Google فقط.
        </p>

        {/* ميزات سريعة */}
        <div style={styles.featuresList}>
          {[
            { icon: '📋', text: '9 أنماط أسئلة وزارية واحترافية' },
            { icon: '📝', text: 'ملخصات منظمة قابلة للتحميل' },
            { icon: '🔒', text: '3 طلبات يومياً مجاناً' },
          ].map((f, i) => (
            <div key={i} style={styles.featureItem}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <span style={styles.featureText}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p style={styles.footer}>
        ExamGen AI · للطلاب والأساتذة في العراق
      </p>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0D1117',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Noto Sans Arabic', sans-serif",
  },
  bgDots: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,107,53,0.06) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(37,99,235,0.06) 0%, transparent 50%)`,
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#161B22',
    border: '1px solid #30363D',
    borderRadius: '16px',
    padding: '40px 32px',
    boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '28px',
  },
  logoIcon: {
    width: '44px',
    height: '44px',
    backgroundColor: 'rgba(255,107,53,0.1)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,107,53,0.2)',
  },
  logoText: {
    fontFamily: "'Cairo', sans-serif",
    fontSize: '22px',
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: '-0.3px',
  },
  title: {
    fontFamily: "'Cairo', sans-serif",
    fontSize: '26px',
    fontWeight: '700',
    color: '#E6EDF3',
    margin: '0 0 8px 0',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '13px',
    color: '#8B949E',
    textAlign: 'center',
    lineHeight: '1.7',
    margin: '0 0 24px 0',
  },
  divider: {
    height: '1px',
    backgroundColor: '#21262D',
    margin: '0 0 24px 0',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    backgroundColor: 'rgba(248,81,73,0.08)',
    border: '1px solid rgba(248,81,73,0.25)',
    borderRadius: '8px',
    padding: '12px 14px',
    marginBottom: '16px',
    color: '#F85149',
    fontSize: '13px',
    lineHeight: '1.6',
    textAlign: 'right',
  },
  googleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backgroundColor: '#161B22',
    border: '1px solid #30363D',
    borderRadius: '10px',
    padding: '14px 20px',
    color: '#E6EDF3',
    fontSize: '15px',
    fontFamily: "'Noto Sans Arabic', sans-serif",
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  googleBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  btnSpinner: {
    width: '18px',
    height: '18px',
    border: '2px solid #30363D',
    borderTop: '2px solid #FF6B35',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    flexShrink: 0,
  },
  privacyText: {
    fontSize: '11px',
    color: '#6E7681',
    textAlign: 'center',
    lineHeight: '1.7',
    margin: '0 0 24px 0',
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: '#0D1117',
    borderRadius: '10px',
    padding: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  featureIcon: {
    fontSize: '16px',
    lineHeight: '1',
    flexShrink: 0,
  },
  featureText: {
    fontSize: '13px',
    color: '#8B949E',
  },
  footer: {
    marginTop: '24px',
    fontSize: '12px',
    color: '#484F58',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
}
