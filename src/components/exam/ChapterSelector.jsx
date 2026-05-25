// ChapterSelector.jsx — اختيار الفصول (1-20) مع multi-select

import React from 'react'
import { motion } from 'framer-motion'

const ALL_CHAPTERS = Array.from({ length: 20 }, (_, i) => i + 1)

/**
 * ChapterSelector
 * props:
 *   selected (number[]) — الفصول المختارة
 *   onSelect (fn) — يُستدعى بالمصفوفة الجديدة
 *   disabled (bool)
 */
export default function ChapterSelector({ selected = [], onSelect, disabled = false }) {
  const isAllSelected = selected.length === ALL_CHAPTERS.length

  const toggleChapter = (num) => {
    if (disabled) return
    if (selected.includes(num)) {
      onSelect(selected.filter((c) => c !== num))
    } else {
      onSelect([...selected, num].sort((a, b) => a - b))
    }
  }

  const toggleAll = () => {
    if (disabled) return
    if (isAllSelected) {
      onSelect([])
    } else {
      onSelect([...ALL_CHAPTERS])
    }
  }

  const getSelectionText = () => {
    if (selected.length === 0) {
      return 'لم تختر فصولاً — سيشمل كل المادة'
    }
    if (isAllSelected) {
      return 'جميع الفصول محددة'
    }
    return `الفصول المختارة: ${selected.join('، ')}`
  }

  return (
    <div dir="rtl">
      {/* زر "كل الفصول" */}
      <div className="mb-3">
        <motion.button
          whileHover={!disabled ? { scale: 1.02 } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
          onClick={toggleAll}
          disabled={disabled}
          className={`
            px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200
            ${
              isAllSelected
                ? 'bg-[#FF6B35] border-[#FF6B35] text-white'
                : 'bg-[#161B22] border-[#30363D] text-[#E6EDF3] hover:border-[#FF6B35]/60'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          style={{ fontFamily: 'Cairo, sans-serif' }}
        >
          {isAllSelected ? '✓ كل الفصول' : 'كل الفصول'}
        </motion.button>
      </div>

      {/* شبكة الفصول */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {ALL_CHAPTERS.map((num, index) => {
          const isSelected = selected.includes(num)
          return (
            <motion.button
              key={num}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02, duration: 0.15 }}
              whileHover={!disabled ? { scale: 1.08 } : {}}
              whileTap={!disabled ? { scale: 0.92 } : {}}
              onClick={() => toggleChapter(num)}
              disabled={disabled}
              className={`
                h-11 rounded-xl text-sm font-bold border-2 transition-all duration-200
                min-h-[44px]
                ${
                  isSelected
                    ? 'bg-[#FF6B35] border-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/20'
                    : 'bg-[#161B22] border-[#30363D] text-[#E6EDF3] hover:border-[#FF6B35]/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{ fontFamily: 'Cairo, sans-serif' }}
            >
              {num}
            </motion.button>
          )
        })}
      </div>

      {/* نص الفصول المختارة */}
      <motion.p
        key={selected.join(',')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={`mt-3 text-sm ${
          selected.length === 0 ? 'text-[#8B949E]' : 'text-[#FF6B35]'
        }`}
        style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}
      >
        {getSelectionText()}
      </motion.p>
    </div>
  )
}
