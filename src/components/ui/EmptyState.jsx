/**
 * EmptyState.jsx
 * حالة السجل الفارغ
 * props: onClick (دالة زر "ابدأ الآن")
 */

import React from 'react'
import { FileQuestion } from 'lucide-react'
import { motion } from 'framer-motion'

export default function EmptyState({ onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-14 px-6 text-center"
    >
      {/* أيقونة دائرية مع توهج خفيف */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{
          background: 'rgba(255, 107, 53, 0.08)',
          border: '1px solid rgba(255, 107, 53, 0.2)',
        }}
      >
        <FileQuestion size={36} color="#FF6B35" strokeWidth={1.5} />
      </div>

      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: '#E6EDF3', fontFamily: 'Cairo, sans-serif' }}
      >
        لا توجد طلبات بعد
      </h3>

      <p className="text-sm mb-6 max-w-xs leading-relaxed" style={{ color: '#8B949E' }}>
        ابدأ بتوليد أسئلة أو تلخيص مادة وستظهر هنا جميع طلباتك
      </p>

      {onClick && (
        <button
          onClick={onClick}
          className="px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            background: '#FF6B35',
            color: '#ffffff',
            fontFamily: 'Cairo, sans-serif',
            minHeight: '48px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e85d29'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FF6B35'
          }}
        >
          ابدأ الآن
        </button>
      )}
    </motion.div>
  )
}
