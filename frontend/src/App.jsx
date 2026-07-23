import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import Layout             from './components/layout/Layout'
import LandingPage        from './pages/LandingPage'
import LoginPage          from './pages/LoginPage'
import SignupPage         from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage      from './pages/DashboardPage'
import DocumentsPage      from './pages/DocumentsPage'
import DocumentDetailPage from './pages/DocumentDetailPage'
import UploadPage         from './pages/UploadPage'
import ChatPage           from './pages/ChatPage'
import AnalyticsPage      from './pages/AnalyticsPage'
import ProfilePage        from './pages/ProfilePage'
import SettingsPage       from './pages/SettingsPage'

function Protected({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}
function Public({ children }) {
  const { token } = useAuthStore()
  return token ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e1e2e',
            color: '#e2e8f0',
            border: '1px solid #2e2e4a',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/"                element={<Public><LandingPage /></Public>} />
        <Route path="/login"           element={<Public><LoginPage /></Public>} />
        <Route path="/signup"          element={<Public><SignupPage /></Public>} />
        <Route path="/forgot-password" element={<Public><ForgotPasswordPage /></Public>} />
        <Route path="/" element={<Protected><Layout /></Protected>}>
          <Route path="dashboard"     element={<DashboardPage />} />
          <Route path="documents"     element={<DocumentsPage />} />
          <Route path="documents/:id" element={<DocumentDetailPage />} />
          <Route path="upload"        element={<UploadPage />} />
          <Route path="chat"          element={<ChatPage />} />
          <Route path="chat/:id"      element={<ChatPage />} />
          <Route path="analytics"     element={<AnalyticsPage />} />
          <Route path="profile"       element={<ProfilePage />} />
          <Route path="settings"      element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
