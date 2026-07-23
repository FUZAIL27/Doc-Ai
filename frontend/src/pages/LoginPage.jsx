import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Eye, EyeOff, Mail, Lock, ArrowRight, Loader } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [form, setForm] = useState({ email:'', password:'' })
  const [show, setShow] = useState(false)
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const r = await login(form.email, form.password)
    if (r.success) { toast.success('Welcome back!'); navigate('/dashboard') }
    else toast.error(r.error)
  }

  return (
    <div className="min-h-screen min-h-dvh bg-dark-300 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-purple-900/10 pointer-events-none" />

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }}
        className="w-full max-w-sm sm:max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-5 sm:mb-6">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl text-white">DocMind AI</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1.5">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to your account</p>
        </div>

        <div className="glass-card p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5 sm:mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)}
                  className="input-field pl-10" autoComplete="email" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input type={show ? 'text' : 'password'} required placeholder="••••••••"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  className="input-field pl-10 pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1">
                  {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="btn-primary w-full justify-center py-3 text-sm sm:text-base mt-1">
              {isLoading
                ? <Loader size={17} className="animate-spin"/>
                : <>Sign In <ArrowRight size={16}/></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            No account?{' '}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
