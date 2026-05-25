// src/services/quota.js
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import { db }           from '../config/firebase'
import { useAuthStore } from '../store/authStore'

// ─── حدود الخطط ───────────────────────────────────────────────────────────────
const PLAN_LIMITS = {
  free:       { dailyRequests: 3,  maxFileSizeMB: 10 },
  subscribed: { dailyRequests: 20, maxFileSizeMB: 20 },
}

// ─── دالة مساعدة: تحويل الوقت المتبقي لنص عربي ──────────────────────────────
function formatResetIn(resetAtMillis) {
  try {
    const now      = Date.now()
    const resetTime = resetAtMillis + 24 * 60 * 60 * 1000
    const diffMs   = resetTime - now

    if (diffMs <= 0) return 'الآن'

    const hours   = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) return `${hours} ساعة و${minutes} دقيقة`
    return `${minutes} دقيقة`
  } catch {
    return 'قريباً'
  }
}

// ─── checkQuota ───────────────────────────────────────────────────────────────
/**
 * يتحقق من رصيد المستخدم اليومي
 * يشمل: فحص انتهاء الاشتراك + فحص العداد اليومي
 * @returns {Promise<{ allowed: bool, remaining: number, resetIn: string }>}
 */
export async function checkQuota(userId) {
  try {
    const ref  = doc(db, 'users', userId)
    const snap = await getDoc(ref)

    if (!snap.exists()) {
      console.warn('checkQuota: المستخدم غير موجود', userId)
      return { allowed: false, remaining: 0, resetIn: '' }
    }

    const data = snap.data()

    // ════════════════════════════════════════════════════════════════
    // فحص انتهاء الاشتراك — يُنفَّذ قبل حساب الـ limit
    // ════════════════════════════════════════════════════════════════
    if (data.plan === 'subscribed' && data.planExpiresAt) {
      try {
        const now    = new Date()
        const expiry = data.planExpiresAt.toDate
          ? data.planExpiresAt.toDate()
          : new Date(data.planExpiresAt)

        if (now > expiry) {
          // ── الاشتراك انتهى: رجوع لـ free في Firestore ──
          await updateDoc(ref, {
            plan:           'free',
            planExpiresAt:  null,
          })

          // ── تحديث authStore فوراً بدون reload ──
          try {
            const currentUser = useAuthStore.getState().user
            if (currentUser) {
              useAuthStore.getState().setUser({
                ...currentUser,
                plan:          'free',
                planExpiresAt: null,
              })
            }
          } catch (storeErr) {
            console.warn('checkQuota: فشل تحديث authStore (non-fatal):', storeErr)
          }

          // ── تحديث بيانات المحلية للمتابعة ──
          data.plan          = 'free'
          data.planExpiresAt = null
        }
      } catch (expiryErr) {
        // فشل فحص الانتهاء لا يوقف التحقق
        console.warn('checkQuota: فشل فحص انتهاء الاشتراك (non-fatal):', expiryErr)
      }
    }
    // ════════════════════════════════════════════════════════════════

    const plan  = data.plan || 'free'
    const lim   = PLAN_LIMITS[plan]?.dailyRequests || PLAN_LIMITS.free.dailyRequests
    const usage = data.dailyUsage || { count: 0, resetAt: null }
    const count = usage.count || 0

    // تحقق: هل مرت 24 ساعة منذ آخر تصفير؟
    const now           = Date.now()
    const resetAtMillis = usage.resetAt?.toMillis
      ? usage.resetAt.toMillis()
      : (usage.resetAt || 0)
    const hoursPassed   = (now - resetAtMillis) / (1000 * 60 * 60)

    if (hoursPassed >= 24) {
      // مرت 24 ساعة — نصفّر العداد
      await updateDoc(ref, {
        'dailyUsage.count':   0,
        'dailyUsage.resetAt': serverTimestamp(),
      })
      return {
        allowed:   true,
        remaining: lim,
        resetIn:   '24 ساعة',
      }
    }

    // لم تمر 24 ساعة — نتحقق من العداد
    if (count >= lim) {
      return {
        allowed:   false,
        remaining: 0,
        resetIn:   formatResetIn(resetAtMillis),
      }
    }

    return {
      allowed:   true,
      remaining: lim - count,
      resetIn:   formatResetIn(resetAtMillis),
    }
  } catch (error) {
    console.error('checkQuota error:', error)
    throw error
  }
}

// ─── incrementUsage ───────────────────────────────────────────────────────────
// يزيد عداد الطلبات اليومية بمقدار 1 — atomic increment لتجنب race conditions
export async function incrementUsage(userId) {
  try {
    const ref = doc(db, 'users', userId)
    await updateDoc(ref, {
      'dailyUsage.count': increment(1),
    })
  } catch (error) {
    console.error('incrementUsage error:', error)
    throw error
  }
}

// ─── getUserData ──────────────────────────────────────────────────────────────
// يجلب بيانات المستخدم الكاملة من Firestore
export async function getUserData(userId) {
  try {
    const ref  = doc(db, 'users', userId)
    const snap = await getDoc(ref)

    if (!snap.exists()) return null
    return snap.data()
  } catch (error) {
    console.error('getUserData error:', error)
    throw error
  }
}

// ─── getMaxFileSizeMB ─────────────────────────────────────────────────────────
// يرجع الحد الأقصى لحجم الملف حسب الخطة
export function getMaxFileSizeMB(plan) {
  return PLAN_LIMITS[plan || 'free']?.maxFileSizeMB || 10
}

// ─── getDailyLimit ────────────────────────────────────────────────────────────
// يرجع الحد اليومي للطلبات حسب الخطة
export function getDailyLimit(plan) {
  return PLAN_LIMITS[plan || 'free']?.dailyRequests || 3
}
