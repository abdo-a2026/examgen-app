/**
 * RequestCard.jsx
 * بطاقة طلب واحد في سجل الطلبات
 * props: request (object), onClick (function)
 */

import React from 'react'
import { motion } from 'framer-motion'
import { FileText, BookOpen, ChevronLeft } from 'lucide-react'
import { formatRelativeDate } from '../../utils/formatDate'

export default function RequestCard({ request, onClick }) {
  const isExam = request?.type === 'exam'

  const TypeIcon = isExam ? FileText : BookOpen
  const iconColor = isExam ? '#FF6B35' : '#3FB950'
  const iconBg = isExam
    ? 'rgba(255, 107, 53, 0.1)'
    : 'rgba(63, 185, 80, 0.1)'

  const typeLabel = isExam ? 'امتحان' : 'ملخص'
  const requestName = request?.name || 'طلب بدون اسم'
  const dateText = formatRelativeDate(request?.createdAt)

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full text-right flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group"
      style={{
        background: '#161B22',
        border: '1px solid #30363D',
        minHeight: '64px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#484F58'
        e.currentTarget.style.background = 'rgba(22, 27, 34, 0.8)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#30363D'
        e.currentTarget.style.background = '#161B22'
      }}
    >
      {/* أيقونة النوع */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <TypeIcon size={16} color={iconColor} strokeWidth={1.8} />
      </div>

      {/* اسم الطلب والنوع */}
      <div className="flex-1 min-w-0 text-right">
        <p
          className="text-sm font-medium truncate"
          style={{ color: '#E6EDF3', fontFamily: 'Cairo, sans-serif' }}
        >
          {requestName}
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ color: '#8B949E', fontFamily: 'Noto Sans Arabic, sans-serif' }}
        >
          {typeLabel}
        </p>
      </div>

      {/* التاريخ النسبي */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="text-xs"
          style={{ color: '#6E7681', fontFamily: 'Cairo, sans-serif' }}
        >
          {dateText}
        </span>
        <ChevronLeft
          size={14}
          color="#484F58"
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        />
      </div>
    </motion.button>
  )
}
