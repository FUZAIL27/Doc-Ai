import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Zap, Save, Loader } from 'lucide-react'
import api from '../utils/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [form, setForm]         = useState({ name: user?.name || '', email: user?.email || '' })
  const [passwords, setPasswords] = useState({ current:'', new:'', confirm:'' })
  const [saving, setSaving]     = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/users/profile', { name: form.name })
      updateUser(data.user)
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) { toast.error('Passwords do not match'); return }
    if (passwords.new.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setSavingPwd(true)
    try {
      await api.put('/users/change-password', { currentPassword: passwords.current, newPassword: passwords.new })
      setPasswords({ current:'', new:'', confirm:'' })
      toast.success('Password changed!')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSavingPwd(false) }
  }

  const stats = [
    { icon:User,   label:'Documents', value: user?.stats?.totalDocuments || 0 },
    { icon:Zap,    label:'AI Chats',  value: user?.stats?.totalChats || 0 },
    { icon:Shield, label:'Tokens',    value: `${((user?.stats?.totalTokensUsed||0)/1000).toFixed(1)}K` },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-white">Profile</h2>

      {/* Avatar card */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="glass-card p-4 sm:p-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-white truncate">{user?.name}</h3>
            <p className="text-slate-400 text-xs sm:text-sm truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="tag bg-brand-600/20 text-brand-400 border border-brand-600/30 capitalize text-[11px]">{user?.plan} Plan</span>
              <span className="tag bg-green-500/20 text-green-400 border border-green-500/30 text-[11px]">Active</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
        className="grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map(({ icon:Icon, label, value }, i) => (
          <div key={i} className="glass-card p-3 sm:p-4 text-center">
            <Icon size={18} className="text-brand-400 mx-auto mb-1.5" />
            <div className="text-lg sm:text-xl font-bold text-white">{value}</div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Edit Profile */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
        className="glass-card p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-white mb-4 flex items-center gap-2">
          <User size={17} className="text-brand-400" /> Edit Profile
        </h3>
        <form onSubmit={saveProfile} className="space-y-3 sm:space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-1.5">Full Name</label>
            <input type="text" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-1.5">Email</label>
            <input type="email" value={form.email} disabled className="input-field opacity-50 cursor-not-allowed" />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader size={15} className="animate-spin"/> : <Save size={15}/>}
            Save Changes
          </button>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }}
        className="glass-card p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Shield size={17} className="text-brand-400" /> Change Password
        </h3>
        <form onSubmit={changePassword} className="space-y-3 sm:space-y-4">
          {[
            { key:'current', label:'Current Password' },
            { key:'new',     label:'New Password'     },
            { key:'confirm', label:'Confirm Password' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">{label}</label>
              <input type="password" value={passwords[key]}
                onChange={e => setPasswords({...passwords, [key]: e.target.value})}
                className="input-field" placeholder="••••••••"
                minLength={key !== 'current' ? 6 : undefined}
                autoComplete={key === 'current' ? 'current-password' : 'new-password'} />
            </div>
          ))}
          <button type="submit" disabled={savingPwd} className="btn-primary">
            {savingPwd ? <Loader size={15} className="animate-spin"/> : <Shield size={15}/>}
            Change Password
          </button>
        </form>
      </motion.div>
    </div>
  )
}
