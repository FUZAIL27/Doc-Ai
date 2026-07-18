import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Upload, FileText, Trash2, MessageSquare, Grid, List, Filter } from 'lucide-react'
import api from '../utils/api'
import { formatDate, formatFileSize, getFileColor } from '../utils/helpers'
import { DocumentSkeleton } from '../components/ui/LoadingSkeleton'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'

export default function DocumentsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [filter, setFilter] = useState('')
  const [view, setView] = useState('grid')
  const [deleteDoc, setDeleteDoc] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.set('search', search)
      if (filter) params.set('type', filter)
      const { data } = await api.get(`/documents?${params}`)
      setDocs(data.documents)
      setTotalPages(data.totalPages)
    } catch (err) {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [page, search, filter])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const handleDelete = async () => {
    if (!deleteDoc) return
    try {
      await api.delete(`/documents/${deleteDoc._id}`)
      toast.success('Document deleted')
      setDeleteDoc(null)
      fetchDocs()
    } catch {
      toast.error('Failed to delete document')
    }
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter') { setPage(1); fetchDocs() }
  }

  const GridCard = ({ doc }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-5 hover:border-brand-600/30 transition-all cursor-pointer group"
      onClick={() => navigate(`/documents/${doc._id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`tag ${getFileColor(doc.fileType)}`}>
          <FileText size={12} /> {doc.fileType?.toUpperCase()}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/chat?doc=${doc._id}`) }}
            className="p-1.5 rounded hover:bg-brand-600/20 text-slate-400 hover:text-brand-400 transition-colors"
          >
            <MessageSquare size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteDoc(doc) }}
            className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <h3 className="font-semibold text-white text-sm mb-2 group-hover:text-brand-300 transition-colors line-clamp-2">
        {doc.title}
      </h3>
      {doc.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {doc.tags.slice(0, 3).map(t => (
            <span key={t} className="text-xs bg-dark-hover text-slate-400 px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-3 border-t border-dark-border">
        <span>{doc.wordCount?.toLocaleString()} words</span>
        <span>{formatDate(doc.createdAt)}</span>
      </div>
    </motion.div>
  )

  const ListRow = ({ doc }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-4 flex items-center gap-4 hover:border-brand-600/30 transition-all cursor-pointer group"
      onClick={() => navigate(`/documents/${doc._id}`)}
    >
      <div className={`tag ${getFileColor(doc.fileType)} flex-shrink-0`}>
        {doc.fileType?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-white text-sm group-hover:text-brand-300 transition-colors truncate">{doc.title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{doc.wordCount?.toLocaleString()} words · {formatFileSize(doc.fileSize)}</p>
      </div>
      <div className="flex flex-wrap gap-1 hidden md:flex">
        {doc.tags?.slice(0, 2).map(t => (
          <span key={t} className="text-xs bg-dark-hover text-slate-400 px-2 py-0.5 rounded-full">{t}</span>
        ))}
      </div>
      <span className="text-xs text-slate-500 flex-shrink-0 hidden sm:block">{formatDate(doc.createdAt)}</span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={(e) => { e.stopPropagation(); navigate(`/chat?doc=${doc._id}`) }} className="p-1.5 rounded hover:bg-brand-600/20 text-slate-400 hover:text-brand-400 transition-colors">
          <MessageSquare size={14} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); setDeleteDoc(doc) }} className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Documents</h2>
        <button onClick={() => navigate('/upload')} className="btn-primary">
          <Upload size={16} /> Upload
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(1) }}
            className="input-field w-auto pr-8 cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
          </select>
          <button onClick={() => setView('grid')} className={`p-2.5 rounded-lg border transition-colors ${view === 'grid' ? 'bg-brand-600/20 border-brand-600/40 text-brand-400' : 'border-dark-border text-slate-500 hover:text-white'}`}>
            <Grid size={16} />
          </button>
          <button onClick={() => setView('list')} className={`p-2.5 rounded-lg border transition-colors ${view === 'list' ? 'bg-brand-600/20 border-brand-600/40 text-brand-400' : 'border-dark-border text-slate-500 hover:text-white'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Documents */}
      {loading ? (
        <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {Array(6).fill(0).map((_, i) => <DocumentSkeleton key={i} />)}
        </div>
      ) : docs.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FileText size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No documents found</h3>
          <p className="text-slate-400 mb-6">{search ? 'Try a different search term' : 'Upload your first document to get started'}</p>
          <button onClick={() => navigate('/upload')} className="btn-primary mx-auto justify-center">
            <Upload size={16} /> Upload Document
          </button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map(doc => <GridCard key={doc._id} doc={doc} />)}
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => <ListRow key={doc._id} doc={doc} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm px-4 disabled:opacity-40">Previous</button>
          <span className="text-slate-400 text-sm">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm px-4 disabled:opacity-40">Next</button>
        </div>
      )}

      <Modal isOpen={!!deleteDoc} onClose={() => setDeleteDoc(null)} title="Delete Document">
        <p className="text-slate-400 mb-6">Are you sure you want to delete <strong className="text-white">"{deleteDoc?.title}"</strong>? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteDoc(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleDelete} className="flex-1 justify-center bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </Modal>
    </div>
  )
}
