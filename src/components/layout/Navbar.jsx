/**
 * Navbar.jsx — شريط التنقل العلوي الثابت (الإصلاح 8)
 */

import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, LogOut, Zap, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { signOut } from '../../services/auth'

export default function Navbar() {
  const { user }  = useAuthStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef   = useRef(null)

  const displayName = user?.displayName || ''
  const shortName   = displayName.split(' ').slice(0, 2).join(' ')

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // إغلاق القائمة عند تغيير المسار
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleSignOut = async () => {
    try {
      setMenuOpen(false)
      await signOut()
      navigate('/auth')
    } catch (error) {
      console.error('handleSignOut error:', error)
    }
  }

  const handleUpgrade = () => {
    setMenuOpen(false)
    navigate('/upgrade')
  }

  const isDashboard = location.pathname === '/dashboard'

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{ background: '#0D1117', borderBottom: '1px solid #30363D' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        {/* ── يمين: الشعار → Dashboard ── */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 focus:outline-none"
          aria-label="الرئيسية"
        >
          <span
            className="text-lg sm:text-xl font-bold tracking-tight"
            style={{ color: '#FF6B35', fontFamily: 'Cairo, sans-serif' }}
          >
            ExamGen
          </span>
          <span
            className="text-lg sm:text-xl font-bold tracking-tight"
            style={{ color: '#E6EDF3', fontFamily: 'Cairo, sans-serif' }}
          >
            AI
          </span>
        </button>

        {/* ── وسط: رابط Dashboard إذا لم نكن فيه ── */}
        {!isDashboard && (
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors duration-150"
            style={{ color: '#8B949E', border: '1px solid #30363D' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#E6EDF3'
              e.currentTarget.style.borderColor = '#FF6B35'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#8B949E'
              e.currentTarget.style.borderColor = '#30363D'
            }}
          >
            <LayoutDashboard size={13} />
            لوحة التحكم
          </button>
        )}

        {/* ── يسار: قائمة المستخدم ── */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-150"
            style={{ minHeight: '40px' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            aria-label="قائمة المستخدم"
            aria-expanded={menuOpen}
          >
            {/* صورة المستخدم */}
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={shortName}
                className="rounded-full object-cover flex-shrink-0"
                style={{ width: '32px', height: '32px' }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{
                  width: '32px', height: '32px',
                  background: '#FF6B35',
                  color: '#fff',
                  fontFamily: 'Cairo, sans-serif',
                }}
              >
                {shortName.charAt(0) || 'م'}
              </div>
            )}

            <span
              className="hidden sm:block text-sm max-w-[120px] truncate"
              style={{ color: '#E6EDF3', fontFamily: 'Cairo, sans-serif' }}
            >
              {shortName}
            </span>

            <ChevronDown
              size={14}
              color="#8B949E"
              style={{
                transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {/* ── القائمة المنسدلة ── */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute left-0 mt-2 w-48 rounded-xl overflow-hidden"
                style={{
                  background: '#161B22',
                  border: '1px solid #30363D',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                {/* معلومات المستخدم */}
                <div className="px-4 py-3" style={{ borderBottom: '1px solid #30363D' }}>
                  <p className="text-xs truncate" style={{ color: '#8B949E', fontFamily: 'Cairo, sans-serif' }}>
                    {user?.email || ''}
                  </p>
                  <span
                    className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: user?.plan === 'subscribed'
                        ? 'rgba(63,185,80,0.15)'
                        : 'rgba(255,107,53,0.12)',
                      color: user?.plan === 'subscribed' ? '#3FB950' : '#FF6B35',
                      fontFamily: 'Cairo, sans-serif',
                    }}
                  >
                    {user?.plan === 'subscribed' ? 'مشترك' : 'مجاني'}
                  </span>
                </div>

                {/* ترقية الخطة */}
                {(!user?.plan || user.plan === 'free') && (
                  <button
                    onClick={handleUpgrade}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-right transition-colors duration-150"
                    style={{ color: '#FF6B35', fontFamily: 'Cairo, sans-serif', borderBottom: '1px solid #30363D' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,107,53,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Zap size={15} />
                    ترقية الخطة
                  </button>
                )}

                {/* تسجيل الخروج */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-right transition-colors duration-150"
                  style={{ color: '#8B949E', fontFamily: 'Cairo, sans-serif' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,81,73,0.08)'; e.currentTarget.style.color = '#F85149' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8B949E' }}
                >
                  <LogOut size={15} />
                  تسجيل الخروج
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
