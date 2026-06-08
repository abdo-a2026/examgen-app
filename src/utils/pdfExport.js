// pdfExport.js — تصدير عنصر HTML كـ PDF

/**
 * exportToPDF
 * @param {string} elementId — id العنصر المراد تصديره
 * @param {string} filename — اسم الملف الناتج (بدون .pdf)
 */
export async function exportToPDF(elementId, filename = 'exam') {
  try {
    // استيراد ديناميكي لتجنب تحميل المكتبات عند بدء التطبيق
    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')

    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`العنصر بالمعرّف "${elementId}" غير موجود`)
    }

    // تصوير العنصر
    const canvas = await html2canvas(element, {
      scale: 2, // دقة أعلى
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY,
    })

    const imgData = canvas.toDataURL('image/png')

    // إنشاء PDF بحجم A4
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height

    // حساب نسبة الحجم
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const scaledWidth = imgWidth * ratio
    const scaledHeight = imgHeight * ratio

    // إذا الصورة أطول من الصفحة — نقسمها لصفحات
    const pageHeightInPx = pdfHeight / ratio
    let yOffset = 0
    let pageNum = 0

    while (yOffset < imgHeight) {
      if (pageNum > 0) pdf.addPage()

      // رسم الجزء المناسب من الصورة
      const sliceHeight = Math.min(pageHeightInPx, imgHeight - yOffset)

      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = imgWidth
      sliceCanvas.height = sliceHeight
      const ctx = sliceCanvas.getContext('2d')
      ctx.drawImage(canvas, 0, -yOffset, imgWidth, imgHeight)

      const sliceData = sliceCanvas.toDataURL('image/png')
      const sliceScaledHeight = sliceHeight * ratio

      pdf.addImage(sliceData, 'PNG', 0, 0, pdfWidth, sliceScaledHeight)

      yOffset += pageHeightInPx
      pageNum++
    }

    // تحميل الملف
    const safeFilename = filename.replace(/[^\u0600-\u06FFa-zA-Z0-9_\- ]/g, '_') || 'exam'
    pdf.save(`${safeFilename}.pdf`)
  } catch (error) {
    console.error('exportToPDF error:', error)
    throw new Error('فشل تصدير الـ PDF — يرجى المحاولة مجدداً')
  }
}
