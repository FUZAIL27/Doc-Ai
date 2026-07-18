import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Upload, MessageSquare,
  BarChart3, Settings, User, LogOut, Brain, ChevronLeft, ChevronRight
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
]

const bottomItems = [
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ isOpen, onToggle }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 240 : 64 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative flex flex-col h-screen bg-dark-200 border-r border-dark-border z-10 overflow-hidden"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-dark-border flex-shrink-0">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain size={16} className="text-white" />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg text-white whitespace-nowrap"
              >
                DocMind AI
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle button */}
        <button
          onClick={onToggle}
          className="absolute top-5 -right-3 w-6 h-6 bg-dark-border rounded-full flex items-center justify-center hover:bg-brand-600 transition-colors z-20"
        >
          {isOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${!isOpen ? 'justify-center px-0' : ''}`
              }
              title={!isOpen ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="py-4 px-2 border-t border-dark-border space-y-1">
          {bottomItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${!isOpen ? 'justify-center px-0' : ''}`
              }
              title={!isOpen ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {isOpen && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}

          {/* User */}
          <div className={`flex items-center gap-3 px-3 py-2 mt-2 rounded-lg ${!isOpen ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.plan} plan</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleLogout}
            className={`sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-400/10 ${!isOpen ? 'justify-center px-0' : ''}`}
            title={!isOpen ? 'Logout' : undefined}
          >
            <LogOut size={18} className="flex-shrink-0" />
            <AnimatePresence>
              {isOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
