export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export const formatRelativeDate = (date) => {
  const now = new Date()
  const d = new Date(date)
  const diff = now - d
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export const getFileIcon = (type) => {
  const icons = { pdf: '📄', docx: '📝', txt: '📃' }
  return icons[type] || '📁'
}

export const getFileColor = (type) => {
  const colors = {
    pdf: 'text-red-400 bg-red-400/10',
    docx: 'text-blue-400 bg-blue-400/10',
    txt: 'text-green-400 bg-green-400/10'
  }
  return colors[type] || 'text-slate-400 bg-slate-400/10'
}

export const truncate = (str, n = 60) =>
  str?.length > n ? str.substring(0, n) + '...' : str
