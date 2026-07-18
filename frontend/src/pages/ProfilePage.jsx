import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Zap, Save, Loader } from 'lucide-react'
import api from '../utils/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/users/profile', { name: form.name })
      updateUser(data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (passwords.new.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setSavingPwd(true)
    try {
      await api.put('/users/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new
      })
      setPasswords({ current: '', new: '', confirm: '' })
      toast.success('Password changed successfully!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white">Profile</h2>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{user?.name}</h3>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="tag bg-brand-600/20 text-brand-400 border border-brand-600/30 capitalize">{user?.plan} Plan</span>
              <span className="tag bg-green-500/20 text-green-400 border border-green-500/30">Active</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4">
        {[
          { icon: User, label: 'Documents', value: user?.stats?.totalDocuments || 0 },
          { icon: Zap, label: 'AI Chats', value: user?.stats?.totalChats || 0 },
          { icon: Shield, label: 'Tokens Used', value: `${((user?.stats?.totalTokensUsed || 0) / 1000).toFixed(1)}K` },
        ].map(({ icon: Icon, label, value }, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <Icon size={20} className="text-brand-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Edit Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <User size={18} className="text-brand-400" /> Edit Profile
        </h3>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Email Address</label>
            <input type="email" value={form.email} disabled className="input-field opacity-50 cursor-not-allowed" />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <Shield size={18} className="text-brand-400" /> Change Password
        </h3>
        <form onSubmit={changePassword} className="space-y-4">
          {['current', 'new', 'confirm'].map((field) => (
            <div key={field}>
              <label className="text-sm font-medium text-slate-300 mb-2 block capitalize">
                {field === 'current' ? 'Current Password' : field === 'new' ? 'New Password' : 'Confirm New Password'}
              </label>
              <input
                type="password"
                value={passwords[field]}
                onChange={e => setPasswords({ ...passwords, [field]: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                minLength={field !== 'current' ? 6 : undefined}
              />
            </div>
          ))}
          <button type="submit" disabled={savingPwd} className="btn-primary">
            {savingPwd ? <Loader size={16} className="animate-spin" /> : <Shield size={16} />}
            Change Password
          </button>
        </form>
      </motion.div>
    </div>
  )
}
