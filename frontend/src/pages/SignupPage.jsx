import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup, isLoading } = useAuthStore()
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [show, setShow] = useState(false)
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    const r = await signup(form.name, form.email, form.password)
    if (r.success) { toast.success('Welcome to DocMind AI! 🎉'); navigate('/dashboard') }
    else toast.error(r.error)
  }

  return (
    <div className="min-h-screen min-h-dvh bg-dark-300 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-purple-900/10 pointer-events-none" />

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }}
        className="w-full max-w-sm sm:max-w-md relative z-10">

        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl text-white">DocMind AI</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1.5">Create account</h1>
          <p className="text-slate-400 text-sm">Free forever · No credit card</p>
        </div>

        <div className="glass-card p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input type="text" required placeholder="John Doe"
                  value={form.name} onChange={e => set('name', e.target.value)}
                  className="input-field pl-10" autoComplete="name" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)}
                  className="input-field pl-10" autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input type={show ? 'text' : 'password'} required minLength={6} placeholder="At least 6 characters"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  className="input-field pl-10 pr-10" autoComplete="new-password" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1">
                  {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="btn-primary w-full justify-center py-3 text-sm sm:text-base mt-1">
              {isLoading
                ? <Loader size={17} className="animate-spin"/>
                : <>Create Account <ArrowRight size={16}/></>
              }
            </button>
          </form>
          <p className="text-center text-sm text-slate-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
