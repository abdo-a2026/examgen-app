/**
 * LoadingMessages.jsx
 * رسائل تدريجية أثناء التوليد
 * props: type ('exam' | 'summary')
 *
 * تعرض رسالة تتغير كل ثانيتين تقريباً لإشعار المستخدم أن العملية جارية
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from './LoadingSpinner'

const examMessages = [
  'جاري قراءة محتوى الملف...',
  'تحليل المادة الدراسية...',
  'استخراج النقاط الرئيسية...',
  'بناء هيكل الأسئلة...',
  'صياغة الأسئلة بالأسلوب المطلوب...',
  'مراجعة الدرجات والمعلومات...',
  'التحقق من جودة الأسئلة...',
  'الانتهاء من ورقة الامتحان...',
]

const summaryMessages = [
  'جاري قراءة محتوى الملف...',
  'تحليل المحاور الرئيسية...',
  'استخراج النقاط المهمة...',
  'تنظيم المعلومات...',
  'صياغة الملخص بوضوح...',
  'مراجعة الصياغة والترتيب...',
  'الانتهاء من الملخص...',
]

export default function LoadingMessages({ type = 'exam' }) {
  const messages = type === 'summary' ? summaryMessages : examMessages
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev < messages.length - 1) return prev + 1
        return prev // نبقى على آخر رسالة
      })
    }, 2200)

    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <div className="flex flex-col items-center gap-5 py-10">
      <LoadingSpinner size="lg" />

      <div className="h-8 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="text-sm text-center"
            style={{
              color: '#8B949E',
              fontFamily: 'Noto Sans Arabic, sans-serif',
            }}
          >
            {messages[currentIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* شريط تقدم وهمي */}
      <div
        className="w-48 h-1 rounded-full overflow-hidden"
        style={{ background: '#30363D' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: '#FF6B35' }}
          initial={{ width: '5%' }}
          animate={{
            width: `${Math.round(((currentIndex + 1) / messages.length) * 100)}%`,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      <p className="text-xs" style={{ color: '#6E7681' }}>
        قد يستغرق هذا بضع ثوانٍ
      </p>
    </div>
  )
}
