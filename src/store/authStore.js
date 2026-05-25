// src/store/authStore.js
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),

  setLoading: (loading) => set({ loading }),

  updateUsage: (usage) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, dailyUsage: usage }
        : null,
    })),
}))
