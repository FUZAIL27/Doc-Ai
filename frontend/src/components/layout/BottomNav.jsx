import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Upload, MessageSquare, BarChart3 } from 'lucide-react'

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home'      },
  { to: '/documents',  icon: FileText,        label: 'Docs'      },
  { to: '/upload',     icon: Upload,          label: 'Upload'    },
  { to: '/chat',       icon: MessageSquare,   label: 'Chat'      },
  { to: '/analytics',  icon: BarChart3,       label: 'Stats'     },
]

export default function BottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-200/95 backdrop-blur-xl border-t border-dark-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-1 rounded-xl transition-all duration-150 touch-manipulation ${
                isActive ? 'text-brand-400' : 'text-slate-500 active:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg transition-all duration-150 ${isActive ? 'bg-brand-600/20' : ''}`}>
                  <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className="text-[10px] font-medium leading-none tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
