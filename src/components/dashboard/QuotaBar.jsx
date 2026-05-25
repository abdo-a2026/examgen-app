/**
 * QuotaBar.jsx
 * شريط الرصيد اليومي مع عداد الطلبات
 * يقرأ من authStore ويستدعي checkQuota لجلب resetIn
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Clock, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { checkQuota, getDailyLimit } from '../../services/quota'

export default function QuotaBar() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [quotaInfo, setQuotaInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  const plan = user?.plan || 'free'
  const limit = getDailyLimit(plan)
  const usageCount = user?.dailyUsage?.count || 0
  const remaining = Math.max(0, limit - usageCount)
  const percentage = limit > 0 ? ((limit - remaining) / limit) * 100 : 0

  // لون الشريط حسب الرصيد
  const getBarColor = () => {
    if (remaining === 0) return '#F85149'          // أحمر
    if (remaining <= limit * 0.3) return '#D97706' // برتقالي
    return '#3FB950'                                // أخضر
  }

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    let mounted = true

    const fetchQuota = async () => {
      try {
        const info = await checkQuota(user.uid)
        if (mounted) setQuotaInfo(info)
      } catch (error) {
        console.error('QuotaBar fetchQuota error:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchQuota()

    return () => {
      mounted = false
    }
  }, [user?.uid, user?.dailyUsage?.count])

  return (
    <div
      className="rounded-xl p-4 sm:p-5"
      style={{
        background: '#161B22',
        border: '1px solid #30363D',
      }}
    >
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">

        {/* النص الرئيسي */}
        <div className="flex items-center gap-2">
          {remaining === 0 ? (
            <AlertTriangle size={16} color="#F85149" />
          ) : (
            <Zap size={16} color="#FF6B35" />
          )}
          <span
            className="text-sm font-semibold"
            style={{ color: '#E6EDF3', fontFamily: 'Cairo, sans-serif' }}
          >
            {remaining === 0
              ? 'استنفدت طلباتك اليوم'
              : `${remaining} من ${limit} طلبات متبقية اليوم`}
          </span>
        </div>

        {/* زر الترقية (للمجانيين فقط) */}
        {plan === 'free' && (
          <button
            onClick={() => navigate('/upgrade')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0"
            style={{
              background: 'rgba(255, 107, 53, 0.12)',
              color: '#FF6B35',
              border: '1px solid rgba(255, 107, 53, 0.25)',
              fontFamily: 'Cairo, sans-serif',
              minHeight: '32px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 107, 53, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 107, 53, 0.12)'
            }}
          >
            <Zap size={12} />
            ترقية
          </button>
        )}
      </div>

      {/* شريط التقدم */}
      <div
        className="w-full h-2 rounded-full overflow-hidden mb-2"
        style={{ background: '#30363D' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: getBarColor() }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>

      {/* معلومات إضافية */}
      <div className="flex items-center gap-1.5 mt-2">
        <Clock size={12} color="#6E7681" />
        {loading ? (
          <span className="text-xs" style={{ color: '#6E7681' }}>
            جاري الحساب...
          </span>
        ) : quotaInfo?.resetIn ? (
          <span className="text-xs" style={{ color: '#6E7681', fontFamily: 'Cairo, sans-serif' }}>
            تتجدد بعد {quotaInfo.resetIn}
          </span>
        ) : (
          <span className="text-xs" style={{ color: '#6E7681', fontFamily: 'Cairo, sans-serif' }}>
            تتجدد كل 24 ساعة
          </span>
        )}
      </div>
    </div>
  )
}
