import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Upload, FileText, Trash2, MessageSquare, Grid, List } from 'lucide-react'
import api from '../utils/api'
import { formatDate, formatFileSize, getFileColor } from '../utils/helpers'
import { DocumentSkeleton } from '../components/ui/LoadingSkeleton'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'

export default function DocumentsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [docs,       setDocs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState(searchParams.get('search') || '')
  const [filter,     setFilter]     = useState('')
  const [view,       setView]       = useState('grid')
  const [deleteDoc,  setDeleteDoc]  = useState(null)
  const [deleting,   setDeleting]   = useState(false)
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page, limit:20 })
      if (search) p.set('search', search)
      if (filter) p.set('type', filter)
      const { data } = await api.get(`/documents?${p}`)
      setDocs(data.documents)
      setTotalPages(data.totalPages)
    } catch { toast.error('Failed to load documents') }
    finally { setLoading(false) }
  }, [page, search, filter])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const handleDelete = async () => {
    if (!deleteDoc) return
    setDeleting(true)
    try {
      await api.delete(`/documents/${deleteDoc._id}`)
      toast.success('Document deleted')
      setDeleteDoc(null)
      fetchDocs()
    } catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const ActionBtns = ({ doc, e }) => (
    <div className="flex gap-1">
      <button onClick={ev => { ev.stopPropagation(); navigate(`/chat?doc=${doc._id}`) }}
        className="p-1.5 rounded-lg hover:bg-brand-600/20 text-slate-400 hover:text-brand-400 transition-colors touch-manipulation">
        <MessageSquare size={13}/>
      </button>
      <button onClick={ev => { ev.stopPropagation(); setDeleteDoc(doc) }}
        className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors touch-manipulation">
        <Trash2 size={13}/>
      </button>
    </div>
  )

  const GridCard = ({ doc }) => (
    <motion.div initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
      className="glass-card p-3 sm:p-4 hover:border-brand-600/30 transition-all cursor-pointer group touch-card active:scale-[0.98]"
      onClick={() => navigate(`/documents/${doc._id}`)}>
      <div className="flex items-start justify-between mb-2.5">
        <div className={`tag ${getFileColor(doc.fileType)} text-[10px]`}>
          <FileText size={10}/> {doc.fileType?.toUpperCase()}
        </div>
        {/* Always visible on mobile, hover on desktop */}
        <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <ActionBtns doc={doc}/>
        </div>
      </div>
      <h3 className="font-semibold text-white text-xs sm:text-sm mb-2 group-hover:text-brand-300 transition-colors line-clamp-2 leading-tight">{doc.title}</h3>
      {doc.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {doc.tags.slice(0,2).map(t => (
            <span key={t} className="text-[9px] sm:text-[10px] bg-dark-hover text-slate-400 px-1.5 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 pt-2 border-t border-dark-border">
        <span>{doc.wordCount?.toLocaleString()} words</span>
        <span>{formatDate(doc.createdAt)}</span>
      </div>
    </motion.div>
  )

  const ListRow = ({ doc }) => (
    <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
      className="glass-card p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 hover:border-brand-600/30 transition-all cursor-pointer group touch-card active:scale-[0.99]"
      onClick={() => navigate(`/documents/${doc._id}`)}>
      <div className={`tag ${getFileColor(doc.fileType)} flex-shrink-0 text-[10px]`}>{doc.fileType?.toUpperCase()}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-white text-xs sm:text-sm group-hover:text-brand-300 transition-colors truncate">{doc.title}</h3>
        <p className="text-[10px] sm:text-xs text-slate-500">{doc.wordCount?.toLocaleString()} words · {formatFileSize(doc.fileSize)}</p>
      </div>
      <span className="text-[10px] sm:text-xs text-slate-500 flex-shrink-0 hidden sm:block">{formatDate(doc.createdAt)}</span>
      {/* Mobile: always show. Desktop: hover */}
      <div className="flex gap-1 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <ActionBtns doc={doc}/>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Documents</h2>
        <button onClick={() => navigate('/upload')} className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2">
          <Upload size={14}/> <span className="hidden sm:inline">Upload</span>
        </button>
      </div>

      {/* Search + filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
          <input type="text" placeholder="Search documents..." value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key==='Enter' && setPage(1)}
            className="input-field pl-9 py-2.5 text-sm"/>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1) }}
            className="input-field py-2.5 text-sm w-auto flex-1 sm:flex-none cursor-pointer min-w-[100px]"
            style={{ fontSize:'16px' }}>
            <option value="">All Types</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
          </select>
          {[['grid', Grid], ['list', List]].map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)}
              className={`p-2.5 rounded-lg border transition-colors touch-manipulation ${
                view===v ? 'bg-brand-600/20 border-brand-600/40 text-brand-400' : 'border-dark-border text-slate-500 hover:text-white'
              }`}>
              <Icon size={16}/>
            </button>
          ))}
        </div>
      </div>

      {/* Documents grid/list */}
      {loading ? (
        <div className={view==='grid' ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4' : 'space-y-2'}>
          {Array(6).fill(0).map((_,i) => <DocumentSkeleton key={i}/>)}
        </div>
      ) : docs.length === 0 ? (
        <div className="glass-card p-10 sm:p-16 text-center">
          <FileText size={36} className="text-slate-600 mx-auto mb-3"/>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2">No documents found</h3>
          <p className="text-slate-400 text-xs sm:text-sm mb-5">
            {search ? 'Try a different search term' : 'Upload your first document to get started'}
          </p>
          <button onClick={() => navigate('/upload')} className="btn-primary mx-auto justify-center text-sm">
            <Upload size={14}/> Upload Document
          </button>
        </div>
      ) : view==='grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {docs.map(doc => <GridCard key={doc._id} doc={doc}/>)}
        </div>
      ) : (
        <div className="space-y-2">{docs.map(doc => <ListRow key={doc._id} doc={doc}/>)}</div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button disabled={page===1} onClick={() => setPage(p=>p-1)}
            className="btn-secondary text-xs sm:text-sm px-3 sm:px-4 disabled:opacity-40">Prev</button>
          <span className="text-slate-400 text-xs sm:text-sm">{page} / {totalPages}</span>
          <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)}
            className="btn-secondary text-xs sm:text-sm px-3 sm:px-4 disabled:opacity-40">Next</button>
        </div>
      )}

      <Modal isOpen={!!deleteDoc} onClose={() => setDeleteDoc(null)} title="Delete Document">
        <p className="text-slate-400 text-sm mb-5">
          Delete <strong className="text-white">"{deleteDoc?.title}"</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteDoc(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 justify-center bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
            {deleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Trash2 size={14}/>}
            Delete
          </button>
        </div>
      </Modal>
    </div>
  )
}
