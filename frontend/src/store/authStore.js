import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

const useAuthStore = create(
  persist(
    (set) => ({
      user:      null,
      token:     null,
      isLoading: false,
      error:     null,

      signup: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/signup', { name, email, password })
          set({ user: data.user, token: data.token, isLoading: false })
          return { success: true }
        } catch (err) {
          const error = err.response?.data?.error || 'Signup failed'
          set({ error, isLoading: false })
          return { success: false, error }
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          set({ user: data.user, token: data.token, isLoading: false })
          return { success: true }
        } catch (err) {
          const error = err.response?.data?.error || 'Login failed'
          set({ error, isLoading: false })
          return { success: false, error }
        }
      },

      logout: () => {
        localStorage.removeItem('docmind-auth')
        set({ user: null, token: null, error: null })
      },

      updateUser: (user) => set({ user }),
    }),
    {
      name: 'docmind-auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
)

export default useAuthStore
