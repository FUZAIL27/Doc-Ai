import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import api from '../utils/api'
import { formatFileSize } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function UploadPage() {
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((accepted, rejected) => {
    rejected.forEach(r => toast.error(`${r.file.name}: ${r.errors[0]?.message}`))
    const newFiles = accepted.map(f => ({
      file: f,
      id: Math.random().toString(36).slice(2),
      title: f.name.replace(/\.[^.]+$/, ''),
      status: 'pending',
    }))
    setFiles(prev => [...prev, ...newFiles])
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

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id))
  const updateTitle = (id, title) => setFiles(prev => prev.map(f => f.id === id ? { ...f, title } : f))

  const uploadAll = async () => {
    if (files.length === 0) return
    setUploading(true)

    for (const item of files) {
      if (item.status === 'done') continue
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'uploading' } : f))
      try {
        const formData = new FormData()
        formData.append('file', item.file)
        formData.append('title', item.title)
        await api.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'done' } : f))
      } catch (err) {
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', error: err.response?.data?.error || 'Upload failed' } : f))
      }
    }

    setUploading(false)
    const failed = files.filter(f => f.status === 'error').length
    if (failed === 0) {
      toast.success('All documents uploaded successfully!')
      setTimeout(() => navigate('/documents'), 1000)
    } else {
      toast.error(`${failed} file(s) failed to upload`)
    }
  }

  const fileExt = (name) => name?.split('.').pop()?.toUpperCase()
  const extColor = { PDF: 'text-red-400 bg-red-400/10', DOCX: 'text-blue-400 bg-blue-400/10', TXT: 'text-green-400 bg-green-400/10' }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Upload Documents</h2>
        <p className="text-slate-400 mt-1">Support for PDF, DOCX, and TXT files up to 20MB</p>
      </div>

      {/* Dropzone */}
      <motion.div
        {...getRootProps()}
        animate={{ borderColor: isDragActive ? '#6366f1' : '#2e2e4a', backgroundColor: isDragActive ? 'rgba(99,102,241,0.05)' : 'transparent' }}
        className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors hover:border-brand-600/50 hover:bg-brand-600/5"
      >
        <input {...getInputProps()} />
        <motion.div animate={{ scale: isDragActive ? 1.05 : 1 }} transition={{ duration: 0.2 }}>
          <div className="w-16 h-16 bg-brand-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload size={28} className="text-brand-400" />
          </div>
          <p className="text-lg font-medium text-white mb-2">
            {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
          </p>
          <p className="text-slate-400 mb-4">or click to browse your computer</p>
          <div className="flex items-center justify-center gap-3">
            {['PDF', 'DOCX', 'TXT'].map(ext => (
              <span key={ext} className={`tag ${extColor[ext]}`}>{ext}</span>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">Max file size: 20MB</p>
        </motion.div>
      </motion.div>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {files.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-card p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`tag ${extColor[fileExt(item.file.name)] || 'text-slate-400 bg-slate-400/10'} flex-shrink-0`}>
                    {fileExt(item.file.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateTitle(item.id, e.target.value)}
                      disabled={item.status !== 'pending'}
                      className="bg-transparent text-white text-sm font-medium w-full focus:outline-none border-b border-transparent focus:border-brand-500 pb-0.5 transition-colors"
                    />
                    <p className="text-xs text-slate-500 mt-0.5">{formatFileSize(item.file.size)}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.status === 'pending' && (
                      <button onClick={() => removeFile(item.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                        <X size={16} />
                      </button>
                    )}
                    {item.status === 'uploading' && (
                      <Loader size={16} className="text-brand-400 animate-spin" />
                    )}
                    {item.status === 'done' && (
                      <CheckCircle size={16} className="text-green-400" />
                    )}
                    {item.status === 'error' && (
                      <div className="flex items-center gap-1 text-red-400">
                        <AlertCircle size={16} />
                        <span className="text-xs">{item.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                onClick={uploadAll}
                disabled={uploading || files.every(f => f.status === 'done')}
                className="btn-primary flex-1 justify-center py-3"
              >
                {uploading ? (
                  <><Loader size={16} className="animate-spin" /> Uploading...</>
                ) : (
                  <><Upload size={16} /> Upload {files.filter(f => f.status === 'pending').length} File(s)</>
                )}
              </button>
              <button
                onClick={() => setFiles([])}
                disabled={uploading}
                className="btn-secondary px-6"
              >
                Clear All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
