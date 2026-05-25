// ExamDownloader.jsx — تحميل ورقة الامتحان كـ PDF أو صورة

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileDown, Image, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { exportToPDF } from '../../utils/pdfExport'
import { exportToImage } from '../../utils/imageExport'

/**
 * ExamDownloader
 * props:
 *   examName (string) — اسم الملف عند التحميل
 */
export default function ExamDownloader({ examName = 'امتحان' }) {
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [loadingImg, setLoadingImg] = useState(false)

  const handleDownloadPDF = async () => {
    if (loadingPdf || loadingImg) return
    setLoadingPdf(true)
    try {
      await exportToPDF('exam-content', examName)
      toast.success('تم تحميل PDF بنجاح ✓')
    } catch (err) {
      toast.error(err.message || 'فشل تحميل PDF')
      console.error('ExamDownloader PDF error:', err)
    } finally {
      setLoadingPdf(false)
    }
  }

  const handleDownloadImage = async () => {
    if (loadingPdf || loadingImg) return
    setLoadingImg(true)
    try {
      await exportToImage('exam-content', examName)
      toast.success('تم تحميل الصورة بنجاح ✓')
    } catch (err) {
      toast.error(err.message || 'فشل تحميل الصورة')
      console.error('ExamDownloader Image error:', err)
    } finally {
      setLoadingImg(false)
    }
  }

  return (
    <div dir="rtl" className="flex flex-col sm:flex-row gap-3">
      {/* زر PDF */}
      <motion.button
        whileHover={!loadingPdf && !loadingImg ? { scale: 1.02 } : {}}
        whileTap={!loadingPdf && !loadingImg ? { scale: 0.98 } : {}}
        onClick={handleDownloadPDF}
        disabled={loadingPdf || loadingImg}
        className={`
          flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm
          min-h-[48px] transition-all duration-200 border-2
          ${
            loadingPdf
              ? 'bg-[#FF6B35]/30 border-[#FF6B35]/30 text-[#FF6B35]/60 cursor-not-allowed'
              : loadingImg
              ? 'bg-[#161B22] border-[#30363D] text-[#8B949E] cursor-not-allowed opacity-60'
              : 'bg-[#FF6B35] border-[#FF6B35] text-white hover:bg-[#FF6B35]/90 shadow-lg shadow-[#FF6B35]/20'
          }
        `}
        style={{ fontFamily: 'Cairo, sans-serif' }}
      >
        {loadingPdf ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        {loadingPdf ? 'جاري التحميل...' : 'تحميل PDF'}
      </motion.button>

      {/* زر صورة */}
      <motion.button
        whileHover={!loadingPdf && !loadingImg ? { scale: 1.02 } : {}}
        whileTap={!loadingPdf && !loadingImg ? { scale: 0.98 } : {}}
        onClick={handleDownloadImage}
        disabled={loadingPdf || loadingImg}
        className={`
          flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm
          min-h-[48px] transition-all duration-200 border-2
          ${
            loadingImg
              ? 'bg-[#E6EDF3]/10 border-[#E6EDF3]/30 text-[#E6EDF3]/60 cursor-not-allowed'
              : loadingPdf
              ? 'bg-[#161B22] border-[#30363D] text-[#8B949E] cursor-not-allowed opacity-60'
              : 'bg-[#161B22] border-[#30363D] text-[#E6EDF3] hover:border-[#FF6B35]/60 hover:text-[#FF6B35]'
          }
        `}
        style={{ fontFamily: 'Cairo, sans-serif' }}
      >
        {loadingImg ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Image className="w-4 h-4" />
        )}
        {loadingImg ? 'جاري التحميل...' : 'تحميل صورة'}
      </motion.button>
    </div>
  )
}
