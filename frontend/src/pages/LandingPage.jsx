import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, FileText, MessageSquare, Zap, Shield, BarChart3, ArrowRight, Star, CheckCircle } from 'lucide-react'

const features = [
  { icon: FileText, title: 'Multi-Format Support', desc: 'Upload PDF, DOCX, and TXT files up to 20MB each.' },
  { icon: MessageSquare, title: 'Chat with Documents', desc: 'Ask anything about your documents with AI-powered chat.' },
  { icon: Zap, title: 'Instant Analysis', desc: 'Get summaries, insights, and keywords in seconds.' },
  { icon: Brain, title: 'Smart Extraction', desc: 'AI extracts key insights, tags, and quiz questions automatically.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track usage, documents, and AI interactions visually.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your documents are encrypted and never shared.' },
]

const stats = [
  { value: '3+', label: 'AI Providers' },
  { value: '10x', label: 'Faster Research' },
  { value: '100%', label: 'Free Tier' },
  { value: '∞', label: 'Documents' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-300 text-white">
      {/* Nav */}
      <nav className="border-b border-dark-border bg-dark-200/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">DocMind AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="btn-ghost text-sm">Login</button>
            <button onClick={() => navigate('/signup')} className="btn-primary text-sm">Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-purple-900/10 pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-600/30 rounded-full px-4 py-2 text-sm text-brand-400 mb-8">
              <Star size={14} className="fill-brand-400" />
              Powered by Gemini, Groq & OpenRouter
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Chat with Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
                Documents
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload PDFs, DOCX, and TXT files. Ask questions, get summaries, extract insights,
              and generate quizzes — all powered by free AI models.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button onClick={() => navigate('/signup')} className="btn-primary text-base px-8 py-3 shadow-lg shadow-brand-600/30">
                Start for Free <ArrowRight size={18} />
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary text-base px-8 py-3">
                Sign In
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-dark-border bg-dark-200/30">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-brand-400 mb-1">{s.value}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to understand documents</h2>
            <p className="text-slate-400 max-w-xl mx-auto">From raw upload to deep understanding — in seconds, not hours.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 hover:border-brand-600/40 transition-colors group"
              >
                <div className="w-10 h-10 bg-brand-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-600/30 transition-colors">
                  <Icon size={20} className="text-brand-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center glass-card p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to understand your documents?</h2>
          <p className="text-slate-400 mb-8">Join thousands of researchers, students, and professionals using DocMind AI.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            {['No credit card required', 'Free AI models', 'Unlimited uploads'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle size={14} className="text-green-400" />
                {item}
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/signup')} className="btn-primary text-base px-10 py-3 shadow-lg shadow-brand-600/30 mx-auto justify-center">
            Get Started Free <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-dark-border text-center text-sm text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain size={16} className="text-brand-400" />
          <span className="font-semibold text-white">DocMind AI</span>
        </div>
        <p>© 2024 DocMind AI. Built with ❤️ using free AI models.</p>
      </footer>
    </div>
  )
}
