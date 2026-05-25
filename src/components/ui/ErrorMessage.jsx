/**
 * ErrorMessage.jsx
 * رسالة خطأ مع زر إعادة المحاولة الاختياري
 * props: message (string), onRetry (function | null)
 */

import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ErrorMessage({ message = 'حدث خطأ غير متوقع', onRetry = null }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center gap-3 py-8 px-6 text-center rounded-xl"
      style={{
        background: 'rgba(248, 81, 73, 0.06)',
        border: '1px solid rgba(248, 81, 73, 0.25)',
      }}
    >
      <AlertCircle size={28} color="#F85149" strokeWidth={1.5} />

      <p className="text-sm leading-relaxed" style={{ color: '#F85149' }}>
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            background: 'rgba(248, 81, 73, 0.12)',
            color: '#F85149',
            border: '1px solid rgba(248, 81, 73, 0.3)',
            minHeight: '40px',
            fontFamily: 'Cairo, sans-serif',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(248, 81, 73, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(248, 81, 73, 0.12)'
          }}
        >
          <RefreshCw size={14} />
          حاول مجدداً
        </button>
      )}
    </motion.div>
  )
}
