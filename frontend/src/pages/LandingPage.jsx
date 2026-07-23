import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, FileText, MessageSquare, Zap, Shield, BarChart3, ArrowRight, Star, CheckCircle } from 'lucide-react'

const features = [
  { icon: FileText,      title: 'Multi-Format',    desc: 'Upload PDF, DOCX, and TXT files up to 20MB.' },
  { icon: MessageSquare, title: 'Chat with Docs',  desc: 'Ask anything — AI answers instantly from your content.' },
  { icon: Zap,           title: 'Instant Analysis',desc: 'Summaries, insights, and keywords in seconds.' },
  { icon: Brain,         title: 'Smart Extraction',desc: 'Auto-generates tags, notes, and quiz questions.' },
  { icon: BarChart3,     title: 'Analytics',       desc: 'Track uploads, chats, and AI usage visually.' },
  { icon: Shield,        title: 'Secure',          desc: 'Your documents are private and encrypted.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen min-h-dvh bg-dark-300 text-white">

      {/* Nav */}
      <nav className="border-b border-dark-border bg-dark-200/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain size={16} className="text-white" />
            </div>
            <span className="font-bold text-base sm:text-lg">DocMind AI</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/login')}  className="btn-ghost text-sm px-3 py-2">Login</button>
            <button onClick={() => navigate('/signup')} className="btn-primary text-sm px-3 sm:px-4 py-2">
              <span className="hidden xs:inline">Get Started</span>
              <span className="xs:hidden">Sign Up</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-purple-900/10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-[600px] h-48 sm:h-[400px] bg-brand-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
            <div className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-600/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-brand-400 mb-6 sm:mb-8">
              <Star size={12} className="fill-brand-400" />
              Gemini · Groq · OpenRouter — All Free
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight tracking-tight">
              Chat with Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 mt-1">
                Documents
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-400 mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed px-2">
              Upload PDFs, DOCX and TXT files. Get AI summaries, extract insights, and chat with your content using free AI models.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => navigate('/signup')}
                className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 w-full sm:w-auto justify-center shadow-xl shadow-brand-600/20">
                Start for Free <ArrowRight size={17} />
              </button>
              <button onClick={() => navigate('/login')}
                className="btn-secondary text-sm sm:text-base px-6 sm:px-8 py-3 w-full sm:w-auto justify-center">
                Sign In
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 border-y border-dark-border bg-dark-200/30">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-center">
          {[['3+','AI Providers'],['10x','Faster Research'],['100%','Free Tier'],['∞','Documents']].map(([v,l],i) => (
            <motion.div key={i} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
              transition={{ delay:i*0.08 }} viewport={{ once:true }}>
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-400 mb-0.5">{v}</div>
              <div className="text-xs sm:text-sm text-slate-500">{l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-14 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Everything you need</h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">From raw file to deep understanding — in seconds, not hours.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map(({ icon:Icon, title, desc }, i) => (
              <motion.div key={i} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
                transition={{ delay:i*0.07 }} viewport={{ once:true }}
                className="glass-card p-4 sm:p-6 hover:border-brand-600/40 transition-all group touch-card">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-600/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-brand-600/30 transition-colors">
                  <Icon size={18} className="text-brand-400" />
                </div>
                <h3 className="font-semibold text-white mb-1.5 text-sm sm:text-base">{title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center glass-card p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-purple-600/5 pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 relative z-10">Ready to get started?</h2>
          <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base relative z-10">Free forever. No credit card required.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6 sm:mb-8">
            {['No credit card','Free AI models','Unlimited uploads'].map((t,i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400">
                <CheckCircle size={13} className="text-green-400 flex-shrink-0" />{t}
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/signup')}
            className="btn-primary text-sm sm:text-base px-8 sm:px-10 py-3 mx-auto w-full sm:w-auto justify-center shadow-xl shadow-brand-600/20 relative z-10">
            Get Started Free <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 border-t border-dark-border text-center text-xs sm:text-sm text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain size={15} className="text-brand-400" />
          <span className="font-semibold text-white">DocMind AI</span>
        </div>
        <p>© 2024 DocMind AI. Built with free AI — Gemini, Groq & OpenRouter.</p>
      </footer>
    </div>
  )
}
