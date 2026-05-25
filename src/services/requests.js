/**
 * requests.js
 * خدمات Firestore لإدارة طلبات المستخدم
 *
 * هيكل البيانات بعد التعديل (المرحلة 7):
 *   users/{userId}/requests/{requestId}  ← metadata فقط (name, type, options, createdAt)
 *   results/{requestId}                  ← النتيجة الضخمة (userId, data, createdAt)
 *
 * الفصل هذا يجعل Dashboard سريعاً — يقرأ metadata فقط بدون النتائج الضخمة.
 * ResultPage تقرأ النتيجة عند الحاجة فقط.
 */

import { db } from '../config/firebase'
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from 'firebase/firestore'

// ─── saveRequest ──────────────────────────────────────────────────────────────
/**
 * يحفظ طلباً جديداً في مكانين منفصلين:
 *   1. users/{userId}/requests/{autoId}  ← metadata (بدون result)
 *   2. results/{autoId}                  ← النتيجة الكاملة
 *
 * @param {string} userId
 * @param {{ name: string, type: 'exam'|'summary', options: object, result: object }} requestData
 * @returns {Promise<string>} requestId
 */
export async function saveRequest(userId, requestData) {
  try {
    // ── الخطوة 1: حفظ الـ metadata في sub-collection (بدون result) ──
    const requestsRef = collection(db, 'users', userId, 'requests')

    const metaDocRef = await addDoc(requestsRef, {
      name:      requestData.name || '',
      type:      requestData.type || 'exam',
      createdAt: serverTimestamp(),
      options:   requestData.options || {},
    })

    const requestId = metaDocRef.id

    // ── الخطوة 2: حفظ النتيجة الكاملة في results/{requestId} (top-level) ──
    try {
      const resultRef = doc(db, 'results', requestId)
      await setDoc(resultRef, {
        userId:    userId,
        data:      requestData.result || {},
        createdAt: serverTimestamp(),
      })
    } catch (resultErr) {
      // فشل حفظ النتيجة لا يُلغي الطلب — سيظهر في السجل بدون بيانات
      console.warn('saveRequest: فشل حفظ النتيجة (non-fatal):', resultErr)
    }

    return requestId
  } catch (error) {
    console.error('saveRequest error:', error)
    throw error
  }
}

// ─── getRequests ──────────────────────────────────────────────────────────────
/**
 * جلب قائمة الطلبات مع pagination — يقرأ metadata فقط (سريع)
 *
 * @param {string} userId
 * @param {number} limitCount عدد الطلبات في كل صفحة
 * @param {import('firebase/firestore').DocumentSnapshot | null} lastDoc آخر document للـ pagination
 * @returns {Promise<{ requests: Array, lastDoc: DocumentSnapshot|null, hasMore: boolean }>}
 */
export async function getRequests(userId, limitCount = 10, lastDoc = null) {
  try {
    const requestsRef = collection(db, 'users', userId, 'requests')

    let q

    if (lastDoc) {
      q = query(
        requestsRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(limitCount)
      )
    } else {
      q = query(
        requestsRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
    }

    const snapshot = await getDocs(q)

    const requests = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() || {}),
    }))

    const newLastDoc =
      snapshot.docs.length > 0
        ? snapshot.docs[snapshot.docs.length - 1]
        : null

    // hasMore: true إذا عدد النتائج = limitCount (قد يوجد المزيد)
    const hasMore = snapshot.docs.length === limitCount

    return {
      requests,
      lastDoc:  newLastDoc,
      hasMore,
    }
  } catch (error) {
    console.error('getRequests error:', error)
    throw error
  }
}

// ─── getRequestById ───────────────────────────────────────────────────────────
/**
 * جلب طلب واحد كاملاً — يقرأ من مكانين ويدمجهما:
 *   1. users/{userId}/requests/{requestId}  ← metadata
 *   2. results/{requestId}                  ← النتيجة
 *
 * @param {string} userId
 * @param {string} requestId
 * @returns {Promise<object | null>} بيانات الطلب مع result مدموج، أو null إذا غير موجود
 */
export async function getRequestById(userId, requestId) {
  try {
    // ── قراءة الـ metadata ──
    const metaRef  = doc(db, 'users', userId, 'requests', requestId)
    const metaSnap = await getDoc(metaRef)

    if (!metaSnap.exists()) return null

    const metaData = { id: metaSnap.id, ...(metaSnap.data() || {}) }

    // ── قراءة النتيجة ──
    let result = null
    try {
      const resultRef  = doc(db, 'results', requestId)
      const resultSnap = await getDoc(resultRef)

      if (resultSnap.exists()) {
        const resultDoc = resultSnap.data() || {}
        result = resultDoc.data || null
      }
    } catch (resultErr) {
      // فشل قراءة النتيجة لا يُلغي عرض الـ metadata
      console.warn('getRequestById: فشل قراءة النتيجة:', resultErr)
    }

    // ── دمج الـ metadata مع النتيجة ──
    return {
      ...metaData,
      result,
    }
  } catch (error) {
    console.error('getRequestById error:', error)
    throw error
  }
}

// Rule 5: لا يوجد deleteRequest في هذا المشروع أبداً
