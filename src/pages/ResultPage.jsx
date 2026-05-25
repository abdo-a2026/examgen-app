import React, { useState, useEffect } from 'react'
import { useParams, useNavigate }      from 'react-router-dom'
import { motion }                       from 'framer-motion'
import { ArrowRight, ChevronDown, ChevronUp, Calendar, Tag } from 'lucide-react'

import Navbar            from '../components/layout/Navbar'
import LoadingSpinner    from '../components/ui/LoadingSpinner'
import ErrorMessage      from '../components/ui/ErrorMessage'
import ExamViewer        from '../components/exam/ExamViewer'
import ExamDownloader    from '../components/exam/ExamDownloader'
import SummaryViewer     from '../components/summary/SummaryViewer'
import SummaryDownloader from '../components/summary/SummaryDownloader'

import { useAuthStore }      from '../store/authStore'
import { getRequestById }    from '../services/requests'
import { formatFullDate }    from '../utils/formatDate'

export default function ResultPage() {
  const { requestId } = useParams()
  const navigate       = useNavigate()
  const { user }       = useAuthStore()

  const [loading,       setLoading]       = useState(true)
  const [request,       setRequest]       = useState(null)
  const [error,         setError]         = useState(null)

  // حالة عرض الإجابات / النقاط
  const [showAnswers,   setShowAnswers]   = useState(false)
  const [showKeyPoints, setShowKeyPoints] = useState(true)

  // ─── جلب الطلب من Firestore ──────────────────────────────────────────────
  const fetchRequest = async () => {
    if (!user?.uid || !requestId) {
      setError('معرّف الطلب غير صالح')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await getRequestById(user.uid, requestId)

      if (!data) {
        setError('الطلب غير موجود أو تم حذفه')
        setLoading(false)
        return
      }

      setRequest(data)
    } catch (err) {
      console.error('ResultPage fetchRequest error:', err)
      setError(err.message || 'فشل تحميل الطلب — تحقق من الاتصال')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, user?.uid])

  // ─── نص نوع الطلب ────────────────────────────────────────────────────────
  const typeLabel = request?.type === 'exam' ? 'امتحان' : 'ملخص'
  const typeColor = request?.type === 'exam' ? '#FF6B35' : '#3FB950'

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div dir="rtl" className="min-h-screen" style={{ background: '#0D1117' }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ─── مسار التنقل ─── */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-sm transition-colors"
            style={{ color: '#8B949E' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#E6EDF3'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#8B949E'}
          >
            <ArrowRight size={16} />
            الرئيسية
          </button>
          <span style={{ color: '#30363D' }}>/</span>
          <span className="text-sm" style={{ color: '#E6EDF3' }}>
            {request ? request.name : 'عرض الطلب'}
          </span>
        </div>

        {/* ══════════════════════════════════════════════
            حالة التحميل
        ══════════════════════════════════════════════ */}
        {loading && (
          <div className="flex justify-center items-center" style={{ minHeight: '300px' }}>
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* ══════════════════════════════════════════════
            حالة الخطأ
        ══════════════════════════════════════════════ */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-6" style={{ minHeight: '300px' }}>
            <ErrorMessage
              message={error}
              onRetry={fetchRequest}
            />
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                minHeight: '44px',
                padding:   '0 24px',
                background: '#161B22',
                color:      '#8B949E',
                border:     '1px solid #30363D',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#E6EDF3'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#8B949E'}
            >
              <ArrowRight size={16} />
              العودة للرئيسية
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            عرض الطلب
        ══════════════════════════════════════════════ */}
        {!loading && !error && request && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6"
          >
            {/* ─── معلومات الطلب ─── */}
            <div
              className="rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{ background: '#161B22', border: '1px solid #30363D' }}
            >
              <div>
                <h1
                  className="text-xl font-bold mb-2"
                  style={{ color: '#E6EDF3', fontFamily: 'Cairo, sans-serif' }}
                >
                  {request.name || 'طلب بدون اسم'}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: '#8B949E' }}>
                  {/* النوع */}
                  <span className="flex items-center gap-1">
                    <Tag size={14} />
                    <span
                      className="font-semibold"
                      style={{ color: typeColor }}
                    >
                      {typeLabel}
                    </span>
                  </span>

                  {/* التاريخ */}
                  {request.createdAt && (
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatFullDate(request.createdAt)}
                    </span>
                  )}

                  {/* الخيارات */}
                  {request.type === 'exam' && request.options?.pattern && (
                    <span>
                      نمط: <strong style={{ color: '#E6EDF3' }}>{request.options.pattern}</strong>
                    </span>
                  )}
                  {request.type === 'summary' && request.options?.pages && (
                    <span>
                      {request.options.pages}{' '}
                      {request.options.pages === 1 ? 'صفحة' : 'صفحات'}
                    </span>
                  )}
                </div>
              </div>

              {/* أزرار التبديل */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {request.type === 'exam' && (
                  <button
                    onClick={() => setShowAnswers((v) => !v)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    style={{
                      background: showAnswers ? 'rgba(255,107,53,0.12)' : '#0D1117',
                      color:      showAnswers ? '#FF6B35'               : '#8B949E',
                      border:     `1px solid ${showAnswers ? 'rgba(255,107,53,0.3)' : '#30363D'}`,
                      minHeight:  '40px',
                    }}
                  >
                    {showAnswers ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    {showAnswers ? 'إخفاء الأجوبة' : 'الأجوبة النموذجية'}
                  </button>
                )}

                {request.type === 'summary' && (
                  <button
                    onClick={() => setShowKeyPoints((v) => !v)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    style={{
                      background: showKeyPoints ? 'rgba(255,107,53,0.12)' : '#0D1117',
                      color:      showKeyPoints ? '#FF6B35'               : '#8B949E',
                      border:     `1px solid ${showKeyPoints ? 'rgba(255,107,53,0.3)' : '#30363D'}`,
                      minHeight:  '40px',
                    }}
                  >
                    {showKeyPoints ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    {showKeyPoints ? 'إخفاء النقاط' : 'النقاط الرئيسية'}
                  </button>
                )}
              </div>
            </div>

            {/* ─── امتحان ─── */}
            {request.type === 'exam' && request.result && (
              <>
                <ExamDownloader
                  examData={request.result}
                  examName={request.name}
                />
                <ExamViewer
                  examData={request.result}
                  showAnswers={showAnswers}
                />
                <ExamDownloader
                  examData={request.result}
                  examName={request.name}
                />
              </>
            )}

            {/* ─── ملخص ─── */}
            {request.type === 'summary' && request.result && (
              <>
                <SummaryDownloader
                  summaryData={request.result}
                  summaryName={request.name}
                />
                <SummaryViewer
                  summaryData={request.result}
                  showKeyPoints={showKeyPoints}
                />
                <SummaryDownloader
                  summaryData={request.result}
                  summaryName={request.name}
                />
              </>
            )}

            {/* ─── نتيجة فارغة ─── */}
            {!request.result && (
              <div
                className="rounded-xl p-8 text-center"
                style={{ background: '#161B22', border: '1px solid #30363D' }}
              >
                <p style={{ color: '#8B949E' }}>لا توجد بيانات محفوظة لهذا الطلب</p>
              </div>
            )}

            {/* ─── زر العودة ─── */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 rounded-xl text-sm font-medium transition-colors"
                style={{
                  minHeight: '44px',
                  padding:   '0 28px',
                  background: '#161B22',
                  color:      '#8B949E',
                  border:     '1px solid #30363D',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#E6EDF3'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#8B949E'}
              >
                <ArrowRight size={16} />
                العودة للرئيسية
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
