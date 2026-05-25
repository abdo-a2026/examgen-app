/**
 * formatDate.js
 * دوال تنسيق التواريخ بالعربية
 */

/**
 * تحويل timestamp لنص عربي نسبي
 * @param {import('firebase/firestore').Timestamp | Date | number} timestamp
 * @returns {string}
 */
export function formatRelativeDate(timestamp) {
  try {
    let date

    if (!timestamp) return ''

    // دعم Firestore Timestamp
    if (timestamp?.toDate) {
      date = timestamp.toDate()
    } else if (timestamp instanceof Date) {
      date = timestamp
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp)
    } else {
      return ''
    }

    const now = Date.now()
    const diff = now - date.getTime() // بالمللي ثانية
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) {
      return 'الآن'
    }

    if (minutes < 60) {
      if (minutes === 1) return 'منذ دقيقة'
      if (minutes === 2) return 'منذ دقيقتين'
      if (minutes >= 3 && minutes <= 10) return `منذ ${minutes} دقائق`
      return `منذ ${minutes} دقيقة`
    }

    if (hours < 24) {
      if (hours === 1) return 'منذ ساعة'
      if (hours === 2) return 'منذ ساعتين'
      if (hours >= 3 && hours <= 10) return `منذ ${hours} ساعات`
      return `منذ ${hours} ساعة`
    }

    if (days < 7) {
      if (days === 1) return 'أمس'
      if (days === 2) return 'منذ يومين'
      if (days >= 3 && days <= 6) return `منذ ${days} أيام`
      return `منذ ${days} يوم`
    }

    // أكبر من أسبوع — تاريخ كامل
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  } catch (error) {
    console.error('formatRelativeDate error:', error)
    return ''
  }
}

/**
 * تحويل timestamp لتاريخ عربي كامل
 * @param {import('firebase/firestore').Timestamp | Date | number} timestamp
 * @returns {string} مثال: "الثلاثاء، 15 يناير 2025"
 */
export function formatFullDate(timestamp) {
  try {
    let date

    if (!timestamp) return ''

    if (timestamp?.toDate) {
      date = timestamp.toDate()
    } else if (timestamp instanceof Date) {
      date = timestamp
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp)
    } else {
      return ''
    }

    return date.toLocaleDateString('ar-IQ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch (error) {
    console.error('formatFullDate error:', error)
    return ''
  }
}
