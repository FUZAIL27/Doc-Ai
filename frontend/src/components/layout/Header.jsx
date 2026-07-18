import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, Plus } from 'lucide-react'
import useAuthStore from '../../store/authStore'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/documents': 'Documents',
  '/upload': 'Upload Document',
  '/chat': 'AI Chat',
  '/analytics': 'Analytics',
  '/profile': 'Profile',
  '/settings': 'Settings',
}

export default function Header({ onToggleSidebar }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')

  const title = pageTitles[location.pathname] || 'DocMind AI'

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/documents?search=${encodeURIComponent(search)}`)
    }
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-dark-border bg-dark-200/50 backdrop-blur-sm flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="btn-ghost p-2 rounded-lg"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-dark-300 border border-dark-border rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 w-64"
          />
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="btn-primary text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Upload</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer"
            onClick={() => navigate('/profile')}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}
