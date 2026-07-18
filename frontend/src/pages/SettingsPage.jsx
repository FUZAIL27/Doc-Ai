import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Key, Brain, Save, Loader, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../utils/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const providers = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Free tier: 15 requests/min, 1M tokens/day',
    link: 'https://aistudio.google.com/app/apikey',
    color: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Free tier: Ultra-fast inference with Llama 3',
    link: 'https://console.groq.com/keys',
    color: 'text-orange-400',
    badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Free models: Mistral 7B and more',
    link: 'https://openrouter.ai/keys',
    color: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
]

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const [selectedProvider, setSelectedProvider] = useState(user?.aiProvider || 'gemini')
  const [apiKeys, setApiKeys] = useState({
    gemini: user?.apiKeys?.gemini || '',
    groq: user?.apiKeys?.groq || '',
    openrouter: user?.apiKeys?.openrouter || '',
  })
  const [showKeys, setShowKeys] = useState({})
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || 'dark',
    notifications: user?.preferences?.notifications ?? true,
  })

  const toggleShow = (key) => setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))

  const saveSettings = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/users/profile', {
        aiProvider: selectedProvider,
        apiKeys,
        preferences,
      })
      updateUser(data.user)
      toast.success('Settings saved successfully!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const maskKey = (key) => {
    if (!key) return ''
    if (key.length <= 8) return '••••••••'
    return key.slice(0, 4) + '••••••••' + key.slice(-4)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 mt-1">Configure your AI providers and preferences</p>
      </div>

      {/* AI Provider Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
          <Brain size={18} className="text-brand-400" /> AI Provider
        </h3>
        <p className="text-sm text-slate-400 mb-5">
          Select your preferred AI provider. The app will fall back to the next available provider if one fails.
        </p>
        <div className="space-y-3">
          {providers.map((p) => (
            <label
              key={p.id}
              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                selectedProvider === p.id
                  ? 'border-brand-600/50 bg-brand-600/10'
                  : 'border-dark-border hover:border-brand-600/30 hover:bg-dark-hover'
              }`}
            >
              <input
                type="radio"
                name="provider"
                value={p.id}
                checked={selectedProvider === p.id}
                onChange={() => setSelectedProvider(p.id)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                selectedProvider === p.id ? 'border-brand-500 bg-brand-500' : 'border-dark-border'
              }`}>
                {selectedProvider === p.id && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-medium text-sm ${p.color}`}>{p.name}</span>
                  <span className={`tag text-xs border ${p.badge}`}>Free</span>
                  {selectedProvider === p.id && (
                    <span className="tag bg-brand-600/20 text-brand-400 border border-brand-600/30 text-xs">Active</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{p.description}</p>
              </div>
            </label>
          ))}
        </div>
      </motion.div>

      {/* API Keys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
          <Key size={18} className="text-brand-400" /> API Keys
        </h3>
        <div className="flex items-start gap-3 p-3 bg-brand-600/5 border border-brand-600/20 rounded-lg mb-5">
          <AlertCircle size={16} className="text-brand-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400">
            Your API keys are encrypted and stored securely. They are only used to make requests on your behalf.
            Get free API keys from the provider websites below.
          </p>
        </div>

        <div className="space-y-5">
          {providers.map((p) => (
            <div key={p.id}>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm font-medium ${p.color}`}>{p.name} API Key</label>
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Get free key →
                </a>
              </div>
              <div className="relative">
                <input
                  type={showKeys[p.id] ? 'text' : 'password'}
                  value={apiKeys[p.id]}
                  onChange={(e) => setApiKeys({ ...apiKeys, [p.id]: e.target.value })}
                  placeholder={`Enter your ${p.name} API key`}
                  className="input-field pr-20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {apiKeys[p.id] && (
                    <CheckCircle size={14} className="text-green-400" />
                  )}
                  <button
                    type="button"
                    onClick={() => toggleShow(p.id)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showKeys[p.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <Settings size={18} className="text-brand-400" /> Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-dark-hover rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Theme</p>
              <p className="text-xs text-slate-500 mt-0.5">Currently dark mode is active by default</p>
            </div>
            <select
              value={preferences.theme}
              onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
              className="bg-dark-200 border border-dark-border rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-dark-hover rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Notifications</p>
              <p className="text-xs text-slate-500 mt-0.5">Receive alerts for AI analysis completion</p>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, notifications: !preferences.notifications })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                preferences.notifications ? 'bg-brand-600' : 'bg-dark-border'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                preferences.notifications ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-dark-hover rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Auto-Analysis</p>
              <p className="text-xs text-slate-500 mt-0.5">Automatically analyze documents after upload</p>
            </div>
            <span className="tag bg-green-500/20 text-green-400 border border-green-500/30 text-xs">Always On</span>
          </div>
        </div>
      </motion.div>

      {/* Save */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <button onClick={saveSettings} disabled={saving} className="btn-primary px-8 py-3">
          {saving ? (
            <><Loader size={16} className="animate-spin" /> Saving...</>
          ) : (
            <><Save size={16} /> Save Settings</>
          )}
        </button>
      </motion.div>
    </div>
  )
}
