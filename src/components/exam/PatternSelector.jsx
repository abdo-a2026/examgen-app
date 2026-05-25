// PatternSelector.jsx — اختيار نمط الأسئلة (9 أنماط)

import React from 'react'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  CalendarDays,
  ListChecks,
  CheckCircle,
  BookOpen,
  Lightbulb,
  LayoutList,
  Landmark,
  Database,
} from 'lucide-react'
import { EXAM_PATTERNS } from '../../constants/examPatterns'

// خريطة الأيقونات
const ICON_MAP = {
  GraduationCap,
  CalendarDays,
  ListChecks,
  CheckCircle,
  BookOpen,
  Lightbulb,
  LayoutList,
  Landmark,
  Database,
}

/**
 * PatternSelector
 * props:
 *   selected (string) — id النمط المحدد
 *   onSelect (fn) — يُستدعى بـ id النمط
 *   disabled (bool)
 */
export default function PatternSelector({ selected, onSelect, disabled = false }) {
  return (
    <div dir="rtl">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {EXAM_PATTERNS.map((pattern, index) => {
          const Icon = ICON_MAP[pattern.icon] || GraduationCap
          const isSelected = selected === pattern.id

          return (
            <motion.button
              key={pattern.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.2 }}
              whileHover={!disabled ? { scale: 1.03, y: -2 } : {}}
              whileTap={!disabled ? { scale: 0.97 } : {}}
              onClick={() => !disabled && onSelect(pattern.id)}
              disabled={disabled}
              className={`
                relative p-4 rounded-xl border-2 text-right transition-all duration-200 cursor-pointer
                flex flex-col gap-2 min-h-[80px]
                ${
                  isSelected
                    ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                    : 'border-[#30363D] bg-[#161B22] hover:border-[#FF6B35]/50 hover:bg-[#FF6B35]/5'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {/* أيقونة + اسم */}
              <div className="flex items-center gap-2">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${
                    isSelected ? 'text-[#FF6B35]' : 'text-[#8B949E]'
                  }`}
                />
                <span
                  className={`font-semibold text-sm transition-colors duration-200 ${
                    isSelected ? 'text-[#FF6B35]' : 'text-[#E6EDF3]'
                  }`}
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                >
                  {pattern.name}
                </span>
              </div>

              {/* وصف مختصر */}
              <p
                className="text-[#8B949E] text-xs leading-relaxed"
                style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}
              >
                {pattern.description}
              </p>

              {/* نقطة التحديد */}
              {isSelected && (
                <motion.div
                  layoutId="pattern-indicator"
                  className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#FF6B35]"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}