import { getFirebaseToken } from './auth'
import { useAuthStore } from '../store/authStore'

// التحقق من صحة الكود (بدون تفعيل)
export async function validateCode(code) {
  try {
    const token = await getFirebaseToken()

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/codes/validate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'خطأ في التحقق من الكود')
    }

    return {
      valid: data.valid || false,
      message: data.message || '',
      durationDays: data.durationDays || 30,
    }
  } catch (error) {
    console.error('validateCode error:', error)
    throw error
  }
}

// تفعيل الكود وربطه بالمستخدم
export async function activateCode(code) {
  try {
    const token = await getFirebaseToken()

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/codes/activate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'فشل تفعيل الكود')
    }

    // تحديث authStore بالخطة الجديدة
    try {
      const { user, setUser } = useAuthStore.getState()
      if (user) {
        setUser({
          ...user,
          plan: 'subscribed',
          planExpiresAt: data.expiresAt || null,
        })
      }
    } catch (storeError) {
      console.warn('activateCode: store update failed:', storeError)
    }

    return {
      success: data.success || true,
      message: data.message || 'تم تفعيل الاشتراك بنجاح',
      expiresAt: data.expiresAt || null,
    }
  } catch (error) {
    console.error('activateCode error:', error)
    throw error
  }
}

// إنشاء كود جديد (للأدمن فقط)
export async function createCode(durationDays = 30) {
  try {
    const token = await getFirebaseToken()

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/codes/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ durationDays: Number(durationDays) }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'فشل إنشاء الكود')
    }

    return {
      success: data.success || true,
      code: data.code || data.codes?.[0] || '',
    }
  } catch (error) {
    console.error('createCode error:', error)
    throw error
  }
}
