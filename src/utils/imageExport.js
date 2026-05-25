// imageExport.js — تصدير عنصر HTML كصورة PNG

/**
 * exportToImage
 * @param {string} elementId — id العنصر المراد تصديره
 * @param {string} filename — اسم الملف الناتج (بدون .png)
 */
export async function exportToImage(elementId, filename = 'exam') {
  try {
    const html2canvas = (await import('html2canvas')).default

    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`العنصر بالمعرّف "${elementId}" غير موجود`)
    }

    // تصوير العنصر
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY,
    })

    // تحويل لـ blob وتحميل
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error('فشل إنشاء الصورة')
        }
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        const safeFilename = filename.replace(/[^\u0600-\u06FFa-zA-Z0-9_\- ]/g, '_') || 'exam'
        link.download = `${safeFilename}.png`
        link.href = url
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      },
      'image/png',
      1.0
    )
  } catch (error) {
    console.error('exportToImage error:', error)
    throw new Error('فشل تصدير الصورة — يرجى المحاولة مجدداً')
  }
}
