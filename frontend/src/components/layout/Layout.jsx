import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar   from './Sidebar'
import Header    from './Header'
import BottomNav from './BottomNav'
import { motion, AnimatePresence } from 'framer-motion'

export default function Layout() {
  const location = useLocation()

  // Desktop: sidebar open. Mobile: always hidden (overlay only)
  const [sidebarOpen,    setSidebarOpen]    = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile drawer on route change
  useEffect(() => { setMobileMenuOpen(false) }, [location.pathname])

  // Sync desktop sidebar on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) setSidebarOpen(s => !s)
    else setMobileMenuOpen(s => !s)
  }

  return (
    <div className="flex h-screen h-dvh bg-dark-300 overflow-hidden">

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(s => !s)} />
      </div>

      {/* ── Mobile slide-in drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative z-10 w-64 flex-shrink-0 shadow-2xl"
            >
              <Sidebar isOpen={true} onToggle={() => setMobileMenuOpen(false)} isMobile />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />

        {/* Page content — extra bottom padding on mobile for bottom nav */}
        <main className="flex-1 overflow-y-auto overscroll-contain pb-20 lg:pb-0">
          <motion.div
            key={location.pathname}
            className="p-4 sm:p-6 max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* ── Mobile bottom navigation ── */}
      <BottomNav />
    </div>
  )
}
