// ExamPage.jsx — صفحة توليد الأسئلة الكاملة

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
  FileText,
} from 'lucide-react'

import { useAuthStore } from '../store/authStore'
import { useRequestsStore } from '../store/requestsStore'
import { checkQuota, incrementUsage } from '../services/quota'
import { saveRequest } from '../services/requests'
import { generateExam } from '../services/api'

import Navbar from '../components/layout/Navbar'
import FileDropzone from '../components/exam/FileDropzone'
import PatternSelector from '../components/exam/PatternSelector'
import ChapterSelector from '../components/exam/ChapterSelector'
import DifficultySelector from '../components/exam/DifficultySelector'
import ExamViewer from '../components/exam/ExamViewer'
import ExamDownloader from '../components/exam/ExamDownloader'
import LoadingMessages from '../components/ui/LoadingMessages'
import ErrorMessage from '../components/ui/ErrorMessage'

// ألوان الهوية
const COLORS = {
  bg: '#0D1117',
  card: '#161B22',
  accent: '#FF6B35',
  textPrimary: '#E6EDF3',
  textSecondary: '#8B949E',
  border: '#30363D',
}

export default function ExamPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addRequest } = useRequestsStore()

  // حالات النموذج
  const [examName, setExamName] = useState('')
  const [pdfBase64, setPdfBase64] = useState(null)
  const [pdfFileName, setPdfFileName] = useState('')
  const [selectedPattern, setSelectedPattern] = useState('')
  const [selectedChapters, setSelectedChapters] = useState([])
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')

  // حالات التوليد
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [examData, setExamData] = useState(null)
  const [showAnswers, setShowAnswers] = useState(false)

  // validation وضع الزر
  const canGenerate =
    examName.trim().length > 0 &&
    pdfBase64 !== null &&
    selectedPattern !== '' &&
    !loading

  // الحصول على الحد المسموح به للملف
  const maxFileSizeMB = user?.plan === 'subscribed' ? 20 : 10

  const handleFileSelect = (base64, fileName, sizeMB) => {
    setPdfBase64(base64)
    setPdfFileName(fileName || '')
  }

  const handleGenerate = async () => {
    if (!canGenerate) return

    setError(null)

    // التحقق من اسم الطلب
    if (!examName.trim()) {
      setError('يرجى إدخال اسم للطلب')
      return
    }

    // التحقق من الملف
    if (!pdfBase64) {
      setError('يرجى رفع ملف PDF أولاً')
      return
    }

    // التحقق من النمط
    if (!selectedPattern) {
      setError('يرجى اختيار نمط الأسئلة')
      return
    }

    try {
      // 1. التحقق من الرصيد
      const quota = await checkQuota(user.uid)
      if (!quota.allowed) {
        setError(`نفد رصيدك اليومي — سيتجدد بعد ${quota.resetIn}`)
        toast.error('نفد الرصيد اليومي')
        return
      }
    } catch (err) {
      console.error('checkQuota error:', err)
      // نكمل حتى لو فشل checkQuota — الباك اند يتحقق أيضاً
    }

    setLoading(true)

    try {
      // 2. توليد الأسئلة
      const options = {
        pattern: selectedPattern,
        chapters: selectedChapters,
        difficulty: selectedDifficulty,
        subject: examName.trim(),
      }

      const result = await generateExam(pdfBase64, options)

      // 3. خصم من الرصيد
      try {
        await incrementUsage(user.uid)
      } catch (err) {
        console.warn('incrementUsage warn:', err)
      }

      // 4. حفظ الطلب في Firestore
      let savedRequestId = null
      try {
        const requestData = {
          name: examName.trim(),
          type: 'exam',
          options,
          result,
        }
        savedRequestId = await saveRequest(user.uid, requestData)

        // 5. إضافة للـ store محلياً
        addRequest({
          id: savedRequestId,
          name: examName.trim(),
          type: 'exam',
          options,
          result,
          createdAt: new Date(),
        })
      } catch (err) {
        console.warn('saveRequest warn:', err)
        // لا نوقف التوليد بسبب خطأ الحفظ
      }

      setExamData(result)
      toast.success('تم توليد الأسئلة بنجاح ✓')
    } catch (err) {
      console.error('handleGenerate error:', err)
      setError(err.message || 'حدث خطأ أثناء التوليد — يرجى المحاولة مجدداً')
      toast.error('فشل توليد الأسئلة')
    } finally {
      setLoading(false)
    }
  }

  const handleNewRequest = () => {
    setExamData(null)
    setShowAnswers(false)
    setError(null)
    setExamName('')
    setPdfBase64(null)
    setPdfFileName('')
    setSelectedPattern('')
    setSelectedChapters([])
    setSelectedDifficulty('medium')
  }

  return (
    <div
      dir="rtl"
      style={{ backgroundColor: COLORS.bg, minHeight: '100vh' }}
      className="flex flex-col"
    >
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">

        {/* رأس الصفحة */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-sm transition-colors duration-200"
            style={{ color: COLORS.textSecondary, fontFamily: 'Noto Sans Arabic, sans-serif' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.textSecondary)}
          >
            <ArrowRight className="w-4 h-4" />
            العودة
          </button>

          <div
            className="w-px h-5"
            style={{ backgroundColor: COLORS.border }}
          />

          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: COLORS.accent }} />
            <h1
              className="text-xl font-bold"
              style={{ color: COLORS.textPrimary, fontFamily: 'Cairo, sans-serif' }}
            >
              توليد الأسئلة
            </h1>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ========== حالة: النموذج (قبل التوليد) ========== */}
          {!examData && !loading && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* 1. اسم الطلب */}
              <SectionCard title="اسم الطلب" required>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="مثال: امتحان الفيزياء — الفصل الثالث"
                  maxLength={80}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    backgroundColor: '#0D1117',
                    border: `2px solid ${examName ? COLORS.accent : COLORS.border}`,
                    color: COLORS.textPrimary,
                    fontFamily: 'Noto Sans Arabic, sans-serif',
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = COLORS.accent)
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = examName
                      ? COLORS.accent
                      : COLORS.border)
                  }
                />
              </SectionCard>

              {/* 2. الملف */}
              <SectionCard title="ملف المادة" required>
                <FileDropzone
                  onFileSelect={handleFileSelect}
                  maxSizeMB={maxFileSizeMB}
                  disabled={loading}
                />
              </SectionCard>

              {/* 3. نمط الأسئلة */}
              <SectionCard title="نمط الأسئلة" required>
                <PatternSelector
                  selected={selectedPattern}
                  onSelect={setSelectedPattern}
                  disabled={loading}
                />
              </SectionCard>

              {/* 4. الفصول */}
              <SectionCard title="الفصول الدراسية">
                <ChapterSelector
                  selected={selectedChapters}
                  onSelect={setSelectedChapters}
                  disabled={loading}
                />
              </SectionCard>

              {/* 5. الصعوبة */}
              <SectionCard title="مستوى الصعوبة">
                <DifficultySelector
                  selected={selectedDifficulty}
                  onSelect={setSelectedDifficulty}
                  disabled={loading}
                />
              </SectionCard>

              {/* رسالة الخطأ */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <ErrorMessage
                      message={error}
                      onRetry={() => setError(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* زر التوليد */}
              <motion.button
                whileHover={canGenerate ? { scale: 1.02 } : {}}
                whileTap={canGenerate ? { scale: 0.98 } : {}}
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base transition-all duration-200"
                style={{
                  minHeight: '56px',
                  fontFamily: 'Cairo, sans-serif',
                  backgroundColor: canGenerate ? COLORS.accent : '#2D2D2D',
                  color: canGenerate ? '#fff' : COLORS.textSecondary,
                  cursor: canGenerate ? 'pointer' : 'not-allowed',
                  boxShadow: canGenerate
                    ? `0 4px 24px ${COLORS.accent}33`
                    : 'none',
                }}
              >
                <Sparkles className="w-5 h-5" />
                ولّد الأسئلة الآن
              </motion.button>

              {/* تلميح للمستخدم */}
              {!canGenerate && (
                <p
                  className="text-center text-xs"
                  style={{
                    color: COLORS.textSecondary,
                    fontFamily: 'Noto Sans Arabic, sans-serif',
                  }}
                >
                  يجب إدخال الاسم + رفع الملف + اختيار النمط
                </p>
              )}
            </motion.div>
          )}

          {/* ========== حالة: التوليد جاري ========== */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <LoadingMessages />
            </motion.div>
          )}

          {/* ========== حالة: النتيجة ========== */}
          {examData && !loading && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* شريط الأدوات */}
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl"
                style={{
                  backgroundColor: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" style={{ color: COLORS.accent }} />
                  <span
                    className="font-semibold"
                    style={{ color: COLORS.textPrimary, fontFamily: 'Cairo, sans-serif' }}
                  >
                    {examName}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* زر الأجوبة */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAnswers(!showAnswers)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border-2 min-h-[40px]"
                    style={{
                      backgroundColor: showAnswers ? `${COLORS.accent}20` : 'transparent',
                      borderColor: showAnswers ? COLORS.accent : COLORS.border,
                      color: showAnswers ? COLORS.accent : COLORS.textSecondary,
                      fontFamily: 'Cairo, sans-serif',
                    }}
                  >
                    {showAnswers ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    {showAnswers ? 'إخفاء الأجوبة' : 'عرض الأجوبة'}
                  </motion.button>

                  {/* زر طلب جديد */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNewRequest}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border-2 min-h-[40px]"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.textSecondary,
                      fontFamily: 'Cairo, sans-serif',
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    طلب جديد
                  </motion.button>
                </div>
              </div>

              {/* أزرار التحميل */}
              <ExamDownloader examName={examName} />

              {/* ورقة الامتحان */}
              <div
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{ border: `1px solid ${COLORS.border}` }}
              >
                <ExamViewer examData={examData} showAnswers={showAnswers} />
              </div>

              {/* أزرار التحميل (نسخة ثانية أسفل الصفحة) */}
              <ExamDownloader examName={examName} />

              {/* زر العودة */}
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 rounded-xl text-sm font-medium transition-colors duration-200 min-h-[48px]"
                style={{
                  color: COLORS.textSecondary,
                  fontFamily: 'Noto Sans Arabic, sans-serif',
                  border: `1px solid ${COLORS.border}`,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = COLORS.accent)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = COLORS.border)
                }
              >
                العودة إلى لوحة التحكم
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

/* ============= مكوّن مساعد: SectionCard ============= */
function SectionCard({ title, required = false, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl p-5"
      style={{
        backgroundColor: '#161B22',
        border: '1px solid #30363D',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <h2
          className="font-bold text-base"
          style={{ color: '#E6EDF3', fontFamily: 'Cairo, sans-serif' }}
        >
          {title}
        </h2>
        {required && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: '#FF6B3520',
              color: '#FF6B35',
              fontFamily: 'Noto Sans Arabic, sans-serif',
            }}
          >
            مطلوب
          </span>
        )}
      </div>
      {children}
    </motion.div>
  )
}
