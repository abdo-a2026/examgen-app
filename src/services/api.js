// api.js — استدعاء الباك اند (توليد الأسئلة والملخص)

import { getFirebaseToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * generateExam — يستدعي الباك اند لتوليد أسئلة الامتحان
 * @param {string} pdfBase64 — الملف محوّل لـ base64
 * @param {object} options — { pattern, chapters, difficulty, subject }
 * @returns {object} examJSON
 */
export async function generateExam(pdfBase64, options) {
  try {
    const token = await getFirebaseToken()

    if (!token) {
      throw new Error('انتهت جلسة المستخدم — يرجى تسجيل الدخول مجدداً')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 ثانية

    let response
    try {
      response = await fetch(`${API_URL}/api/generate/exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pdfBase64, options }),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      let errorMessage = 'حدث خطأ في الاتصال بالخادم'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        // تجاهل خطأ parsing
      }

      if (response.status === 401) {
        throw new Error('انتهت جلسة المستخدم — يرجى تسجيل الدخول مجدداً')
      }
      if (response.status === 429) {
        throw new Error('لقد تجاوزت الحد اليومي المسموح به')
      }
      if (response.status === 413) {
        throw new Error('حجم الملف كبير جداً — يرجى اختيار ملف أصغر')
      }
      if (response.status >= 500) {
        throw new Error('خطأ في الخادم — يرجى المحاولة لاحقاً')
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()

    if (!data.success || !data.data) {
      throw new Error('استجابة غير صالحة من الخادم')
    }

    return data.data
  } catch (error) {
    console.error('generateExam error:', error)

    if (error.name === 'AbortError') {
      throw new Error(
        'انتهت مدة الانتظار — يرجى المحاولة مجدداً أو استخدام ملف أصغر'
      )
    }

    if (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    ) {
      throw new Error('تعذّر الاتصال بالخادم — تحقق من اتصالك بالإنترنت')
    }

    throw error
  }
}

/**
 * generateSummary — يستدعي الباك اند لتوليد ملخص المادة
 * @param {string} pdfBase64 — الملف محوّل لـ base64
 * @param {object} options — { pages, targetWords, subject }
 * @returns {object} summaryJSON
 */
export async function generateSummary(pdfBase64, options) {
  try {
    const token = await getFirebaseToken()

    if (!token) {
      throw new Error('انتهت جلسة المستخدم — يرجى تسجيل الدخول مجدداً')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 ثانية

    let response
    try {
      response = await fetch(`${API_URL}/api/generate/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pdfBase64, options }),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      let errorMessage = 'حدث خطأ في الاتصال بالخادم'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        // تجاهل خطأ parsing
      }

      if (response.status === 401) {
        throw new Error('انتهت جلسة المستخدم — يرجى تسجيل الدخول مجدداً')
      }
      if (response.status === 429) {
        throw new Error('لقد تجاوزت الحد اليومي المسموح به')
      }
      if (response.status === 413) {
        throw new Error('حجم الملف كبير جداً — يرجى اختيار ملف أصغر')
      }
      if (response.status >= 500) {
        throw new Error('خطأ في الخادم — يرجى المحاولة لاحقاً')
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()

    if (!data.success || !data.data) {
      throw new Error('استجابة غير صالحة من الخادم')
    }

    return data.data
  } catch (error) {
    console.error('generateSummary error:', error)

    if (error.name === 'AbortError') {
      throw new Error(
        'انتهت مدة الانتظار — يرجى المحاولة مجدداً أو استخدام ملف أصغر'
      )
    }

    if (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    ) {
      throw new Error('تعذّر الاتصال بالخادم — تحقق من اتصالك بالإنترنت')
    }

    throw error
  }
}
