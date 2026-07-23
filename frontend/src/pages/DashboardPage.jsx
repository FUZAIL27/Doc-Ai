import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, MessageSquare, Zap, TrendingUp, Upload, ArrowRight, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../utils/api'
import useAuthStore from '../store/authStore'
import { formatRelativeDate, getFileColor } from '../utils/helpers'
import { CardSkeleton, DocumentSkeleton } from '../components/ui/LoadingSkeleton'

const CustomTooltip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="glass-card px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400">{label}</p>
      <p className="text-white font-medium">Uploads: {payload[0].value}</p>
    </div>
  ) : null

export default function DashboardPage() {
  const { user }  = useAuthStore()
  const navigate  = useNavigate()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const chartData = data?.uploadsByDay?.map(d => ({ date:d._id?.slice(5), uploads:d.count })) || []

  const STATS = [
    { icon:FileText,     label:'Documents',   value:data?.stats?.totalDocs  || 0, sub:`+${data?.stats?.recentDocs  ||0} this week`, color:'text-brand-400',  bg:'bg-brand-600/10'  },
    { icon:MessageSquare,label:'AI Chats',    value:data?.stats?.totalChats || 0, sub:`+${data?.stats?.recentChats ||0} this week`, color:'text-green-400',  bg:'bg-green-600/10'  },
    { icon:Zap,          label:'Tokens Used', value:`${((data?.stats?.totalTokensUsed||0)/1000).toFixed(1)}K`,                    color:'text-purple-400', bg:'bg-purple-600/10' },
    { icon:TrendingUp,   label:'This Week',   value:data?.stats?.recentDocs  || 0,                                                color:'text-orange-400', bg:'bg-orange-600/10' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Welcome */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Good day, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Here's your document activity</p>
        </div>
        <button onClick={() => navigate('/upload')} className="btn-primary self-start sm:self-auto text-sm">
          <Upload size={15}/> Upload Document
        </button>
      </motion.div>

      {/* Stats 2×2 on mobile, 4 across on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {loading
          ? Array(4).fill(0).map((_,i) => <CardSkeleton key={i}/>)
          : STATS.map(({ icon:Icon, label, value, sub, color, bg }, i) => (
            <motion.div key={i} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="glass-card p-3 sm:p-5 hover:border-brand-600/30 transition-colors">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${bg} rounded-lg flex items-center justify-center mb-2.5 sm:mb-3`}>
                <Icon size={16} className={color}/>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white mb-0.5">{value}</div>
              <div className="text-[11px] sm:text-sm font-medium text-slate-300 leading-tight">{label}</div>
              {sub && <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{sub}</div>}
            </motion.div>
          ))
        }
      </div>

      {/* Chart + Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="glass-card p-4 sm:p-5 lg:col-span-2">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-300 mb-3 sm:mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-brand-400"/> Upload Activity (30 days)
          </h3>
          {loading ? (
            <div className="h-36 sm:h-48 shimmer rounded-lg"/>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="upGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill:'#64748b', fontSize:10 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:'#64748b', fontSize:10 }} axisLine={false} tickLine={false} allowDecimals={false} width={22}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="uploads" stroke="#6366f1" fill="url(#upGrad)" strokeWidth={2} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-36 flex flex-col items-center justify-center text-slate-600 text-sm gap-2">
              <TrendingUp size={24} className="text-slate-700"/>
              <p className="text-xs">No activity yet</p>
              <button onClick={() => navigate('/upload')} className="text-brand-400 hover:underline text-xs">Upload first doc →</button>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.38 }}
          className="glass-card p-4 sm:p-5">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-300 mb-3 sm:mb-4">Document Types</h3>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="shimmer h-7 rounded-lg"/>)}</div>
          ) : data?.docsByType?.length > 0 ? (
            <div className="space-y-2.5 sm:space-y-3">
              {data.docsByType.map(({ _id:type, count }) => {
                const pct = Math.round((count / (data.stats.totalDocs||1)) * 100)
                return (
                  <div key={type}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 uppercase font-medium">{type}</span>
                      <span className="text-slate-500">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-dark-border rounded-full overflow-hidden">
                      <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.6, delay:0.4 }}
                        className="h-full bg-brand-500 rounded-full"/>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-slate-600 text-xs text-center py-6">No docs yet</div>
          )}
        </motion.div>
      </div>

      {/* Recent Docs + Chats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {[
          {
            title:'Recent Documents', key:'recentDocuments', icon:FileText, link:'/documents',
            render: doc => (
              <div key={doc._id} onClick={() => navigate(`/documents/${doc._id}`)}
                className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-dark-hover active:bg-dark-border cursor-pointer transition-colors group touch-card">
                <div className={`tag ${getFileColor(doc.fileType)} text-[10px] flex-shrink-0`}>{doc.fileType?.toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white truncate group-hover:text-brand-300 transition-colors">{doc.title}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500">{formatRelativeDate(doc.createdAt)}</p>
                </div>
              </div>
            )
          },
          {
            title:'Recent Chats', key:'recentChats', icon:Clock, link:'/chat',
            render: chat => (
              <div key={chat._id} onClick={() => navigate(`/chat/${chat._id}`)}
                className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-dark-hover active:bg-dark-border cursor-pointer transition-colors group touch-card">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={13} className="text-brand-400"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white truncate group-hover:text-brand-300 transition-colors">{chat.title}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500">{formatRelativeDate(chat.updatedAt)}</p>
                </div>
              </div>
            )
          },
        ].map(({ title, key, icon:Icon, link, render }, idx) => (
          <motion.div key={idx} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5+idx*0.08 }}
            className="glass-card p-3 sm:p-5">
            <div className="flex items-center justify-between mb-2.5 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-300 flex items-center gap-1.5 sm:gap-2">
                <Icon size={13} className="text-brand-400"/> {title}
              </h3>
              <button onClick={() => navigate(link)} className="text-[11px] sm:text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                View all <ArrowRight size={10}/>
              </button>
            </div>
            {loading ? (
              <div className="space-y-1.5">{[1,2,3].map(i => <div key={i} className="shimmer h-10 rounded-lg"/>)}</div>
            ) : data?.[key]?.length > 0 ? (
              <div className="space-y-0.5">{data[key].map(render)}</div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Icon size={24} className="text-slate-600 mx-auto mb-2"/>
                <p className="text-slate-500 text-xs mb-2">Nothing here yet</p>
                <button onClick={() => navigate(key==='recentDocuments' ? '/upload' : '/chat')}
                  className="btn-primary text-xs mx-auto justify-center px-3 py-1.5">
                  {key==='recentDocuments' ? <><Upload size={12}/> Upload</> : <><MessageSquare size={12}/> New Chat</>}
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
