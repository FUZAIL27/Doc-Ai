const variants = {
  default: 'bg-slate-700 text-slate-300',
  brand: 'bg-brand-600/20 text-brand-400 border border-brand-600/30',
  success: 'bg-green-500/20 text-green-400 border border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
  pdf: 'bg-red-500/20 text-red-400',
  docx: 'bg-blue-500/20 text-blue-400',
  txt: 'bg-green-500/20 text-green-400',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`tag ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
