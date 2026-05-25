/**
 * requestsStore.js
 * Zustand store لإدارة قائمة الطلبات والـ pagination
 */

import { create } from 'zustand'

export const useRequestsStore = create((set) => ({
  requests: [],
  lastDoc: null,
  hasMore: false,
  loading: false,

  /**
   * تعيين قائمة الطلبات (الاستدعاء الأول)
   */
  setRequests: (requests) => set({ requests: requests || [] }),

  /**
   * إضافة طلبات للقائمة الموجودة (pagination — "عرض المزيد")
   */
  appendRequests: (requests) =>
    set((state) => ({
      requests: [...(state.requests || []), ...(requests || [])],
    })),

  /**
   * إضافة طلب جديد في بداية القائمة (بعد التوليد مباشرةً)
   */
  addRequest: (request) =>
    set((state) => ({
      requests: [request, ...(state.requests || [])],
    })),

  /**
   * حفظ آخر document للـ pagination
   */
  setLastDoc: (doc) => set({ lastDoc: doc }),

  /**
   * هل يوجد المزيد من الطلبات؟
   */
  setHasMore: (bool) => set({ hasMore: bool || false }),

  /**
   * حالة التحميل
   */
  setLoading: (bool) => set({ loading: bool || false }),
}))
