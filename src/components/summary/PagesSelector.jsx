import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Minus, Plus } from 'lucide-react'

const MIN_PAGES = 1
const MAX_PAGES = 30
const WORDS_PER_PAGE = 280

// وصف نصي حسب العدد
function pagesLabel(n) {
  if (n === 1) return 'صفحة واحدة'
  if (n === 2) return 'صفحتان'
  if (n <= 10) return `${n} صفحات`
  return `${n} صفحة`
}

/**
 * PagesSelector
 * props:
 *   selected  : number (1–30) — القيمة الحالية
 *   onSelect  : (pages: number) => void
 *
 * الافتراضي: 2 (يُحدَّد في SummaryPage)
 * onSelect يُرسل رقماً فقط — targetWords يُحسب في SummaryPage
 */
export default function PagesSelector({ selected, onSelect }) {
  const pages = Math.max(MIN_PAGES, Math.min(MAX_PAGES, selected || 2))
  const targetWords = pages * WORDS_PER_PAGE

  const decrement = () => {
    if (pages > MIN_PAGES) onSelect(pages - 1)
  }

  const increment = () => {
    if (pages < MAX_PAGES) onSelect(pages + 1)
  }

  const handleInput = (e) => {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val)) {
      onSelect(Math.max(MIN_PAGES, Math.min(MAX_PAGES, val)))
    }
  }

  return (
    <div dir="rtl" className="w-full">
      {/* ─── Label ─── */}
      <label
        className="flex items-center gap-2 text-sm font-medium mb-4"
        style={{ color: '#8B949E' }}
      >
        <FileText size={15} />
        عدد صفحات الملخص
      </label>

      {/* ─── Stepper ─── */}
      <div className="flex items-center gap-4">

        {/* زر − */}
        <motion.button
          onClick={decrement}
          disabled={pages <= MIN_PAGES}
          whileTap={{ scale: 0.92 }}
          aria-label="تقليل عدد الصفحات"
          style={{
            width:        '52px',
            height:       '52px',
            flexShrink:   0,
            borderRadius: '12px',
            background:   pages <= MIN_PAGES ? '#0D1117' : '#161B22',
            border:       `2px solid ${pages <= MIN_PAGES ? '#21262D' : '#30363D'}`,
            color:        pages <= MIN_PAGES ? '#3D444D' : '#E6EDF3',
            cursor:       pages <= MIN_PAGES ? 'not-allowed' : 'pointer',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            transition:   'all 0.15s',
          }}
        >
          <Minus size={20} />
        </motion.button>

        {/* حقل الرقم */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <input
            type="number"
            min={MIN_PAGES}
            max={MAX_PAGES}
            value={pages}
            onChange={handleInput}
            aria-label="عدد الصفحات"
            style={{
              width:       '100%',
              height:      '64px',
              textAlign:   'center',
              fontSize:    '32px',
              fontWeight:  '800',
              fontFamily:  'Cairo, sans-serif',
              background:  'rgba(255,107,53,0.08)',
              border:      '2px solid #FF6B35',
              borderRadius: '14px',
              color:       '#FF6B35',
              outline:     'none',
              /* إخفاء سهام input number الافتراضية */
              MozAppearance: 'textfield',
            }}
            // إخفاء السهام في Webkit
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.2)'
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none'
              // تصحيح القيمة عند مغادرة الحقل
              const val = parseInt(e.target.value, 10)
              if (isNaN(val) || val < MIN_PAGES) onSelect(MIN_PAGES)
              else if (val > MAX_PAGES) onSelect(MAX_PAGES)
            }}
          />

          {/* وصف + كلمات */}
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-xs" style={{ color: '#8B949E' }}>
              {pagesLabel(pages)}
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: 'rgba(255,107,53,0.85)' }}
            >
              ~ {targetWords.toLocaleString('ar-EG')} كلمة
            </span>
          </div>
        </div>

        {/* زر + */}
        <motion.button
          onClick={increment}
          disabled={pages >= MAX_PAGES}
          whileTap={{ scale: 0.92 }}
          aria-label="زيادة عدد الصفحات"
          style={{
            width:        '52px',
            height:       '52px',
            flexShrink:   0,
            borderRadius: '12px',
            background:   pages >= MAX_PAGES ? '#0D1117' : '#FF6B35',
            border:       `2px solid ${pages >= MAX_PAGES ? '#21262D' : '#FF6B35'}`,
            color:        pages >= MAX_PAGES ? '#3D444D' : '#FFFFFF',
            cursor:       pages >= MAX_PAGES ? 'not-allowed' : 'pointer',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            transition:   'all 0.15s',
          }}
        >
          <Plus size={20} />
        </motion.button>
      </div>

      {/* ─── شريط بصري (1–30) ─── */}
      <div className="mt-4">
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: '4px', background: '#21262D' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: '#FF6B35' }}
            animate={{ width: `${((pages - MIN_PAGES) / (MAX_PAGES - MIN_PAGES)) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: '#3D444D' }}>{MIN_PAGES}</span>
          <span className="text-xs" style={{ color: '#3D444D' }}>{MAX_PAGES}</span>
        </div>
      </div>

      {/* ─── style لإخفاء سهام number input في Webkit ─── */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  )
}
