import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  FileText, MessageSquare, Zap, BookOpen, Tag, ClipboardList,
  Brain, Lightbulb, ArrowLeft, Loader, Star, Trash2, Edit3, Check, X
} from 'lucide-react'
import api from '../utils/api'
import { formatDate, formatFileSize, getFileColor } from '../utils/helpers'
import Badge from '../components/ui/Badge'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'insights', label: 'Key Insights', icon: Lightbulb },
  { id: 'keywords', label: 'Keywords', icon: Tag },
  { id: 'notes', label: 'Notes', icon: BookOpen },
  { id: 'quiz', label: 'Quiz', icon: ClipboardList },
]

export default function DocumentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('summary')
  const [analyzing, setAnalyzing] = useState('')
  const [quiz, setQuiz] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [editTitle, setEditTitle] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    api.get(`/documents/${id}`)
      .then(r => { setDoc(r.data.document); setNewTitle(r.data.document.title) })
      .catch(() => toast.error('Document not found'))
      .finally(() => setLoading(false))
  }, [id])

  const analyze = async (action) => {
    setAnalyzing(action)
    try {
      const { data } = await api.post(`/documents/${id}/analyze`, { action })
      if (action === 'quiz') {
        setQuiz(data.result)
        setQuizAnswers({})
        setQuizSubmitted(false)
      } else {
        setDoc(prev => {
          const updates = {}
          if (action === 'summarize') updates.summary = data.result
          if (action === 'insights') updates.keyInsights = data.result
          if (action === 'keywords') updates.keywords = data.result
          if (action === 'notes') updates.notes = data.result
          if (action === 'tags') updates.tags = data.result
          return { ...prev, ...updates }
        })
      }
      toast.success('Analysis complete!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed')
    } finally {
      setAnalyzing('')
    }
  }

  const saveTitle = async () => {
    try {
      await api.put(`/documents/${id}`, { title: newTitle })
      setDoc(prev => ({ ...prev, title: newTitle }))
      setEditTitle(false)
      toast.success('Title updated')
    } catch {
      toast.error('Failed to update title')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader size={32} className="text-brand-400 animate-spin" />
    </div>
  )
  if (!doc) return <div className="text-center text-slate-400 py-20">Document not found</div>

  const quizScore = quiz ? Object.entries(quizAnswers).filter(([qi, ans]) => quiz[parseInt(qi)]?.correct === ans).length : 0

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/documents')} className="btn-ghost p-2 mt-1">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          {editTitle ? (
            <div className="flex items-center gap-2">
              <input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="input-field text-xl font-bold flex-1"
                autoFocus
              />
              <button onClick={saveTitle} className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"><Check size={18} /></button>
              <button onClick={() => setEditTitle(false)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><X size={18} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h2 className="text-2xl font-bold text-white truncate">{doc.title}</h2>
              <button onClick={() => setEditTitle(true)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-500 hover:text-white rounded">
                <Edit3 size={14} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Badge variant={doc.fileType}>{doc.fileType?.toUpperCase()}</Badge>
            <span className="text-xs text-slate-500">{doc.wordCount?.toLocaleString()} words</span>
            <span className="text-xs text-slate-500">{doc.pageCount} pages</span>
            <span className="text-xs text-slate-500">{formatDate(doc.createdAt)}</span>
            {doc.aiAnalyzed && <Badge variant="success">AI Analyzed</Badge>}
          </div>
          {doc.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {doc.tags.map(t => (
                <span key={t} className="text-xs bg-brand-600/10 text-brand-400 border border-brand-600/20 px-2.5 py-1 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => navigate(`/chat?doc=${id}`)}
          className="btn-primary flex-shrink-0"
        >
          <MessageSquare size={16} /> Chat
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-200 p-1 rounded-xl overflow-x-auto">
        {tabs.map(({ id: tid, label, icon: Icon }) => (
          <button
            key={tid}
            onClick={() => setTab(tid)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === tid ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="glass-card p-6 min-h-48">
        {tab === 'summary' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><FileText size={16} className="text-brand-400" /> Summary</h3>
              <button onClick={() => analyze('summarize')} disabled={!!analyzing} className="btn-secondary text-sm">
                {analyzing === 'summarize' ? <Loader size={14} className="animate-spin" /> : <Zap size={14} />}
                {doc.summary ? 'Regenerate' : 'Generate'}
              </button>
            </div>
            {doc.summary ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.summary}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                <Brain size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="mb-4">No summary yet. Generate one with AI.</p>
                <button onClick={() => analyze('summarize')} className="btn-primary justify-center mx-auto">
                  <Zap size={16} /> Generate Summary
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'insights' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><Lightbulb size={16} className="text-brand-400" /> Key Insights</h3>
              <button onClick={() => analyze('insights')} disabled={!!analyzing} className="btn-secondary text-sm">
                {analyzing === 'insights' ? <Loader size={14} className="animate-spin" /> : <Zap size={14} />}
                {doc.keyInsights?.length ? 'Regenerate' : 'Generate'}
              </button>
            </div>
            {doc.keyInsights?.length > 0 ? (
              <div className="space-y-3">
                {doc.keyInsights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-3 p-3 bg-brand-600/5 border border-brand-600/20 rounded-lg"
                  >
                    <span className="text-brand-400 font-bold text-sm flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <p className="text-slate-300 text-sm">{insight}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                <Lightbulb size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="mb-4">No insights extracted yet.</p>
                <button onClick={() => analyze('insights')} className="btn-primary justify-center mx-auto">
                  <Zap size={16} /> Extract Insights
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'keywords' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><Tag size={16} className="text-brand-400" /> Keywords</h3>
              <button onClick={() => analyze('keywords')} disabled={!!analyzing} className="btn-secondary text-sm">
                {analyzing === 'keywords' ? <Loader size={14} className="animate-spin" /> : <Zap size={14} />}
                {doc.keywords?.length ? 'Regenerate' : 'Generate'}
              </button>
            </div>
            {doc.keywords?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {doc.keywords.map((kw, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-dark-hover border border-dark-border text-slate-300 px-3 py-1.5 rounded-full text-sm hover:border-brand-600/40 transition-colors cursor-default"
                  >
                    {kw}
                  </motion.span>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                <Tag size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="mb-4">No keywords extracted yet.</p>
                <button onClick={() => analyze('keywords')} className="btn-primary justify-center mx-auto">
                  <Zap size={16} /> Extract Keywords
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'notes' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><BookOpen size={16} className="text-brand-400" /> Study Notes</h3>
              <button onClick={() => analyze('notes')} disabled={!!analyzing} className="btn-secondary text-sm">
                {analyzing === 'notes' ? <Loader size={14} className="animate-spin" /> : <Zap size={14} />}
                {doc.notes ? 'Regenerate' : 'Generate'}
              </button>
            </div>
            {doc.notes ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.notes}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                <BookOpen size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="mb-4">No notes generated yet.</p>
                <button onClick={() => analyze('notes')} className="btn-primary justify-center mx-auto">
                  <Zap size={16} /> Generate Notes
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'quiz' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><ClipboardList size={16} className="text-brand-400" /> Quiz</h3>
              <button onClick={() => analyze('quiz')} disabled={!!analyzing} className="btn-secondary text-sm">
                {analyzing === 'quiz' ? <Loader size={14} className="animate-spin" /> : <Zap size={14} />}
                {quiz ? 'Regenerate' : 'Generate'}
              </button>
            </div>
            {quiz?.length > 0 ? (
              <div className="space-y-6">
                {quiz.map((q, qi) => (
                  <div key={qi} className="space-y-3">
                    <p className="font-medium text-white text-sm">{qi + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const letter = opt.charAt(0)
                        const isSelected = quizAnswers[qi] === letter
                        const isCorrect = quizSubmitted && letter === q.correct
                        const isWrong = quizSubmitted && isSelected && letter !== q.correct
                        return (
                          <button
                            key={oi}
                            disabled={quizSubmitted}
                            onClick={() => setQuizAnswers(p => ({ ...p, [qi]: letter }))}
                            className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                              isCorrect ? 'bg-green-500/20 border-green-500/40 text-green-300' :
                              isWrong ? 'bg-red-500/20 border-red-500/40 text-red-300' :
                              isSelected ? 'bg-brand-600/20 border-brand-600/40 text-brand-300' :
                              'bg-dark-hover border-dark-border text-slate-300 hover:border-brand-600/30'
                            }`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {!quizSubmitted ? (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    disabled={Object.keys(quizAnswers).length < quiz.length}
                    className="btn-primary w-full justify-center disabled:opacity-40"
                  >
                    Submit Answers
                  </button>
                ) : (
                  <div className="glass-card p-4 text-center bg-brand-600/10 border-brand-600/30">
                    <p className="text-lg font-bold text-white">Score: {quizScore}/{quiz.length}</p>
                    <p className="text-slate-400 text-sm mt-1">{quizScore === quiz.length ? '🎉 Perfect!' : quizScore >= quiz.length / 2 ? '👍 Good job!' : '📚 Keep studying!'}</p>
                    <button onClick={() => { setQuizAnswers({}); setQuizSubmitted(false) }} className="btn-secondary text-sm mt-3 mx-auto justify-center">
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                <ClipboardList size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="mb-4">No quiz generated yet.</p>
                <button onClick={() => analyze('quiz')} className="btn-primary justify-center mx-auto">
                  <Zap size={16} /> Generate Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
