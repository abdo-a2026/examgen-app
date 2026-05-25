import React, { useState } from 'react'
import { Download, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import { exportToPDF } from '../../utils/pdfExport'
import { exportToImage }       from '../../utils/imageExport'

/**
 * SummaryDownloader
 * props:
 *   summaryData  : object  — للتأكد من وجود بيانات
 *   summaryName  : string  — اسم الطلب (يُستخدم كاسم الملف)
 */
export default function SummaryDownloader({ summaryData, summaryName }) {
  const [loadingPDF,   setLoadingPDF]   = useState(false)
  const [loadingImage, setLoadingImage] = useState(false)

  const safeName = summaryName || 'ملخص'

  // ─── تحميل PDF ───
  const handlePDF = async () => {
    try {
      setLoadingPDF(true)
      await exportToPDF('summary-content', safeName)
      toast.success('✅ تم تحميل PDF بنجاح')
    } catch (err) {
      console.error('SummaryDownloader PDF error:', err)
      toast.error('فشل تحميل PDF — حاول مجدداً')
    } finally {
      setLoadingPDF(false)
    }
  }

  // ─── تحميل صورة ───
  const handleImage = async () => {
    try {
      setLoadingImage(true)
      await exportToImage('summary-content', safeName)
      toast.success('✅ تم تحميل الصورة بنجاح')
    } catch (err) {
      console.error('SummaryDownloader Image error:', err)
      toast.error('فشل تحميل الصورة — حاول مجدداً')
    } finally {
      setLoadingImage(false)
    }
  }

  if (!summaryData) return null

  return (
    <div dir="rtl" className="flex flex-col sm:flex-row gap-3 justify-center w-full">
      {/* زر PDF */}
      <button
        onClick={handlePDF}
        disabled={loadingPDF || loadingImage}
        className="flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 flex-1 sm:flex-initial"
        style={{
          minHeight:    '48px',
          padding:      '0 28px',
          background:   loadingPDF ? '#30363D' : '#FF6B35',
          color:        '#FFFFFF',
          border:       'none',
          cursor:       (loadingPDF || loadingImage) ? 'not-allowed' : 'pointer',
          opacity:      (loadingPDF || loadingImage) ? 0.7 : 1,
          fontFamily:   'Cairo, sans-serif',
          fontSize:     '15px',
          fontWeight:   '600',
        }}
      >
        <Download size={18} />
        {loadingPDF ? 'جارٍ التحميل...' : 'تحميل PDF'}
      </button>

      {/* زر صورة */}
      <button
        onClick={handleImage}
        disabled={loadingPDF || loadingImage}
        className="flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 flex-1 sm:flex-initial"
        style={{
          minHeight:    '48px',
          padding:      '0 28px',
          background:   loadingImage ? '#30363D' : '#161B22',
          color:        '#E6EDF3',
          border:       '2px solid #30363D',
          cursor:       (loadingPDF || loadingImage) ? 'not-allowed' : 'pointer',
          opacity:      (loadingPDF || loadingImage) ? 0.7 : 1,
          fontFamily:   'Cairo, sans-serif',
          fontSize:     '15px',
          fontWeight:   '600',
        }}
      >
        <Image size={18} />
        {loadingImage ? 'جارٍ التحميل...' : 'تحميل صورة'}
      </button>
    </div>
  )
}
