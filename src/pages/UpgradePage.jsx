import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  CheckCircle,
  XCircle,
  Zap,
  Shield,
  FileText,
  MessageCircle,
  ArrowRight,
  Crown,
  Loader2,
} from 'lucide-react'

import Navbar from '../components/layout/Navbar'
import { useAuthStore } from '../store/authStore'
import { validateCode, activateCode } from '../services/codes'
import { formatFullDate } from '../utils/formatDate'

// ─── مقارنة الميزات ─────────────────────────────────────────────
const PLAN_FEATURES = [
  {
    label: 'الطلبات اليومية',
    free: '3 طلبات',
    subscribed: '20 طلب',
    icon: Zap,
  },
  {
    label: 'حجم الملف',
    free: 'حتى 10MB',
    subscribed: 'حتى 20MB',
    icon: FileText,
  },
  {
    label: 'جميع أنماط الأسئلة',
    free: true,
    subscribed: true,
    icon: Shield,
  },
  {
    label: 'تلخيص المادة',
    free: true,
    subscribed: true,
    icon: Shield,
  },
  {
    label: 'سجل الطلبات',
    free: true,
    subscribed: true,
    icon: Shield,
  },
  {
    label: 'تحميل PDF وصورة',
    free: true,
    subscribed: true,
    icon: Shield,
  },
]

// ─── مكوّن مقارنة الخطتين ────────────────────────────────────────
function PlanCard({ type, active }) {
  const isFree = type === 'free'
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: isFree ? 0.1 : 0.2 }}
      className={`relative rounded-2xl p-6 border transition-all ${
        !isFree
          ? 'border-[#FF6B35] bg-[#FF6B35]/5 shadow-lg shadow-[#FF6B35]/10'
          : 'border-[#30363D] bg-[#161B22]'
      }`}
    >
      {!isFree && (
        <div className="absolute -top-3 right-1/2 translate-x-1/2">
          <span className="bg-[#FF6B35] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Crown size={12} />
            الأفضل
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3
          className={`text-xl font-bold mb-1 ${
            !isFree ? 'text-[#FF6B35]' : 'text-[#E6EDF3]'
          }`}
        >
          {isFree ? 'مجاني' : 'مشترك ⭐'}
        </h3>
        <div className="text-3xl font-black text-[#E6EDF3] mt-2">
          {isFree ? 'مجاناً' : '10,000'}
        </div>
        {!isFree && (
          <div className="text-[#8B949E] text-sm">دينار عراقي / شهر</div>
        )}
      </div>

      <ul className="space-y-3">
        {PLAN_FEATURES.map((feat) => {
          const val = isFree ? feat.free : feat.subscribed
          const isBoolean = typeof val === 'boolean'
          return (
            <li key={feat.label} className="flex items-center gap-3 text-sm">
              {isBoolean ? (
                val ? (
                  <CheckCircle size={16} className="text-[#3FB950] shrink-0" />
                ) : (
                  <XCircle size={16} className="text-[#8B949E] shrink-0" />
                )
              ) : (
                <CheckCircle
                  size={16}
                  className={`shrink-0 ${
                    !isFree ? 'text-[#FF6B35]' : 'text-[#3FB950]'
                  }`}
                />
              )}
              <span className="text-[#8B949E]">{feat.label}</span>
              {!isBoolean && (
                <span
                  className={`mr-auto font-bold text-xs ${
                    !isFree ? 'text-[#FF6B35]' : 'text-[#E6EDF3]'
                  }`}
                >
                  {val}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      {active && (
        <div className="mt-4 pt-4 border-t border-[#30363D] flex items-center gap-2 text-[#3FB950] text-sm font-bold">
          <CheckCircle size={16} />
          خطتك الحالية
        </div>
      )}
    </motion.div>
  )
}

// ─── الصفحة الرئيسية ─────────────────────────────────────────────
export default function UpgradePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [code, setCode] = useState('')
  const [validating, setValidating] = useState(false)
  const [activating, setActivating] = useState(false)
  const [validationResult, setValidationResult] = useState(null) // { valid, message, durationDays }

  const isSubscribed = user?.plan === 'subscribed'

  const whatsappNumber =
    import.meta.env.VITE_WHATSAPP_NUMBER || '9647800000000'
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'أريد شراء كود اشتراك ExamGen AI'
  )}`

  // ─── التحقق من الكود ─────────────────────────────
  const handleValidate = async () => {
    if (!code.trim()) {
      toast.error('أدخل الكود أولاً')
      return
    }
    try {
      setValidating(true)
      setValidationResult(null)
      const result = await validateCode(code)
      setValidationResult(result)
    } catch (err) {
      setValidationResult({
        valid: false,
        message: err.message || 'خطأ في التحقق من الكود',
      })
    } finally {
      setValidating(false)
    }
  }

  // ─── تفعيل الكود ─────────────────────────────────
  const handleActivate = async () => {
    try {
      setActivating(true)
      await activateCode(code)
      toast.success('🎉 تم تفعيل اشتراكك بنجاح!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'فشل تفعيل الكود')
    } finally {
      setActivating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1117]" dir="rtl">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8 pb-16">
        {/* ─── العنوان ─── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-black text-[#E6EDF3] mb-3">
            طوّر تجربتك
          </h1>
          <p className="text-[#8B949E] text-base md:text-lg">
            احصل على المزيد من الطلبات وملفات أكبر
          </p>
        </motion.div>

        {/* ─── إذا مشترك بالفعل ─── */}
        {isSubscribed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#3FB950]/10 border border-[#3FB950]/30 rounded-2xl p-6 mb-8 text-center"
          >
            <Crown size={36} className="text-[#3FB950] mx-auto mb-3" />
            <h2 className="text-xl font-bold text-[#3FB950] mb-1">
              أنت مشترك بالفعل ✓
            </h2>
            {user?.planExpiresAt && (
              <p className="text-[#8B949E] text-sm">
                ينتهي اشتراكك:{' '}
                <span className="text-[#E6EDF3] font-bold">
                  {formatFullDate(user.planExpiresAt)}
                </span>
              </p>
            )}
          </motion.div>
        )}

        {/* ─── مقارنة الخطط ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <PlanCard type="free" active={!isSubscribed} />
          <PlanCard type="subscribed" active={isSubscribed} />
        </div>

        {/* ─── قسم الكود ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-[#E6EDF3] mb-4 flex items-center gap-2">
            <Zap size={20} className="text-[#FF6B35]" />
            عندك كود اشتراك؟
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setValidationResult(null)
              }}
              placeholder="EXG-XXXX-XXXX-XXXX"
              dir="ltr"
              className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-xl px-4 py-3 text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#FF6B35] transition-colors text-center font-mono tracking-widest text-sm min-h-[48px]"
            />
            <button
              onClick={handleValidate}
              disabled={validating || !code.trim()}
              className="bg-[#FF6B35] hover:bg-[#e55a28] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {validating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                'تحقق من الكود'
              )}
            </button>
          </div>

          {/* نتيجة التحقق */}
          <AnimatePresence>
            {validationResult && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${
                  validationResult.valid
                    ? 'bg-[#3FB950]/10 border border-[#3FB950]/30'
                    : 'bg-[#F85149]/10 border border-[#F85149]/30'
                }`}
              >
                {validationResult.valid ? (
                  <CheckCircle
                    size={20}
                    className="text-[#3FB950] shrink-0 mt-0.5"
                  />
                ) : (
                  <XCircle
                    size={20}
                    className="text-[#F85149] shrink-0 mt-0.5"
                  />
                )}
                <div className="flex-1">
                  <p
                    className={`font-bold text-sm ${
                      validationResult.valid
                        ? 'text-[#3FB950]'
                        : 'text-[#F85149]'
                    }`}
                  >
                    {validationResult.valid ? 'الكود صالح ✓' : 'الكود غير صالح'}
                  </p>
                  {validationResult.message && (
                    <p className="text-[#8B949E] text-xs mt-1">
                      {validationResult.message}
                    </p>
                  )}
                  {validationResult.valid && validationResult.durationDays && (
                    <p className="text-[#8B949E] text-xs mt-1">
                      مدة الاشتراك:{' '}
                      <span className="text-[#E6EDF3] font-bold">
                        {validationResult.durationDays} يوم
                      </span>
                    </p>
                  )}
                </div>

                {validationResult.valid && (
                  <button
                    onClick={handleActivate}
                    disabled={activating}
                    className="bg-[#3FB950] hover:bg-[#2ea043] disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 whitespace-nowrap min-h-[40px]"
                  >
                    {activating ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <>
                        تفعيل الاشتراك
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── قسم الشراء عبر واتساب ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 text-center"
        >
          <MessageCircle
            size={36}
            className="text-[#25D366] mx-auto mb-3"
          />
          <h2 className="text-lg font-bold text-[#E6EDF3] mb-2">
            كيف تحصل على كود اشتراك؟
          </h2>
          <p className="text-[#8B949E] text-sm mb-5 max-w-xs mx-auto">
            تواصل معنا عبر واتساب، ادفع عبر زين كاش، واستلم كودك فوراً
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold px-6 py-3 rounded-xl transition-colors min-h-[48px]"
          >
            <MessageCircle size={20} />
            تواصل عبر واتساب
          </a>
        </motion.div>
      </div>
    </div>
  )
}
