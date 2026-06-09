// src/services/api.js — استدعاء الباك اند (توليد الأسئلة والملخص)
// يدعم: وضع PDF (pdfBase64) + وضع المنهج (subject + grade + stage)

import { getFirebaseToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ─── دالة مساعدة: fetch مع timeout ───────────────────────────────────────
async function fetchWithTimeout(url, fetchOptions, timeoutMs = 90000) {
  const controller = new AbortController()
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

// ─── دالة مساعدة: تفسير أخطاء الاستجابة ─────────────────────────────────
async function parseResponseError(response) {
  try {
    const errorData = await response.json()
    return errorData.message || 'حدث خطأ في الاتصال بالخادم'
  } catch {
    return 'حدث خطأ في الاتصال بالخادم'
  }
}

// ─── دالة مساعدة: رسائل HTTP status ─────────────────────────────────────
function getStatusError(status) {
  if (status === 401) return 'انتهت جلسة المستخدم — يرجى تسجيل الدخول مجدداً'
  if (status === 429) {
    return (
      'الملف كبير جداً — حجم المادة يتجاوز حد المعالجة.\n' +
      'الحلول: استخدم "اختيار من المنهج" بدل رفع الملف، أو قسّم الملف لأجزاء أصغر.'
    )
  }
  if (status === 413) return 'حجم الملف كبير جداً — يرجى اختيار ملف أصغر'
  if (status >= 500) return 'خطأ في الخادم — يرجى المحاولة لاحقاً'
  return null
}

/**
 * generateExam — توليد أسئلة امتحان
 * وضع PDF:     generateExam(pdfBase64, options)
 * وضع المنهج: generateExam(null, { ...options, subject, grade, stage })
 *
 * @param {string|null} pdfBase64
 * @param {object}      options — { pattern, chapters, difficulty, subject, grade?, stage? }
 */
export async function generateExam(pdfBase64, options) {
  try {
    const token = await getFirebaseToken()
    if (!token) {
      throw new Error('انتهت جلسة المستخدم — يرجى تسجيل الدخول مجدداً')
    }

    // بناء body الطلب — pdfBase64 لا يُرسل إذا كان null (وضع المنهج)
    const body = { options }
    if (pdfBase64) body.pdfBase64 = pdfBase64

    let response
    try {
      response = await fetchWithTimeout(
        `${API_URL}/api/generate/exam`,
        {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:  `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      )
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error('انتهت مدة الانتظار — يرجى المحاولة مجدداً أو استخدام ملف أصغر')
      }
      throw new Error('تعذّر الاتصال بالخادم — تحقق من اتصالك بالإنترنت')
    }

    if (!response.ok) {
      const statusError = getStatusError(response.status)
      if (statusError) throw new Error(statusError)
      const msg = await parseResponseError(response)
      throw new Error(msg)
    }

    const data = await response.json()
    if (!data.success || !data.data) {
      throw new Error('استجابة غير صالحة من الخادم')
    }

    return data.data
  } catch (error) {
    console.error('generateExam error:', error)
    throw error
  }
}

/**
 * generateSummary — توليد ملخص مادة
 * وضع PDF:     generateSummary(pdfBase64, options)
 * وضع المنهج: generateSummary(null, { ...options, subject, grade, stage })
 *
 * @param {string|null} pdfBase64
 * @param {object}      options — { pages, targetWords, subject, grade?, stage? }
 */
export async function generateSummary(pdfBase64, options) {
  try {
    const token = await getFirebaseToken()
    if (!token) {
      throw new Error('انتهت جلسة المستخدم — يرجى تسجيل الدخول مجدداً')
    }

    // بناء body الطلب — pdfBase64 لا يُرسل إذا كان null (وضع المنهج)
    const body = { options }
    if (pdfBase64) body.pdfBase64 = pdfBase64

    let response
    try {
      response = await fetchWithTimeout(
        `${API_URL}/api/generate/summary`,
        {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:  `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      )
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error('انتهت مدة الانتظار — يرجى المحاولة مجدداً أو استخدام ملف أصغر')
      }
      throw new Error('تعذّر الاتصال بالخادم — تحقق من اتصالك بالإنترنت')
    }

    if (!response.ok) {
      const statusError = getStatusError(response.status)
      if (statusError) throw new Error(statusError)
      const msg = await parseResponseError(response)
      throw new Error(msg)
    }

    const data = await response.json()
    if (!data.success || !data.data) {
      throw new Error('استجابة غير صالحة من الخادم')
    }

    return data.data
  } catch (error) {
    console.error('generateSummary error:', error)
    throw error
  }
}
