import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, Plus, X, User } from 'lucide-react'
import useAuthStore from '../../store/authStore'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/documents': 'Documents',
  '/upload':    'Upload',
  '/chat':      'AI Chat',
  '/analytics': 'Analytics',
  '/profile':   'Profile',
  '/settings':  'Settings',
}

export default function Header({ onToggleSidebar }) {
  const { pathname }  = useLocation()
  const navigate      = useNavigate()
  const { user }      = useAuthStore()
  const [search,      setSearch]     = useState('')
  const [searchOpen,  setSearchOpen] = useState(false)
  const inputRef = useRef(null)

  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] || 'DocMind AI'

  // Auto-focus search input when expanded
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/documents?search=${encodeURIComponent(search)}`)
      setSearchOpen(false)
      setSearch('')
    }
    if (e.key === 'Escape') {
      setSearchOpen(false)
      setSearch('')
    }
  }

  const closeSearch = () => { setSearchOpen(false); setSearch('') }

  return (
    <header className="h-14 sm:h-16 flex items-center gap-2 px-3 sm:px-6 border-b border-dark-border bg-dark-200/60 backdrop-blur-sm flex-shrink-0 z-30">

      {/* Hamburger */}
      <button
        onClick={onToggleSidebar}
        className="btn-ghost p-2 flex-shrink-0"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title — hidden when mobile search is open */}
      {!searchOpen && (
        <h1 className="text-base sm:text-lg font-semibold text-white truncate flex-1 min-w-0">
          {title}
        </h1>
      )}

      {/* Desktop search — always visible on md+ */}
      {!searchOpen && (
        <div className="relative hidden md:block flex-shrink-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-dark-300 border border-dark-border rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 w-52 lg:w-64 transition-all"
            style={{ fontSize: '14px' }}
          />
        </div>
      )}

      {/* Mobile search expanded */}
      {searchOpen && (
        <div className="flex items-center gap-2 flex-1 md:hidden">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-dark-300 border border-dark-border rounded-lg pl-9 pr-3 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              style={{ fontSize: '16px' }}
            />
          </div>
          <button onClick={closeSearch} className="btn-ghost p-2 flex-shrink-0">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Right actions — hide when mobile search is open */}
      {!searchOpen && (
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-auto md:ml-0">
          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen(true)}
            className="btn-ghost p-2 md:hidden"
            aria-label="Search"
          >
            <Search size={19} />
          </button>

          {/* Upload button */}
          <button
            onClick={() => navigate('/upload')}
            className="btn-primary py-2 px-3 sm:px-4 text-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Avatar */}
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-brand-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white hover:ring-2 hover:ring-brand-400 transition-all flex-shrink-0"
            title={user?.name}
            aria-label="Profile"
          >
            {user?.name?.charAt(0).toUpperCase() || <User size={16} />}
          </button>
        </div>
      )}
    </header>
  )
}
