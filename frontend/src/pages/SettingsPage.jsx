import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Key, Brain, Save, Loader, Eye, EyeOff, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import api from '../utils/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const PROVIDERS = [
  { id:'gemini',     name:'Google Gemini', desc:'15 req/min · 1M tokens/day free', link:'https://aistudio.google.com/app/apikey', color:'text-blue-400', badge:'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id:'groq',       name:'Groq',         desc:'Ultra-fast Llama 3 — free tier',   link:'https://console.groq.com/keys',          color:'text-orange-400', badge:'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { id:'openrouter', name:'OpenRouter',   desc:'Mistral 7B & more — free models',  link:'https://openrouter.ai/keys',             color:'text-purple-400', badge:'bg-purple-500/20 text-purple-400 border-purple-500/30' },
]

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const [provider, setProvider] = useState(user?.aiProvider || 'gemini')
  const [apiKeys, setApiKeys]   = useState({ gemini: user?.apiKeys?.gemini||'', groq: user?.apiKeys?.groq||'', openrouter: user?.apiKeys?.openrouter||'' })
  const [showKey, setShowKey]   = useState({})
  const [saving, setSaving]     = useState(false)
  const [prefs, setPrefs]       = useState({ theme: user?.preferences?.theme||'dark', notifications: user?.preferences?.notifications??true })

  const toggleKey = (id) => setShowKey(p => ({...p,[id]:!p[id]}))

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/users/profile', { aiProvider: provider, apiKeys, preferences: prefs })
      updateUser(data.user)
      toast.success('Settings saved!')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 pb-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 text-sm mt-0.5">Configure AI providers and preferences</p>
      </div>

      {/* AI Provider */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="glass-card p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-white mb-1.5 flex items-center gap-2">
          <Brain size={17} className="text-brand-400" /> AI Provider
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-4">
          Your preferred provider. App falls back automatically if one fails.
        </p>
        <div className="space-y-2 sm:space-y-3">
          {PROVIDERS.map(p => (
            <label key={p.id}
              className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all touch-card ${
                provider === p.id ? 'border-brand-600/50 bg-brand-600/10' : 'border-dark-border hover:border-brand-600/30 active:bg-dark-hover'
              }`}>
              <input type="radio" name="provider" value={p.id} checked={provider===p.id}
                onChange={() => setProvider(p.id)} className="sr-only" />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                provider===p.id ? 'border-brand-500 bg-brand-500' : 'border-dark-border'}`}>
                {provider===p.id && <div className="w-2 h-2 bg-white rounded-full"/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className={`font-medium text-sm ${p.color}`}>{p.name}</span>
                  <span className={`tag text-[10px] border ${p.badge}`}>Free</span>
                  {provider===p.id && <span className="tag bg-brand-600/20 text-brand-400 border border-brand-600/30 text-[10px]">Active</span>}
                </div>
                <p className="text-xs text-slate-500">{p.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </motion.div>

      {/* API Keys */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
        className="glass-card p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-white mb-1.5 flex items-center gap-2">
          <Key size={17} className="text-brand-400" /> API Keys
        </h3>
        <div className="flex items-start gap-2.5 p-3 bg-brand-600/5 border border-brand-600/20 rounded-lg mb-4">
          <AlertCircle size={14} className="text-brand-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400">Your keys are stored securely and only used to make requests on your behalf.</p>
        </div>

        <div className="space-y-4">
          {PROVIDERS.map(p => (
            <div key={p.id}>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-sm font-medium ${p.color}`}>{p.name}</label>
                <a href={p.link} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
                  Get free key <ExternalLink size={10}/>
                </a>
              </div>
              <div className="relative">
                <input
                  type={showKey[p.id] ? 'text' : 'password'}
                  value={apiKeys[p.id]}
                  onChange={e => setApiKeys({...apiKeys,[p.id]:e.target.value})}
                  placeholder={`${p.name} API key`}
                  className="input-field pr-16 text-sm"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {apiKeys[p.id] && <CheckCircle size={13} className="text-green-400"/>}
                  <button type="button" onClick={() => toggleKey(p.id)}
                    className="text-slate-500 hover:text-slate-300 transition-colors p-0.5">
                    {showKey[p.id] ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
        className="glass-card p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Settings size={17} className="text-brand-400" /> Preferences
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 sm:p-4 bg-dark-hover rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Theme</p>
              <p className="text-xs text-slate-500 mt-0.5">App appearance</p>
            </div>
            <select value={prefs.theme} onChange={e => setPrefs({...prefs,theme:e.target.value})}
              className="bg-dark-200 border border-dark-border rounded-lg px-2.5 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
              style={{ fontSize:'14px' }}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 sm:p-4 bg-dark-hover rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Notifications</p>
              <p className="text-xs text-slate-500 mt-0.5">AI analysis alerts</p>
            </div>
            <button onClick={() => setPrefs({...prefs,notifications:!prefs.notifications})}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${prefs.notifications ? 'bg-brand-600' : 'bg-dark-border'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${prefs.notifications ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
          </div>

          <div className="flex items-center justify-between p-3 sm:p-4 bg-dark-hover rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Auto-Analysis</p>
              <p className="text-xs text-slate-500 mt-0.5">Analyze documents after upload</p>
            </div>
            <span className="tag bg-green-500/20 text-green-400 border border-green-500/30 text-[10px]">Always On</span>
          </div>
        </div>
      </motion.div>

      {/* Save button */}
      <div className="flex justify-end pb-2">
        <button onClick={save} disabled={saving}
          className="btn-primary px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto justify-center">
          {saving ? <><Loader size={15} className="animate-spin"/> Saving...</> : <><Save size={15}/> Save Settings</>}
        </button>
      </div>
    </div>
  )
}
