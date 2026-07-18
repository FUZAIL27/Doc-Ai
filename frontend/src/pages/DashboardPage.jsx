import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, MessageSquare, Zap, TrendingUp, Upload, ArrowRight, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../utils/api'
import useAuthStore from '../store/authStore'
import { formatRelativeDate, getFileColor } from '../utils/helpers'
import { CardSkeleton, DocumentSkeleton } from '../components/ui/LoadingSkeleton'
import Badge from '../components/ui/Badge'

const StatCard = ({ icon: Icon, label, value, sub, color = 'brand', delay = 0 }) => {
  const colors = {
    brand: 'bg-brand-600/20 text-brand-400',
    green: 'bg-green-500/20 text-green-400',
    purple: 'bg-purple-500/20 text-purple-400',
    orange: 'bg-orange-500/20 text-orange-400',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-5 hover:border-brand-600/30 transition-colors"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm font-medium text-slate-300">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </motion.div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const chartData = data?.uploadsByDay?.map(d => ({ date: d._id?.slice(5), uploads: d.count })) || []

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Good day, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-slate-400 mt-1">Here's what's happening with your documents</p>
        </div>
        <button onClick={() => navigate('/upload')} className="btn-primary">
          <Upload size={16} /> Upload Document
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={FileText} label="Total Documents" value={data?.stats?.totalDocs || 0} sub={`+${data?.stats?.recentDocs || 0} this week`} color="brand" delay={0} />
            <StatCard icon={MessageSquare} label="AI Chats" value={data?.stats?.totalChats || 0} sub={`+${data?.stats?.recentChats || 0} this week`} color="green" delay={0.1} />
            <StatCard icon={Zap} label="Tokens Used" value={`${((data?.stats?.totalTokensUsed || 0) / 1000).toFixed(1)}K`} color="purple" delay={0.2} />
            <StatCard icon={TrendingUp} label="Documents This Week" value={data?.stats?.recentDocs || 0} color="orange" delay={0.3} />
          </>
        )}
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload activity chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5 lg:col-span-2"
        >
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-400" />
            Upload Activity (30 days)
          </h3>
          {loading ? (
            <div className="h-48 shimmer rounded-lg" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1e1e2e', border: '1px solid #2e2e4a', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="uploads" stroke="#6366f1" fill="url(#uploadGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              No upload activity yet. <button onClick={() => navigate('/upload')} className="text-brand-400 ml-1 hover:underline">Upload your first document</button>
            </div>
          )}
        </motion.div>

        {/* Doc types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Document Types</h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="shimmer h-8 rounded-lg" />)}
            </div>
          ) : data?.docsByType?.length > 0 ? (
            <div className="space-y-3">
              {data.docsByType.map(({ _id: type, count }) => {
                const total = data.stats.totalDocs || 1
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300 uppercase font-medium">{type}</span>
                      <span className="text-slate-500">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="h-full bg-brand-500 rounded-full"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-slate-500 text-sm text-center py-8">No documents yet</div>
          )}
        </motion.div>
      </div>

      {/* Recent documents + chats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <FileText size={16} className="text-brand-400" /> Recent Documents
            </h3>
            <button onClick={() => navigate('/documents')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <DocumentSkeleton key={i} />)}
            </div>
          ) : data?.recentDocuments?.length > 0 ? (
            <div className="space-y-2">
              {data.recentDocuments.map(doc => (
                <div
                  key={doc._id}
                  onClick={() => navigate(`/documents/${doc._id}`)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-hover cursor-pointer transition-colors group"
                >
                  <div className={`tag ${getFileColor(doc.fileType)} text-xs font-mono flex-shrink-0`}>
                    {doc.fileType?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-brand-300 transition-colors">{doc.title}</p>
                    <p className="text-xs text-slate-500">{formatRelativeDate(doc.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm mb-3">No documents yet</p>
              <button onClick={() => navigate('/upload')} className="btn-primary text-sm">Upload First Document</button>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Clock size={16} className="text-brand-400" /> Recent Chats
            </h3>
            <button onClick={() => navigate('/chat')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="shimmer h-14 rounded-lg" />)}</div>
          ) : data?.recentChats?.length > 0 ? (
            <div className="space-y-2">
              {data.recentChats.map(chat => (
                <div
                  key={chat._id}
                  onClick={() => navigate(`/chat/${chat._id}`)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-hover cursor-pointer transition-colors group"
                >
                  <div className="w-8 h-8 bg-brand-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={14} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-brand-300 transition-colors">{chat.title}</p>
                    <p className="text-xs text-slate-500">{formatRelativeDate(chat.updatedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm mb-3">No chats yet</p>
              <button onClick={() => navigate('/chat')} className="btn-primary text-sm">Start a Chat</button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
