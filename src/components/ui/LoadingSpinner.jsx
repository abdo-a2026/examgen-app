/**
 * LoadingSpinner.jsx
 * مؤشر تحميل قابل للتخصيص
 * props: size ('sm'|'md'|'lg'), fullScreen (bool)
 */

import React from 'react'

const sizeMap = {
  sm: { outer: 'w-5 h-5', inner: 'border-2' },
  md: { outer: 'w-8 h-8', inner: 'border-2' },
  lg: { outer: 'w-12 h-12', inner: 'border-[3px]' },
}

export default function LoadingSpinner({ size = 'md', fullScreen = false }) {
  const { outer, inner } = sizeMap[size] || sizeMap.md

  const spinner = (
    <div
      className={`
        ${outer} ${inner}
        rounded-full
        border-[#30363D]
        border-t-[#FF6B35]
        animate-spin
      `}
      role="status"
      aria-label="جاري التحميل"
    />
  )

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(13, 17, 23, 0.85)' }}
      >
        <div className="flex flex-col items-center gap-3">
          {/* spinner أكبر للـ fullScreen */}
          <div
            className="w-12 h-12 rounded-full border-[3px] border-[#30363D] border-t-[#FF6B35] animate-spin"
            role="status"
            aria-label="جاري التحميل"
          />
          <p className="text-[#8B949E] text-sm">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return spinner
}
