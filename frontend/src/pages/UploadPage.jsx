import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import api from '../utils/api'
import { formatFileSize } from '../utils/helpers'
import toast from 'react-hot-toast'

const EXT_COLOR = {
  PDF:'text-red-400 bg-red-400/10',
  DOCX:'text-blue-400 bg-blue-400/10',
  TXT:'text-green-400 bg-green-400/10',
}

export default function UploadPage() {
  const navigate  = useNavigate()
  const [files,     setFiles]     = useState([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((accepted, rejected) => {
    rejected.forEach(r => toast.error(`${r.file.name}: ${r.errors[0]?.message || 'Invalid file'}`))
    setFiles(prev => [
      ...prev,
      ...accepted.map(f => ({
        file: f,
        id: Math.random().toString(36).slice(2),
        title: f.name.replace(/\.[^.]+$/, ''),
        status: 'pending',
        error: '',
      }))
    ])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 20 * 1024 * 1024,
  })

  const ext = (name) => name?.split('.').pop()?.toUpperCase()

  const uploadAll = async () => {
    const pending = files.filter(f => f.status === 'pending')
    if (!pending.length) return
    setUploading(true)
    for (const item of pending) {
      setFiles(p => p.map(f => f.id===item.id ? {...f, status:'uploading'} : f))
      try {
        const fd = new FormData()
        fd.append('file', item.file)
        fd.append('title', item.title)
        await api.post('/documents/upload', fd, { headers:{'Content-Type':'multipart/form-data'} })
        setFiles(p => p.map(f => f.id===item.id ? {...f, status:'done'} : f))
      } catch (err) {
        const error = err.response?.data?.error || 'Upload failed'
        setFiles(p => p.map(f => f.id===item.id ? {...f, status:'error', error} : f))
      }
    }
    setUploading(false)
    const failed = files.filter(f => f.status==='error').length
    if (!failed) {
      toast.success('All uploaded! AI analysis starting...')
      setTimeout(() => navigate('/documents'), 800)
    } else {
      toast.error(`${failed} file(s) failed to upload`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Upload Documents</h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">PDF, DOCX, TXT — up to 20MB each</p>
      </div>

      {/* Drop zone */}
      <motion.div
        {...getRootProps()}
        animate={{
          borderColor: isDragActive ? '#6366f1' : '#2e2e4a',
          backgroundColor: isDragActive ? 'rgba(99,102,241,0.06)' : 'transparent',
        }}
        className="border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-colors hover:border-brand-600/50 hover:bg-brand-600/5 active:scale-[0.99]"
      >
        <input {...getInputProps()}/>
        <motion.div animate={{ scale: isDragActive ? 1.04 : 1 }} transition={{ duration:0.15 }}>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-600/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Upload size={22} className="text-brand-400 sm:hidden"/>
            <Upload size={28} className="text-brand-400 hidden sm:block"/>
          </div>
          <p className="text-sm sm:text-lg font-medium text-white mb-1.5 sm:mb-2">
            {isDragActive ? 'Drop files here...' : 'Tap to browse · Drag & drop'}
          </p>
          <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4">Select files from your device</p>
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {['PDF','DOCX','TXT'].map(e => (
              <span key={e} className={`tag ${EXT_COLOR[e]} text-[10px] sm:text-xs`}>{e}</span>
            ))}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-2.5">Max 20MB per file</p>
        </motion.div>
      </motion.div>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-2 sm:space-y-3">
            {files.map(item => (
              <motion.div key={item.id}
                initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:16 }}
                className="glass-card p-3 sm:p-4">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className={`tag ${EXT_COLOR[ext(item.file.name)] || 'text-slate-400 bg-slate-400/10'} flex-shrink-0 text-[10px]`}>
                    {ext(item.file.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input type="text" value={item.title}
                      disabled={item.status !== 'pending'}
                      onChange={e => setFiles(p => p.map(f => f.id===item.id ? {...f,title:e.target.value} : f))}
                      className="bg-transparent text-white text-xs sm:text-sm font-medium w-full focus:outline-none border-b border-transparent focus:border-brand-500 pb-0.5 transition-colors"
                      style={{ fontSize:'14px' }}/>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{formatFileSize(item.file.size)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {item.status==='pending'   && (
                      <button onClick={() => setFiles(p => p.filter(f => f.id!==item.id))}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1 touch-manipulation">
                        <X size={15}/>
                      </button>
                    )}
                    {item.status==='uploading' && <Loader size={15} className="text-brand-400 animate-spin"/>}
                    {item.status==='done'      && <CheckCircle size={15} className="text-green-400"/>}
                    {item.status==='error'     && <AlertCircle size={15} className="text-red-400 flex-shrink-0"/>}
                  </div>
                </div>
                {item.status==='error' && (
                  <p className="text-[10px] sm:text-xs text-red-400 mt-1.5 pl-1">{item.error}</p>
                )}
              </motion.div>
            ))}

            <div className="flex gap-2 sm:gap-3 pt-1">
              <button onClick={uploadAll}
                disabled={uploading || !files.some(f => f.status==='pending')}
                className="btn-primary flex-1 justify-center py-2.5 sm:py-3 text-sm">
                {uploading
                  ? <><Loader size={14} className="animate-spin"/> Uploading...</>
                  : <><Upload size={14}/> Upload {files.filter(f=>f.status==='pending').length} File(s)</>
                }
              </button>
              <button onClick={() => setFiles([])} disabled={uploading}
                className="btn-secondary px-4 sm:px-6 text-sm disabled:opacity-50">
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
