import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      signup: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/signup', { name, email, password })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
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
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          set({ user: data.user, token: data.token, isLoading: false })
          return { success: true }
        } catch (err) {
          const error = err.response?.data?.error || 'Login failed'
          set({ error, isLoading: false })
          return { success: false, error }
        }
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization']
        set({ user: null, token: null, error: null })
      },

      updateUser: (user) => set({ user }),

      initAuth: () => {
        const { token } = get()
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
      }
    }),
    {
      name: 'docmind-auth',
      partialize: (state) => ({ token: state.token, user: state.user })
    }
  )
)

export default useAuthStore
