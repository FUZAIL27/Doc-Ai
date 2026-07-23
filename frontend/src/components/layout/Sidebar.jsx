import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Upload, MessageSquare,
  BarChart3, Settings, User, LogOut, Brain, ChevronLeft, ChevronRight, X
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents',  icon: FileText,        label: 'Documents'  },
  { to: '/upload',     icon: Upload,          label: 'Upload'     },
  { to: '/chat',       icon: MessageSquare,   label: 'AI Chat'    },
  { to: '/analytics',  icon: BarChart3,       label: 'Analytics'  },
]
const BOT = [
  { to: '/profile',  icon: User,     label: 'Profile'  },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

function NavItem({ to, icon: Icon, label, isOpen, isMobile, onClose }) {
  return (
    <NavLink
      to={to}
      onClick={isMobile ? onClose : undefined}
      className={({ isActive }) =>
        `sidebar-link ${isActive ? 'active' : ''} ${!isOpen && !isMobile ? 'justify-center px-0' : ''}`
      }
      title={!isOpen && !isMobile ? label : undefined}
    >
      <Icon size={18} className="flex-shrink-0" />
      <AnimatePresence>
        {(isOpen || isMobile) && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  )
}

export default function Sidebar({ isOpen, onToggle, isMobile = false }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isMobile ? 256 : isOpen ? 240 : 64 }}
      transition={{ duration: 0.28, ease: 'easeInOut' }}
      className="relative flex flex-col h-full h-dvh bg-dark-200 border-r border-dark-border overflow-hidden"
      style={{ minWidth: isMobile ? 256 : undefined }}
    >
      {/* Logo row */}
      <div className="flex items-center gap-3 h-14 sm:h-16 px-4 border-b border-dark-border flex-shrink-0">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Brain size={16} className="text-white" />
        </div>
        <AnimatePresence>
          {(isOpen || isMobile) && (
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="font-bold text-lg text-white whitespace-nowrap flex-1 min-w-0"
            >
              DocMind AI
            </motion.span>
          )}
        </AnimatePresence>

        {/* Mobile close */}
        {isMobile && (
          <button
            onClick={onToggle}
            className="ml-auto p-1.5 rounded-lg hover:bg-dark-hover text-slate-400 hover:text-white transition-colors flex-shrink-0"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Desktop toggle knob */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className="absolute top-[18px] -right-3 w-6 h-6 bg-dark-border hover:bg-brand-600 rounded-full flex items-center justify-center transition-colors z-20 border border-dark-300 shadow-sm"
          aria-label="Toggle sidebar"
        >
          {isOpen
            ? <ChevronLeft  size={11} className="text-slate-300" />
            : <ChevronRight size={11} className="text-slate-300" />
          }
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV.map(item => (
          <NavItem key={item.to} {...item} isOpen={isOpen} isMobile={isMobile} onClose={onToggle} />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="py-3 px-2 border-t border-dark-border space-y-0.5 overflow-x-hidden">
        {BOT.map(item => (
          <NavItem key={item.to} {...item} isOpen={isOpen} isMobile={isMobile} onClose={onToggle} />
        ))}

        {/* User info */}
        <div className={`flex items-center gap-3 px-3 py-2 mt-1 rounded-lg ${!isOpen && !isMobile ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <AnimatePresence>
            {(isOpen || isMobile) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.plan} plan</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-400/10 ${!isOpen && !isMobile ? 'justify-center px-0' : ''}`}
          title={!isOpen && !isMobile ? 'Logout' : undefined}
        >
          <LogOut size={17} className="flex-shrink-0" />
          <AnimatePresence>
            {(isOpen || isMobile) && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
