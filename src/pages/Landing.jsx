import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  FileText,
  BookOpen,
  Zap,
  Upload,
  Settings2,
  Download,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  GraduationCap,
} from 'lucide-react'

// ─── ثوابت ──────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: FileText,
    title: 'توليد أسئلة',
    description:
      '9 أنماط مختلفة — وزاري، اختيارات، صح وخطأ، جامعي وأكثر. بأسلوب وزارة التربية العراقية الحقيقي.',
    color: '#FF6B35',
  },
  {
    icon: BookOpen,
    title: 'تلخيص المادة',
    description:
      'ملخص منظم بمحاور ونقاط رئيسية. اختر عدد الصفحات وستحصل على ملخص دقيق وشامل.',
    color: '#58A6FF',
  },
  {
    icon: Zap,
    title: 'نتائج فورية',
    description:
      'لا انتظار طويل. رفع الملف، اختر الخيارات، واحصل على ورقة الامتحان في ثوانٍ.',
    color: '#3FB950',
  },
]

const HOW_IT_WORKS = [
  {
    step: '١',
    title: 'ارفع ملف المادة',
    desc: 'اسحب وأفلت ملف PDF الخاص بمادتك الدراسية',
    icon: Upload,
  },
  {
    step: '٢',
    title: 'اختر النمط والفصول',
    desc: 'حدد نمط الأسئلة والفصول التي تريدها والصعوبة',
    icon: Settings2,
  },
  {
    step: '٣',
    title: 'حمّل ورقة الامتحان',
    desc: 'احصل على ورقة امتحان احترافية بصيغة PDF أو صورة',
    icon: Download,
  },
]

const PLANS = [
  {
    name: 'مجاني',
    price: 'مجاناً',
    unit: '',
    features: [
      '3 طلبات يومياً',
      'ملفات حتى 10MB',
      '9 أنماط أسئلة',
      'تلخيص المادة',
      'تحميل PDF وصورة',
    ],
    cta: 'ابدأ مجاناً',
    highlight: false,
  },
  {
    name: 'مشترك ⭐',
    price: '10,000',
    unit: 'دينار / شهر',
    features: [
      '20 طلب يومياً',
      'ملفات حتى 20MB',
      '9 أنماط أسئلة',
      'تلخيص المادة',
      'تحميل PDF وصورة',
    ],
    cta: 'اشترك الآن',
    highlight: true,
  },
]

// ─── مكوّنات مساعدة ─────────────────────────────────────────────

function FadeInSection({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function FeatureCard({ feature, index }) {
  const Icon = feature.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.12, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 flex flex-col gap-4 cursor-default"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: feature.color + '20' }}
      >
        <Icon size={24} style={{ color: feature.color }} />
      </div>
      <div>
        <h3 className="text-[#E6EDF3] font-bold text-lg mb-2">
          {feature.title}
        </h3>
        <p className="text-[#8B949E] text-sm leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  )
}

function StepCard({ step, index }) {
  const Icon = step.icon
  return (
    <FadeInSection delay={index * 0.15} className="text-center flex flex-col items-center gap-3">
      {/* رقم الخطوة */}
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-[#FF6B35]/10 border-2 border-[#FF6B35]/30 flex items-center justify-center">
          <Icon size={22} className="text-[#FF6B35]" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FF6B35] flex items-center justify-center">
          <span className="text-white text-xs font-black">{index + 1}</span>
        </div>
      </div>
      <h3 className="text-[#E6EDF3] font-bold">{step.title}</h3>
      <p className="text-[#8B949E] text-sm max-w-[200px]">{step.desc}</p>
    </FadeInSection>
  )
}

function PlanCard({ plan, onCta, index }) {
  return (
    <FadeInSection
      delay={0.1 + index * 0.15}
      className={`relative rounded-2xl p-6 border flex flex-col gap-5 ${
        plan.highlight
          ? 'border-[#FF6B35] bg-[#FF6B35]/5 shadow-xl shadow-[#FF6B35]/10'
          : 'border-[#30363D] bg-[#161B22]'
      }`}
    >
      {plan.highlight && (
        <div className="absolute -top-3 right-1/2 translate-x-1/2">
          <span className="bg-[#FF6B35] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles size={11} />
            الأكثر طلباً
          </span>
        </div>
      )}

      <div>
        <h3
          className={`text-xl font-bold mb-1 ${
            plan.highlight ? 'text-[#FF6B35]' : 'text-[#E6EDF3]'
          }`}
        >
          {plan.name}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-[#E6EDF3]">
            {plan.price}
          </span>
          {plan.unit && (
            <span className="text-[#8B949E] text-sm">{plan.unit}</span>
          )}
        </div>
      </div>

      <ul className="space-y-2 flex-1">
        {plan.features.map((feat) => (
          <li key={feat} className="flex items-center gap-2 text-sm">
            <CheckCircle
              size={15}
              className={plan.highlight ? 'text-[#FF6B35]' : 'text-[#3FB950]'}
            />
            <span className="text-[#8B949E]">{feat}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onCta}
        className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 min-h-[48px] ${
          plan.highlight
            ? 'bg-[#FF6B35] hover:bg-[#e55a28] text-white shadow-lg shadow-[#FF6B35]/30'
            : 'bg-[#30363D] hover:bg-[#3D444D] text-[#E6EDF3]'
        }`}
      >
        {plan.cta}
        <ArrowLeft size={16} />
      </button>
    </FadeInSection>
  )
}

// ─── الصفحة الرئيسية ─────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()

  const handleStart = () => navigate('/auth')

  return (
    <div className="min-h-screen bg-[#0D1117] overflow-x-hidden" dir="rtl">
      {/* ─── Navbar بسيط ─── */}
      <nav className="border-b border-[#30363D] bg-[#0D1117]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#FF6B35] p-2 rounded-lg">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="text-[#E6EDF3] font-black text-lg">
              ExamGen <span className="text-[#FF6B35]">AI</span>
            </span>
          </div>
          <button
            onClick={handleStart}
            className="bg-[#FF6B35] hover:bg-[#e55a28] text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm min-h-[40px]"
          >
            ابدأ مجاناً
          </button>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative max-w-5xl mx-auto px-4 py-16 md:py-24 text-center overflow-hidden">
        {/* خلفية زخرفية */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#FF6B35]/5 blur-3xl" />
        </div>

        {/* شارة */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-[#FF6B35]/10 border border-[#FF6B35]/30 px-4 py-2 rounded-full mb-6"
        >
          <Sparkles size={14} className="text-[#FF6B35]" />
          <span className="text-[#FF6B35] text-xs font-bold">
            مدعوم بـ Gemini AI
          </span>
        </motion.div>

        {/* العنوان */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl md:text-6xl font-black text-[#E6EDF3] mb-5 leading-tight"
        >
          حوّل مادتك إلى{' '}
          <span className="text-[#FF6B35]">امتحان احترافي</span>
        </motion.h1>

        {/* الوصف */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-[#8B949E] text-base md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          ارفع ملف PDF واحصل على ورقة امتحان بأسلوب وزارة التربية العراقية
          في ثوانٍ — مع الأجوبة النموذجية والتحميل الفوري
        </motion.p>

        {/* زر CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={handleStart}
            className="bg-[#FF6B35] hover:bg-[#e55a28] text-white font-black px-8 py-4 rounded-2xl transition-all text-lg shadow-xl shadow-[#FF6B35]/30 hover:shadow-[#FF6B35]/50 hover:-translate-y-0.5 flex items-center gap-2 min-h-[56px] w-full sm:w-auto justify-center"
          >
            <Sparkles size={20} />
            ابدأ مجاناً الآن
          </button>
          <span className="text-[#8B949E] text-sm">
            لا تحتاج بطاقة بنكية
          </span>
        </motion.div>

        {/* إحصائيات */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12 text-center"
        >
          {[
            { label: 'نمط أسئلة', value: '9' },
            { label: 'فصول دراسية', value: '20' },
            { label: 'ثوانٍ للتوليد', value: '<30' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-black text-[#FF6B35]">
                {stat.value}
              </div>
              <div className="text-[#8B949E] text-xs">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── الميزات ─── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <FadeInSection className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-[#E6EDF3] mb-3">
            كل ما تحتاجه في مكان واحد
          </h2>
          <p className="text-[#8B949E] text-sm md:text-base max-w-lg mx-auto">
            أدوات ذكية صُممت خصيصاً للطلاب والأساتذة العراقيين
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => (
            <FeatureCard key={feat.title} feature={feat} index={i} />
          ))}
        </div>
      </section>

      {/* ─── كيف يعمل ─── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <FadeInSection className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#E6EDF3] mb-3">
            كيف يعمل؟
          </h2>
          <p className="text-[#8B949E] text-sm md:text-base">
            ثلاث خطوات بسيطة وستكون جاهزاً
          </p>
        </FadeInSection>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          {/* خط يربط الخطوات (سطح المكتب) */}
          <div className="hidden md:block absolute top-7 right-[calc(16.7%+28px)] left-[calc(16.7%+28px)] h-0.5 bg-gradient-to-l from-[#FF6B35]/20 via-[#FF6B35]/40 to-[#FF6B35]/20" />

          {HOW_IT_WORKS.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} />
          ))}
        </div>
      </section>

      {/* ─── الأنماط ─── */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <FadeInSection className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-black text-[#E6EDF3] mb-2 text-center">
            9 أنماط أسئلة احترافية
          </h2>
          <p className="text-[#8B949E] text-sm text-center mb-6">
            من الوزاري الحقيقي إلى بنك الأسئلة الشامل
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              'وزاري',
              'نصف السنة',
              'اختيار من متعدد',
              'صح وخطأ',
              'تعريفات ومفاهيم',
              'علل وفسّر',
              'مقارنة',
              'جامعي',
              'بنك أسئلة',
            ].map((pattern, i) => (
              <motion.span
                key={pattern}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-[#0D1117] border border-[#30363D] text-[#8B949E] px-3 py-1.5 rounded-lg text-sm hover:border-[#FF6B35]/50 hover:text-[#FF6B35] transition-colors cursor-default"
              >
                {pattern}
              </motion.span>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ─── الأسعار ─── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <FadeInSection className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-[#E6EDF3] mb-3">
            خطة لكل احتياج
          </h2>
          <p className="text-[#8B949E] text-sm md:text-base">
            ابدأ مجاناً، واشترك عندما تحتاج المزيد
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PLANS.map((plan, i) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              index={i}
              onCta={handleStart}
            />
          ))}
        </div>
      </section>

      {/* ─── CTA ختامي ─── */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <FadeInSection>
          <div className="bg-gradient-to-b from-[#161B22] to-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-3xl p-10 md:p-16">
            <h2 className="text-2xl md:text-4xl font-black text-[#E6EDF3] mb-4">
              جاهز تبدأ؟
            </h2>
            <p className="text-[#8B949E] mb-8 max-w-md mx-auto">
              انضم الآن وولّد أول امتحانك مجاناً
            </p>
            <button
              onClick={handleStart}
              className="bg-[#FF6B35] hover:bg-[#e55a28] text-white font-black px-8 py-4 rounded-2xl transition-all text-lg shadow-xl shadow-[#FF6B35]/30 hover:shadow-[#FF6B35]/50 hover:-translate-y-0.5 inline-flex items-center gap-2 min-h-[56px]"
            >
              <Sparkles size={20} />
              ابدأ مجاناً
            </button>
          </div>
        </FadeInSection>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#30363D] py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-[#FF6B35] p-1.5 rounded-lg">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="text-[#E6EDF3] font-black text-sm">
              ExamGen <span className="text-[#FF6B35]">AI</span>
            </span>
          </div>
          <p className="text-[#8B949E] text-sm">
            ExamGen AI © 2025 — صُنع بـ ❤️ للطلاب العراقيين
          </p>
        </div>
      </footer>
    </div>
  )
}
