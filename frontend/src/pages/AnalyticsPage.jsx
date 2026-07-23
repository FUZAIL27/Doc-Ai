import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart3, FileText, MessageSquare, Zap, TrendingUp } from 'lucide-react'
import api from '../utils/api'
import { CardSkeleton } from '../components/ui/LoadingSkeleton'

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b']

const TT = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="glass-card px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400">{label}</p>
      <p className="text-white font-medium">{payload[0].name}: {payload[0].value}</p>
    </div>
  ) : null

export default function AnalyticsPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const uploadData = data?.uploadsByDay?.map(d => ({ date:d._id?.slice(5), uploads:d.count })) || []
  const typeData   = data?.docsByType?.map(d => ({ name:d._id?.toUpperCase(), value:d.count })) || []

  const STATS = [
    { icon:FileText,     label:'Total Documents', value:data?.stats?.totalDocs  || 0, color:'text-brand-400',  bg:'bg-brand-600/10'  },
    { icon:MessageSquare,label:'Total Chats',     value:data?.stats?.totalChats || 0, color:'text-purple-400', bg:'bg-purple-600/10' },
    { icon:Zap,          label:'Tokens Used',     value:`${((data?.stats?.totalTokensUsed||0)/1000).toFixed(1)}K`, color:'text-green-400', bg:'bg-green-600/10' },
    { icon:TrendingUp,   label:'This Week',       value:data?.stats?.recentDocs  || 0, color:'text-orange-400',bg:'bg-orange-600/10' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Analytics</h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Track document and AI usage</p>
      </div>

      {/* Stats 2×2 → 4 across */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {loading ? Array(4).fill(0).map((_,i) => <CardSkeleton key={i}/>) :
          STATS.map(({ icon:Icon, label, value, color, bg }, i) => (
            <motion.div key={i} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="glass-card p-3 sm:p-5">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${bg} rounded-lg flex items-center justify-center mb-2.5 sm:mb-3`}>
                <Icon size={16} className={color}/>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
              <p className="text-[10px] sm:text-sm text-slate-400 mt-0.5 leading-tight">{label}</p>
            </motion.div>
          ))
        }
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="glass-card p-4 sm:p-5 lg:col-span-2">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-300 mb-3 sm:mb-4 flex items-center gap-2">
            <BarChart3 size={14} className="text-brand-400"/> Uploads — Last 30 Days
          </h3>
          {loading ? <div className="h-36 shimmer rounded-lg"/> :
            uploadData.length > 0 ? (
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={uploadData}>
                  <defs>
                    <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill:'#64748b', fontSize:10 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:'#64748b', fontSize:10 }} axisLine={false} tickLine={false} allowDecimals={false} width={22}/>
                  <Tooltip content={<TT/>}/>
                  <Area type="monotone" dataKey="uploads" name="Uploads" stroke="#6366f1" fill="url(#aGrad)" strokeWidth={2} dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-36 flex items-center justify-center text-slate-600 text-xs">No data yet</div>
          }
        </motion.div>

        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.38 }}
          className="glass-card p-4 sm:p-5">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-300 mb-3 sm:mb-4">Document Types</h3>
          {loading ? <div className="h-36 shimmer rounded-lg"/> :
            typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={35} outerRadius={58}
                    dataKey="value" nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                    labelLine={false}>
                    {typeData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip content={<TT/>}/>
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-36 flex items-center justify-center text-slate-600 text-xs">No data yet</div>
          }
        </motion.div>
      </div>

      {/* Recent docs table */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.46 }}
        className="glass-card p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-300 mb-3 sm:mb-4 flex items-center gap-2">
          <FileText size={14} className="text-brand-400"/> Recent Documents
        </h3>
        {loading ? (
          <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="shimmer h-9 rounded-lg"/>)}</div>
        ) : data?.recentDocuments?.length > 0 ? (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs sm:text-sm min-w-[320px]">
              <thead>
                <tr className="text-[10px] sm:text-xs text-slate-500 uppercase border-b border-dark-border">
                  <th className="text-left pb-2.5 font-medium pl-1">Title</th>
                  <th className="text-left pb-2.5 font-medium hidden sm:table-cell">Type</th>
                  <th className="text-right pb-2.5 font-medium hidden md:table-cell">Words</th>
                  <th className="text-right pb-2.5 font-medium pr-1">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {data.recentDocuments.map(doc => (
                  <tr key={doc._id} className="hover:bg-dark-hover transition-colors">
                    <td className="py-2.5 font-medium text-white truncate max-w-[140px] sm:max-w-xs pl-1 text-xs sm:text-sm">{doc.title}</td>
                    <td className="py-2.5 hidden sm:table-cell">
                      <span className={`tag text-[10px] ${
                        doc.fileType==='pdf' ? 'text-red-400 bg-red-400/10' :
                        doc.fileType==='docx'? 'text-blue-400 bg-blue-400/10' :
                        'text-green-400 bg-green-400/10'}`}>
                        {doc.fileType?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-400 hidden md:table-cell text-xs">{doc.wordCount?.toLocaleString()}</td>
                    <td className="py-2.5 text-right text-slate-500 text-[10px] sm:text-xs pr-1">{new Date(doc.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="text-center py-8 text-slate-500 text-xs">No documents yet</div>}
      </motion.div>
    </div>
  )
}
