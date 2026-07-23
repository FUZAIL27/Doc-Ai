import axios from 'axios'

// VITE_API_URL is set in Vercel environment variables at build time
// e.g. https://your-backend.onrender.com/api
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

// Attach JWT from localStorage to every request
api.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('docmind-auth')
      if (stored) {
        const parsed = JSON.parse(stored)
        const token  = parsed?.state?.token
        if (token) config.headers.Authorization = `Bearer ${token}`
      }
    } catch {}
    return config
  },
  (err) => Promise.reject(err)
)

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('docmind-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
