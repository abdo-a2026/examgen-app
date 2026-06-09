// SummaryPage.jsx — صفحة تلخيص المادة (وضع المنهج + وضع الملف)

import React, { useState } from 'react'
import { useNavigate }            from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Sparkles, RotateCcw,
  ChevronDown, ChevronUp, BookOpen, Upload,
} from 'lucide-react'
import toast from 'react-hot-toast'

import Navbar            from '../components/layout/Navbar'
import FileDropzone      from '../components/exam/FileDropzone'
import CurriculumSelector from '../components/exam/CurriculumSelector'
import PagesSelector     from '../components/summary/PagesSelector'
import SummaryViewer     from '../components/summary/SummaryViewer'
import SummaryDownloader from '../components/summary/SummaryDownloader'
import LoadingMessages   from '../components/ui/LoadingMessages'
import ErrorMessage      from '../components/ui/ErrorMessage'

import { useAuthStore }     from '../store/authStore'
import { useRequestsStore } from '../store/requestsStore'
import { checkQuota, incrementUsage, getMaxFileSizeMB } from '../services/quota'
import { generateSummary }  from '../services/api'
import { saveRequest }      from '../services/requests'

// ─── ثوابت ────────────────────────────────────────────────────────────────
const INPUT_MODE = {
  CURRICULUM: 'curriculum',
  FILE:       'file',
}

const STAGE = { FORM: 'form', LOADING: 'loading', RESULT: 'result' }

// ─── بطاقة قسم ────────────────────────────────────────────────────────────
function SectionCard({ title, children }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#161B22', border: '1px solid #30363D' }}
    >
      {title && (
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: '#8B949E', fontFamily: 'Cairo, sans-serif' }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

// ─── زر التبديل بين الوضعين ───────────────────────────────────────────────
function ModeTab({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200"
      style={{
        minHeight:       '44px',
        fontFamily:      'Cairo, sans-serif',
        backgroundColor: active ? '#FF6B35' : 'transparent',
        color:           active ? '#fff' : '#8B949E',
        border:          'none',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

// ─── SummaryPage ──────────────────────────────────────────────────────────
export default function SummaryPage() {
  const navigate       = useNavigate()
  const { user }       = useAuthStore()
  const { addRequest } = useRequestsStore()

  // ─── وضع الإدخال ────────────────────────────────────────────────────────
  const [inputMode, setInputMode] = useState(INPUT_MODE.CURRICULUM)

  // ─── حالة النموذج ───────────────────────────────────────────────────────
  const [requestName,   setRequestName]   = useState('')
  const [curriculum,    setCurriculum]    = useState({ stage: '', grade: '', subject: '' })
  const [pdfBase64,     setPdfBase64]     = useState(null)
  const [pdfFileName,   setPdfFileName]   = useState('')
  const [selectedPages, setSelectedPages] = useState(1)

  // ─── حالة الصفحة ────────────────────────────────────────────────────────
  const [stage,         setStage]         = useState(STAGE.FORM)
  const [summaryData,   setSummaryData]   = useState(null)
  const [error,         setError]         = useState(null)
  const [showKeyPoints, setShowKeyPoints] = useState(true)

  const maxSizeMB = getMaxFileSizeMB(user?.plan || 'free')

  // ─── تغيير وضع الإدخال ──────────────────────────────────────────────────
  const handleModeChange = (mode) => {
    setInputMode(mode)
    setError(null)
    if (mode === INPUT_MODE.CURRICULUM) {
      setPdfBase64(null)
      setPdfFileName('')
    } else {
      setCurriculum({ stage: '', grade: '', subject: '' })
    }
  }

  const handleFileSelect = (base64, fileName) => {
    setPdfBase64(base64)
    setPdfFileName(fileName || '')
  }

  // ─── validation ─────────────────────────────────────────────────────────
  const isCurriculumValid =
    curriculum.stage !== '' && curriculum.grade !== '' && curriculum.subject !== ''

  const isFormValid =
    requestName.trim() !== '' &&
    (inputMode === INPUT_MODE.CURRICULUM ? isCurriculumValid : pdfBase64 !== null)

  // ─── إعادة تعيين ────────────────────────────────────────────────────────
  const handleReset = () => {
    setPdfBase64(null)
    setPdfFileName('')
    setSelectedPages(1)
    setRequestName('')
    setCurriculum({ stage: '', grade: '', subject: '' })
    setSummaryData(null)
    setError(null)
    setShowKeyPoints(true)
    setStage(STAGE.FORM)
  }

  // ─── التوليد ────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!requestName.trim()) {
      toast.error('أدخل اسماً للطلب')
      return
    }
    if (inputMode === INPUT_MODE.FILE && !pdfBase64) {
      toast.error('ارفع ملف PDF أولاً')
      return
    }
    if (inputMode === INPUT_MODE.CURRICULUM && !isCurriculumValid) {
      toast.error('اختر المرحلة والصف والمادة')
      return
    }
    if (!user?.uid) {
      toast.error('يجب تسجيل الدخول')
      return
    }

    setError(null)
    setStage(STAGE.LOADING)

    try {
      // 1. التحقق من الرصيد
      let quota
      try {
        quota = await checkQuota(user.uid)
      } catch (e) {
        console.error('checkQuota error:', e)
        throw new Error('فشل التحقق من الرصيد — تحقق من الاتصال')
      }

      if (!quota.allowed) {
        setStage(STAGE.FORM)
        toast.error(`نفد رصيدك اليومي. يتجدد بعد ${quota.resetIn}`)
        return
      }

      // 2. بناء الـ options
      const targetWords = selectedPages * 280
      const options = {
        pages:       selectedPages,
        targetWords,
        subject:     inputMode === INPUT_MODE.CURRICULUM
          ? curriculum.subject
          : requestName.trim(),
        ...(inputMode === INPUT_MODE.CURRICULUM
          ? { grade: curriculum.grade, stage: curriculum.stage }
          : {}
        ),
      }

      // pdfBase64 = null في وضع المنهج
      const pdf = inputMode === INPUT_MODE.FILE ? pdfBase64 : null

      // 3. توليد الملخص
      let result
      try {
        result = await generateSummary(pdf, options)
      } catch (e) {
        console.error('generateSummary error:', e)
        throw e
      }

      // 4. خصم الرصيد
      try {
        await incrementUsage(user.uid)
        useAuthStore.getState().updateUsage({
          count:   (user.dailyUsage?.count || 0) + 1,
          resetAt: user.dailyUsage?.resetAt,
        })
      } catch (e) {
        console.warn('incrementUsage error (non-fatal):', e)
      }

      // 5. حفظ الطلب
      try {
        const saved = await saveRequest(user.uid, {
          name:    requestName.trim(),
          type:    'summary',
          options: { pages: selectedPages, targetWords, ...options },
          result,
        })
        addRequest({
          id:        saved,
          name:      requestName.trim(),
          type:      'summary',
          createdAt: { toDate: () => new Date() },
          options:   { pages: selectedPages, targetWords },
          result,
        })
      } catch (e) {
        console.warn('saveRequest error (non-fatal):', e)
      }

      // 6. عرض النتيجة
      setSummaryData(result)
      setStage(STAGE.RESULT)

    } catch (err) {
      console.error('SummaryPage generate error:', err)
      setError(err.message || 'حدث خطأ غير متوقع')
      setStage(STAGE.FORM)
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  return (
    <div dir="rtl" className="min-h-screen" style={{ background: '#0D1117' }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ─── رأس الصفحة ─── */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-sm transition-colors"
            style={{ color: '#8B949E' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#E6EDF3')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#8B949E')}
          >
            <ArrowRight size={16} />
            الرئيسية
          </button>
          <span style={{ color: '#30363D' }}>/</span>
          <span className="text-sm" style={{ color: '#E6EDF3' }}>تلخيص المادة</span>
        </div>

        <div className="mb-8">
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: '#E6EDF3', fontFamily: 'Cairo, sans-serif' }}
          >
            تلخيص المادة
          </h1>
          <p className="text-sm" style={{ color: '#8B949E' }}>
            اختر مادة من المنهج أو ارفع ملف PDF واحصل على ملخص منظم
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* ══ مرحلة النموذج ══ */}
          {stage === STAGE.FORM && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-5"
            >
              {/* اسم الطلب */}
              <SectionCard title="اسم الطلب">
                <input
                  type="text"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  placeholder="مثال: ملخص الفيزياء — الفصل الأول"
                  maxLength={80}
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                  style={{
                    background:  '#0D1117',
                    border:      '1px solid #30363D',
                    color:       '#E6EDF3',
                    fontFamily:  'Noto Sans Arabic, sans-serif',
                    minHeight:   '48px',
                  }}
                  onFocus={(e)  => (e.target.style.borderColor = '#FF6B35')}
                  onBlur={(e)   => (e.target.style.borderColor = '#30363D')}
                />
              </SectionCard>

              {/* مصدر المادة */}
              <SectionCard title="مصدر المادة">
                {/* Toggle */}
                <div
                  className="flex rounded-xl p-1 mb-5"
                  style={{ backgroundColor: '#0D1117', border: '1px solid #30363D' }}
                >
                  <ModeTab
                    active={inputMode === INPUT_MODE.CURRICULUM}
                    onClick={() => handleModeChange(INPUT_MODE.CURRICULUM)}
                    icon={<BookOpen className="w-4 h-4" />}
                    label="اختيار من المنهج"
                  />
                  <ModeTab
                    active={inputMode === INPUT_MODE.FILE}
                    onClick={() => handleModeChange(INPUT_MODE.FILE)}
                    icon={<Upload className="w-4 h-4" />}
                    label="رفع ملف"
                  />
                </div>

                {/* محتوى الوضع */}
                <AnimatePresence mode="wait">
                  {inputMode === INPUT_MODE.CURRICULUM ? (
                    <motion.div
                      key="curriculum"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CurriculumSelector
                        value={curriculum}
                        onChange={setCurriculum}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="file"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FileDropzone
                        onFileSelect={handleFileSelect}
                        maxSizeMB={maxSizeMB}
                      />
                      <p
                        className="mt-3 text-xs"
                        style={{ color: '#8B949E', fontFamily: 'Noto Sans Arabic, sans-serif' }}
                      >
                        💡 للجامعيين والمحاضرات الصغيرة — حد {maxSizeMB}MB
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SectionCard>

              {/* عدد الصفحات */}
              <SectionCard>
                <PagesSelector
                  selected={selectedPages}
                  onSelect={setSelectedPages}
                />
              </SectionCard>

              {/* خطأ */}
              {error && (
                <ErrorMessage message={error} onRetry={() => setError(null)} />
              )}

              {/* زر التوليد */}
              <motion.button
                onClick={handleGenerate}
                disabled={!isFormValid}
                whileTap={isFormValid ? { scale: 0.97 } : {}}
                className="w-full flex items-center justify-center gap-2 rounded-xl font-bold text-base transition-all duration-200"
                style={{
                  minHeight:  '52px',
                  background: isFormValid ? '#FF6B35' : '#30363D',
                  color:      isFormValid ? '#FFFFFF'  : '#6E7681',
                  border:     'none',
                  cursor:     isFormValid ? 'pointer'  : 'not-allowed',
                  fontFamily: 'Cairo, sans-serif',
                }}
              >
                <Sparkles size={20} />
                لخّص المادة الآن
              </motion.button>

              {/* تلميح */}
              {!isFormValid && (
                <p
                  className="text-center text-xs"
                  style={{ color: '#8B949E', fontFamily: 'Noto Sans Arabic, sans-serif' }}
                >
                  {!requestName.trim()
                    ? 'يجب إدخال اسم الطلب'
                    : inputMode === INPUT_MODE.CURRICULUM
                      ? 'يجب اختيار المرحلة والصف والمادة'
                      : 'يجب رفع ملف PDF'
                  }
                </p>
              )}
            </motion.div>
          )}

          {/* ══ مرحلة التحميل ══ */}
          {stage === STAGE.LOADING && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LoadingMessages type="summary" />
            </motion.div>
          )}

          {/* ══ مرحلة النتيجة ══ */}
          {stage === STAGE.RESULT && summaryData && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-6"
            >
              {/* أدوات التحكم */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <h2
                  className="text-lg font-bold"
                  style={{ color: '#E6EDF3', fontFamily: 'Cairo, sans-serif' }}
                >
                  {requestName}
                </h2>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowKeyPoints((v) => !v)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    style={{
                      background: showKeyPoints ? 'rgba(255,107,53,0.12)' : '#161B22',
                      color:      showKeyPoints ? '#FF6B35' : '#8B949E',
                      border:     `1px solid ${showKeyPoints ? 'rgba(255,107,53,0.3)' : '#30363D'}`,
                      minHeight:  '40px',
                    }}
                  >
                    {showKeyPoints ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    {showKeyPoints ? 'إخفاء النقاط الرئيسية' : 'إظهار النقاط الرئيسية'}
                  </button>

                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    style={{
                      background: '#161B22',
                      color:      '#8B949E',
                      border:     '1px solid #30363D',
                      minHeight:  '40px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#E6EDF3')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#8B949E')}
                  >
                    <RotateCcw size={15} />
                    طلب جديد
                  </button>
                </div>
              </div>

              <SummaryDownloader summaryData={summaryData} summaryName={requestName} />
              <SummaryViewer summaryData={summaryData} showKeyPoints={showKeyPoints} />
              <SummaryDownloader summaryData={summaryData} summaryName={requestName} />

              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors mx-auto"
                style={{
                  minHeight:  '44px',
                  padding:    '0 24px',
                  background: 'transparent',
                  color:      '#8B949E',
                  border:     '1px solid #30363D',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#E6EDF3')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#8B949E')}
              >
                <ArrowRight size={16} />
                العودة للرئيسية
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
