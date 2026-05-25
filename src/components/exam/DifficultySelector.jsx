// DifficultySelector.jsx — اختيار مستوى الصعوبة

import React from 'react'
import { motion } from 'framer-motion'
import { DIFFICULTY_LEVELS } from '../../constants/planLimits'

/**
 * DifficultySelector
 * props:
 *   selected (string) — id المستوى المحدد
 *   onSelect (fn) — يُستدعى بـ id المستوى
 *   disabled (bool)
 */
export default function DifficultySelector({ selected, onSelect, disabled = false }) {
  return (
    <div dir="rtl">
      {/* أزرار أفقية — موبايل: عمودية */}
      <div className="flex flex-col sm:flex-row gap-3">
        {DIFFICULTY_LEVELS.map((level, index) => {
          const isSelected = selected === level.id

          // ألوان كل مستوى
          const colors = {
            easy: {
              border: isSelected ? 'border-green-500' : 'border-[#30363D] hover:border-green-500/50',
              bg: isSelected ? 'bg-green-500/10' : 'bg-[#161B22] hover:bg-green-500/5',
              text: isSelected ? 'text-green-400' : 'text-[#E6EDF3]',
              dot: 'bg-green-500',
              desc: 'text-green-400/70',
            },
            medium: {
              border: isSelected ? 'border-orange-500' : 'border-[#30363D] hover:border-orange-500/50',
              bg: isSelected ? 'bg-orange-500/10' : 'bg-[#161B22] hover:bg-orange-500/5',
              text: isSelected ? 'text-orange-400' : 'text-[#E6EDF3]',
              dot: 'bg-orange-500',
              desc: 'text-orange-400/70',
            },
            hard: {
              border: isSelected ? 'border-red-500' : 'border-[#30363D] hover:border-red-500/50',
              bg: isSelected ? 'bg-red-500/10' : 'bg-[#161B22] hover:bg-red-500/5',
              text: isSelected ? 'text-red-400' : 'text-[#E6EDF3]',
              dot: 'bg-red-500',
              desc: 'text-red-400/70',
            },
          }

          const c = colors[level.id]

          return (
            <motion.button
              key={level.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.2 }}
              whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              onClick={() => !disabled && onSelect(level.id)}
              disabled={disabled}
              className={`
                flex-1 p-4 rounded-xl border-2 text-right transition-all duration-200
                flex flex-row sm:flex-col items-center sm:items-start gap-3
                min-h-[48px] sm:min-h-[90px]
                ${c.border} ${c.bg}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* نقطة اللون + الاسم */}
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.dot}`} />
                <span
                  className={`font-bold text-base transition-colors duration-200 ${c.text}`}
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                >
                  {level.name}
                </span>
              </div>

              {/* الوصف — يظهر على الشاشات الكبيرة */}
              <p
                className={`hidden sm:block text-xs leading-relaxed transition-colors duration-200 ${
                  isSelected ? c.desc : 'text-[#8B949E]'
                }`}
                style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}
              >
                {level.description}
              </p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
