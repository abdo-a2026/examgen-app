/**
 * Dashboard.jsx
 * لوحة التحكم الرئيسية — المرحلة 3
 * هيكل: Navbar ثابت + محتوى قابل للتمرير
 */

import React, { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, BookOpen, ChevronDown, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { useAuthStore } from '../store/authStore'
import { useRequestsStore } from '../store/requestsStore'
import { getRequests } from '../services/requests'
import { checkQuota, getDailyLimit } from '../services/quota'

import Navbar from '../components/layout/Navbar'
import QuotaBar from '../components/dashboard/QuotaBar'
import FeatureCard from '../components/dashboard/FeatureCard'
import RequestCard from '../components/dashboard/RequestCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'

// animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

const REQUESTS_PER_PAGE = 10

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const {
    requests,
    lastDoc,
    hasMore,
    loading,
    setRequests,
    appendRequests,
    setLastDoc,
    setHasMore,
    setLoading,
  } = useRequestsStore()

  // حالة محلية للخطأ
  const [fetchError, setFetchError] = React.useState(null)
  const [loadingMore, setLoadingMore] = React.useState(false)

  // هل الرصيد نفد؟
  const plan = user?.plan || 'free'
  const limit = getDailyLimit(plan)
  const usageCount = user?.dailyUsage?.count || 0
  const remaining = Math.max(0, limit - usageCount)
  const quotaEmpty = remaining === 0

  // ===== جلب الطلبات عند Mount =====
  const fetchInitialRequests = useCallback(async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      setFetchError(null)

      const { requests: fetched, lastDoc: newLastDoc, hasMore: more } =
        await getRequests(user.uid, REQUESTS_PER_PAGE, null)

      setRequests(fetched)
      setLastDoc(newLastDoc)
      setHasMore(more)
    } catch (error) {
      console.error('Dashboard fetchInitialRequests error:', error)
      setFetchError('تعذّر تحميل الطلبات. تحقق من اتصالك بالإنترنت.')
    } finally {
      setLoading(false)
    }
  }, [user?.uid, setRequests, setLastDoc, setHasMore, setLoading])

  useEffect(() => {
    fetchInitialRequests()
  }, [fetchInitialRequests])

  // ===== تحميل المزيد =====
  const handleLoadMore = async () => {
    if (!user?.uid || !hasMore || loadingMore) return

    try {
      setLoadingMore(true)

      const { requests: more, lastDoc: newLastDoc, hasMore: stillMore } =
        await getRequests(user.uid, REQUESTS_PER_PAGE, lastDoc)

      appendRequests(more)
      setLastDoc(newLastDoc)
      setHasMore(stillMore)
    } catch (error) {
      console.error('Dashboard handleLoadMore error:', error)
      toast.error('تعذّر تحميل المزيد من الطلبات')
    } finally {
      setLoadingMore(false)
    }
  }

  // ===== رسالة نفاد الرصيد =====
  const QuotaEmptyBanner = () => (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 flex items-start gap-3"
      style={{
        background: 'rgba(248, 81, 73, 0.07)',
        border: '1px solid rgba(248, 81, 73, 0.2)',
      }}
    >
      <div className="flex-1">
        <p
          className="text-sm font-semibold mb-0.5"
          style={{ color: '#F85149', fontFamily: 'Cairo, sans-serif' }}
        >
          استنفدت طلباتك اليوم
        </p>
        <p
          className="text-xs"
          style={{ color: '#8B949E', fontFamily: 'Noto Sans Arabic, sans-serif' }}
        >
          ستتجدد خلال 24 ساعة — أو قم بترقية خطتك للحصول على 20 طلب يومياً
        </p>
      </div>
    </motion.div>
  )

  return (
    <div
      className="min-h-screen"
      style={{ background: '#0D1117', direction: 'rtl' }}
    >
      {/* ===== شريط التنقل الثابت ===== */}
      <Navbar />

      {/* ===== المحتوى الرئيسي ===== */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-5 sm:gap-6"
        >

          {/* ===== تحية المستخدم ===== */}
          <motion.div variants={itemVariants}>
            <h1
              className="text-xl sm:text-2xl font-bold"
              style={{ color: '#E6EDF3', fontFamily: 'Cairo, sans-serif' }}
            >
              مرحباً، {(user?.displayName || '').split(' ')[0] || 'بك'} 👋
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: '#8B949E', fontFamily: 'Noto Sans Arabic, sans-serif' }}
            >
              ماذا تريد أن تفعل اليوم؟
            </p>
          </motion.div>

          {/* ===== شريط الرصيد ===== */}
          <motion.div variants={itemVariants}>
            <QuotaBar />
          </motion.div>

          {/* ===== بانر نفاد الرصيد ===== */}
          {quotaEmpty && (
            <motion.div variants={itemVariants}>
              <QuotaEmptyBanner />
            </motion.div>
          )}

          {/* ===== بطاقتا الميزات ===== */}
          <motion.div variants={itemVariants}>
            <h2
              className="text-sm font-semibold mb-3"
              style={{ color: '#8B949E', fontFamily: 'Cairo, sans-serif', letterSpacing: '0.03em' }}
            >
              الأدوات
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FeatureCard
                icon={<FileText size={22} strokeWidth={1.6} />}
                title="توليد أسئلة"
                description="حوّل ملف PDF لامتحان احترافي بنمط وزاري أو جامعي أو اختيارات"
                onClick={() => navigate('/exam')}
                disabled={quotaEmpty}
              />
              <FeatureCard
                icon={<BookOpen size={22} strokeWidth={1.6} />}
                title="تلخيص مادة"
                description="احصل على ملخص منظم بمحاور ونقاط بعدد الصفحات الذي تختاره"
                onClick={() => navigate('/summary')}
                disabled={quotaEmpty}
              />
            </div>
          </motion.div>

          {/* ===== سجل الطلبات ===== */}
          <motion.div variants={itemVariants}>
            <h2
              className="text-sm font-semibold mb-3"
              style={{ color: '#8B949E', fontFamily: 'Cairo, sans-serif', letterSpacing: '0.03em' }}
            >
              آخر طلباتك
            </h2>

            {/* حالة التحميل */}
            {loading && (
              <div className="flex justify-center py-10">
                <LoadingSpinner size="md" />
              </div>
            )}

            {/* خطأ في الجلب */}
            {!loading && fetchError && (
              <ErrorMessage
                message={fetchError}
                onRetry={fetchInitialRequests}
              />
            )}

            {/* قائمة الطلبات */}
            {!loading && !fetchError && (requests || []).length > 0 && (
              <div className="flex flex-col gap-2">
                {requests.map((req, idx) => (
                  <motion.div
                    key={req.id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                  >
                    <RequestCard
                      request={req}
                      onClick={() => navigate(`/result/${req.id}`)}
                    />
                  </motion.div>
                ))}

                {/* زر عرض المزيد */}
                {hasMore && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center pt-2"
                  >
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: '#8B949E',
                        border: '1px solid #30363D',
                        fontFamily: 'Cairo, sans-serif',
                        minHeight: '44px',
                      }}
                      onMouseEnter={(e) => {
                        if (!loadingMore) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                          e.currentTarget.style.color = '#E6EDF3'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                        e.currentTarget.style.color = '#8B949E'
                      }}
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          جاري التحميل...
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} />
                          عرض المزيد
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            {/* حالة فارغة */}
            {!loading && !fetchError && (requests || []).length === 0 && (
              <EmptyState
                onClick={() => navigate('/exam')}
              />
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
