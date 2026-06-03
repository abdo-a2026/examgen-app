// src/utils/pdfExport.js
// تصدير عناصر HTML كـ PDF مع تقسيم صفحات صحيح

/**
 * exportToPDF
 * @param {string} elementId — id العنصر المراد تصديره
 * @param {string} filename  — اسم الملف بدون .pdf
 */
export async function exportToPDF(elementId, filename = 'exam') {
  try {
    const html2canvas = (await import('html2canvas')).default
    const { jsPDF }   = await import('jspdf')

    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`العنصر "${elementId}" غير موجود`)
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')

    const pageWidth  = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // حساب نسبة العرض
    const imgWidth   = pageWidth
    const imgHeight  = (canvas.height * pageWidth) / canvas.width

    let heightLeft = imgHeight
    let position   = 0

    // الصفحة الأولى
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // صفحات إضافية إذا المحتوى طويل
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    const cleanName = filename
      .replace(/[^\u0600-\u06FFa-zA-Z0-9_\- ]/g, '_')
      .trim() || 'exam'
    pdf.save(`${cleanName}.pdf`)
  } catch (error) {
    console.error('exportToPDF error:', error)
    throw new Error('فشل تصدير الـ PDF — يرجى المحاولة مجدداً')
  }
}

// alias للملخص — نفس المنطق بـ elementId مختلف
export async function exportSummaryToPDF(elementId = 'summary-content', filename = 'summary') {
  return exportToPDF(elementId, filename)
}

// alias للأجوبة النموذجية
export async function exportAnswerSheetToPDF(filename = 'answers') {
  return exportToPDF('answer-sheet', filename)
}
