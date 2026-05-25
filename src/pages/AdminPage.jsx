import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ShieldAlert,
  PlusCircle,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Tag,
} from 'lucide-react'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'

import Navbar from '../components/layout/Navbar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuthStore } from '../store/authStore'
import { createCode } from '../services/codes'
import { db } from '../config/firebase'
import { formatFullDate } from '../utils/formatDate'

// ─── بطاقة كود واحد ──────────────────────────────────────────────
function CodeCard({ codeData, index }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeData.code || codeData.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('فشل النسخ')
    }
  }

  const isUsed = codeData.used === true

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl border transition-all ${
        isUsed
          ? 'border-[#30363D] bg-[#0D1117] opacity-60'
          : 'border-[#FF6B35]/30 bg-[#FF6B35]/5'
      }`}
    >
      {/* الكود */}
      <div className="flex-1 min-w-0">
        <p
          dir="ltr"
          className={`font-mono font-bold text-sm tracking-widest ${
            isUsed ? 'text-[#8B949E]' : 'text-[#E6EDF3]'
          }`}
        >
          {codeData.code || codeData.id}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {/* الحالة */}
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isUsed
                ? 'bg-[#30363D] text-[#8B949E]'
                : 'bg-[#3FB950]/20 text-[#3FB950]'
            }`}
          >
            {isUsed ? 'مستخدم' : 'متاح'}
          </span>

          {/* مدة الاشتراك */}
          {codeData.durationDays && (
            <span className="text-xs text-[#8B949E]">
              {codeData.durationDays} يوم
            </span>
          )}

          {/* تاريخ الإنشاء */}
          {codeData.createdAt && (
            <span className="text-xs text-[#8B949E]">
              {formatFullDate(codeData.createdAt)}
            </span>
          )}

          {/* من استخدمه */}
          {isUsed && codeData.usedBy && (
            <span className="text-xs text-[#8B949E]">
              استخدمه: {codeData.usedBy.slice(0, 8)}...
            </span>
          )}
        </div>
      </div>

      {/* زر النسخ */}
      {!isUsed && (
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 bg-[#161B22] hover:bg-[#30363D] border border-[#30363D] text-[#E6EDF3] px-3 py-2 rounded-lg text-sm transition-colors min-h-[40px] shrink-0"
        >
          {copied ? (
            <>
              <Check size={14} className="text-[#3FB950]" />
              تم النسخ
            </>
          ) : (
            <>
              <Copy size={14} />
              نسخ
            </>
          )}
        </button>
      )}
    </motion.div>
  )
}

// ─── الصفحة الرئيسية ─────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [durationDays, setDurationDays] = useState(30)
  const [generating, setGenerating] = useState(false)
  const [lastGenerated, setLastGenerated] = useState(null)
  const [justCopied, setJustCopied] = useState(false)

  const [codes, setCodes] = useState([])
  const [loadingCodes, setLoadingCodes] = useState(false)
  const [codesError, setCodesError] = useState(null)

  // ─── حماية الصفحة بـ ADMIN_UID ───────────────────
  useEffect(() => {
    const adminUid = import.meta.env.VITE_ADMIN_UID
    if (user && adminUid && user.uid !== adminUid) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  // ─── جلب الكودات من Firestore ─────────────────────
  const fetchCodes = async () => {
    try {
      setLoadingCodes(true)
      setCodesError(null)
      const q = query(
        collection(db, 'codes'),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      const fetched = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        code: d.data().code || d.id,
      }))
      setCodes(fetched)
    } catch (error) {
      console.error('fetchCodes error:', error)
      setCodesError('فشل تحميل الكودات')
    } finally {
      setLoadingCodes(false)
    }
  }

  useEffect(() => {
    fetchCodes()
  }, [])

  // ─── توليد كود جديد ──────────────────────────────
  const handleGenerate = async () => {
    try {
      setGenerating(true)
      const result = await createCode(durationDays)
      const generatedCode = result.code || ''
      setLastGenerated(generatedCode)
      toast.success('تم توليد الكود بنجاح')
    } catch (err) {
      toast.error(err.message || 'فشل توليد الكود')
    } finally {
      setGenerating(false)
    }

    // تحديث قائمة الكودات
    try {
      await fetchCodes()
    } catch {
      // لا تكسر العملية
    }
  }

  // ─── نسخ الكود المولّد ───────────────────────────
  const handleCopyGenerated = async () => {
    try {
      await navigator.clipboard.writeText(lastGenerated)
      setJustCopied(true)
      toast.success('تم نسخ الكود')
      setTimeout(() => setJustCopied(false), 2000)
    } catch {
      toast.error('فشل النسخ')
    }
  }

  // إذا المستخدم لم يُحمَّل بعد
  if (!user) return <LoadingSpinner fullScreen />

  const availableCodes = codes.filter((c) => !c.used)
  const usedCodes = codes.filter((c) => c.used)

  return (
    <div className="min-h-screen bg-[#0D1117]" dir="rtl">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8 pb-16">
        {/* ─── العنوان ─── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 p-3 rounded-xl">
            <ShieldAlert size={24} className="text-[#FF6B35]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#E6EDF3]">لوحة الأدمن</h1>
            <p className="text-[#8B949E] text-sm">ExamGen AI — إدارة الكودات</p>
          </div>
        </motion.div>

        {/* ─── توليد كود جديد ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 mb-6"
        >
          <h2 className="text-base font-bold text-[#E6EDF3] mb-4 flex items-center gap-2">
            <PlusCircle size={18} className="text-[#FF6B35]" />
            توليد كود جديد
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-[#8B949E] text-xs mb-1 block">
                مدة الاشتراك (بالأيام)
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value) || 30)}
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-4 py-3 text-[#E6EDF3] focus:outline-none focus:border-[#FF6B35] transition-colors min-h-[48px]"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full sm:w-auto bg-[#FF6B35] hover:bg-[#e55a28] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px] whitespace-nowrap"
              >
                {generating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <PlusCircle size={18} />
                    توليد كود
                  </>
                )}
              </button>
            </div>
          </div>

          {/* الكود المولّد */}
          {lastGenerated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-[#0D1117] border border-[#FF6B35]/40 rounded-xl flex flex-col sm:flex-row items-center gap-3"
            >
              <Tag size={16} className="text-[#FF6B35] shrink-0" />
              <p
                dir="ltr"
                className="flex-1 font-mono font-bold text-[#FF6B35] text-center sm:text-right tracking-widest"
              >
                {lastGenerated}
              </p>
              <button
                onClick={handleCopyGenerated}
                className="flex items-center gap-2 bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 border border-[#FF6B35]/30 text-[#FF6B35] px-4 py-2 rounded-lg text-sm transition-colors min-h-[40px] shrink-0"
              >
                {justCopied ? (
                  <>
                    <Check size={14} />
                    تم النسخ
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    نسخ الكود
                  </>
                )}
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* ─── قائمة الكودات ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#E6EDF3] flex items-center gap-2">
              <Tag size={18} className="text-[#FF6B35]" />
              الكودات المولّدة
              <span className="text-[#8B949E] text-sm font-normal">
                ({availableCodes.length} متاح / {usedCodes.length} مستخدم)
              </span>
            </h2>
            <button
              onClick={fetchCodes}
              disabled={loadingCodes}
              className="text-[#8B949E] hover:text-[#E6EDF3] transition-colors p-2 rounded-lg hover:bg-[#30363D]"
              title="تحديث"
            >
              <RefreshCw
                size={16}
                className={loadingCodes ? 'animate-spin' : ''}
              />
            </button>
          </div>

          {loadingCodes ? (
            <div className="flex justify-center py-8">
              <Loader2 size={28} className="text-[#FF6B35] animate-spin" />
            </div>
          ) : codesError ? (
            <div className="text-center py-8">
              <p className="text-[#F85149] text-sm">{codesError}</p>
              <button
                onClick={fetchCodes}
                className="mt-3 text-[#FF6B35] text-sm hover:underline"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : codes.length === 0 ? (
            <div className="text-center py-8">
              <Tag size={32} className="text-[#30363D] mx-auto mb-2" />
              <p className="text-[#8B949E] text-sm">لا توجد كودات بعد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* الكودات المتاحة أولاً */}
              {availableCodes.map((c, i) => (
                <CodeCard key={c.id} codeData={c} index={i} />
              ))}
              {/* ثم المستخدمة */}
              {usedCodes.map((c, i) => (
                <CodeCard
                  key={c.id}
                  codeData={c}
                  index={availableCodes.length + i}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
