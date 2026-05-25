/**
 * FeatureCard.jsx
 * بطاقة ميزة في لوحة التحكم
 * props: icon (ReactNode), title, description, onClick, disabled
 */

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

export default function FeatureCard({
  icon,
  title,
  description,
  onClick,
  disabled = false,
}) {
  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="w-full text-right rounded-xl p-5 sm:p-6 flex items-start gap-4 transition-all duration-200 relative overflow-hidden group"
      style={{
        background: '#161B22',
        border: disabled ? '1px solid #30363D' : '1px solid #30363D',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        minHeight: '48px',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = '#FF6B35'
          e.currentTarget.style.boxShadow = '0 0 16px rgba(255, 107, 53, 0.12)'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = '#30363D'
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
      aria-disabled={disabled}
    >
      {/* أيقونة */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: disabled
            ? 'rgba(139, 148, 158, 0.1)'
            : 'rgba(255, 107, 53, 0.1)',
          color: disabled ? '#8B949E' : '#FF6B35',
        }}
      >
        {icon}
      </div>

      {/* النص */}
      <div className="flex-1 min-w-0">
        <h3
          className="text-base font-bold mb-1"
          style={{
            color: disabled ? '#8B949E' : '#E6EDF3',
            fontFamily: 'Cairo, sans-serif',
          }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: '#8B949E', fontFamily: 'Noto Sans Arabic, sans-serif' }}
        >
          {description}
        </p>
      </div>

      {/* سهم التنقل */}
      {!disabled && (
        <div className="flex-shrink-0 self-center">
          <ChevronLeft
            size={18}
            color="#8B949E"
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
        </div>
      )}
    </motion.button>
  )
}
