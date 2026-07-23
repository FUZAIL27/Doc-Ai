import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  FileText, MessageSquare, Zap, BookOpen, Tag, ClipboardList,
  Brain, Lightbulb, ArrowLeft, Loader, Edit3, Check, X
} from 'lucide-react'
import api from '../utils/api'
import { formatDate, getFileColor } from '../utils/helpers'
import Badge from '../components/ui/Badge'
import toast from 'react-hot-toast'

const TABS = [
  { id:'summary',  label:'Summary',   icon:FileText      },
  { id:'insights', label:'Insights',  icon:Lightbulb     },
  { id:'keywords', label:'Keywords',  icon:Tag           },
  { id:'notes',    label:'Notes',     icon:BookOpen      },
  { id:'quiz',     label:'Quiz',      icon:ClipboardList },
]

export default function DocumentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tabsRef = useRef(null)
  const [doc,          setDoc]          = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [tab,          setTab]          = useState('summary')
  const [analyzing,    setAnalyzing]    = useState('')
  const [quiz,         setQuiz]         = useState(null)
  const [answers,      setAnswers]      = useState({})
  const [submitted,    setSubmitted]    = useState(false)
  const [editTitle,    setEditTitle]    = useState(false)
  const [newTitle,     setNewTitle]     = useState('')

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
        setQuiz(data.result); setAnswers({}); setSubmitted(false)
      } else {
        setDoc(prev => ({
          ...prev,
          ...(action === 'summarize' && { summary:    data.result }),
          ...(action === 'insights'  && { keyInsights:data.result }),
          ...(action === 'keywords'  && { keywords:   data.result }),
          ...(action === 'notes'     && { notes:      data.result }),
          ...(action === 'tags'      && { tags:       data.result }),
        }))
      }
      toast.success('Done!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed')
    } finally { setAnalyzing('') }
  }

  const saveTitle = async () => {
    try {
      await api.put(`/documents/${id}`, { title: newTitle })
      setDoc(p => ({ ...p, title: newTitle }))
      setEditTitle(false)
      toast.success('Title updated')
    } catch { toast.error('Update failed') }
  }

  const score = quiz ? Object.entries(answers).filter(([i,a]) => quiz[+i]?.correct === a).length : 0

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader size={30} className="text-brand-400 animate-spin" />
    </div>
  )
  if (!doc) return <div className="text-center text-slate-400 py-20">Document not found</div>

  const GenBtn = ({ action, hasData }) => (
    <button onClick={() => analyze(action)} disabled={!!analyzing}
      className="btn-secondary text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2">
      {analyzing === action
        ? <Loader size={13} className="animate-spin"/>
        : <Zap size={13}/>
      }
      <span className="hidden xs:inline">{hasData ? 'Regen' : 'Generate'}</span>
    </button>
  )

  const EmptyState = ({ icon: Icon, message, action, actionLabel }) => (
    <div className="text-center py-10 sm:py-14 text-slate-500">
      <Icon size={36} className="mx-auto mb-3 text-slate-600" />
      <p className="text-sm mb-4">{message}</p>
      <button onClick={action} className="btn-primary justify-center mx-auto text-sm">
        <Zap size={14}/> {actionLabel}
      </button>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start gap-2 sm:gap-4">
        <button onClick={() => navigate('/documents')}
          className="btn-ghost p-1.5 sm:p-2 mt-0.5 flex-shrink-0">
          <ArrowLeft size={18}/>
        </button>

        <div className="flex-1 min-w-0">
          {editTitle ? (
            <div className="flex items-center gap-2">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                className="input-field text-base sm:text-xl font-bold flex-1" autoFocus
                onKeyDown={e => { if (e.key==='Enter') saveTitle(); if (e.key==='Escape') setEditTitle(false) }}/>
              <button onClick={saveTitle}  className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg"><Check size={16}/></button>
              <button onClick={() => setEditTitle(false)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"><X size={16}/></button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h2 className="text-lg sm:text-2xl font-bold text-white truncate">{doc.title}</h2>
              <button onClick={() => setEditTitle(true)}
                className="opacity-0 group-hover:opacity-100 sm:opacity-100 p-1.5 text-slate-500 hover:text-white rounded transition-opacity flex-shrink-0">
                <Edit3 size={13}/>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant={doc.fileType}>{doc.fileType?.toUpperCase()}</Badge>
            <span className="text-[11px] sm:text-xs text-slate-500">{doc.wordCount?.toLocaleString()} words</span>
            <span className="text-[11px] sm:text-xs text-slate-500">{doc.pageCount}p</span>
            <span className="text-[11px] sm:text-xs text-slate-500 hidden sm:inline">{formatDate(doc.createdAt)}</span>
            {doc.aiAnalyzed && <Badge variant="success">AI ✓</Badge>}
          </div>

          {doc.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {doc.tags.map(t => (
                <span key={t} className="text-[10px] sm:text-xs bg-brand-600/10 text-brand-400 border border-brand-600/20 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => navigate(`/chat?doc=${id}`)}
          className="btn-primary flex-shrink-0 text-xs sm:text-sm px-2.5 sm:px-4 py-2">
          <MessageSquare size={14}/>
          <span className="hidden sm:inline">Chat</span>
        </button>
      </div>

      {/* ── Tab bar — horizontal scroll on mobile ── */}
      <div ref={tabsRef} className="flex gap-1 bg-dark-200 p-1 rounded-xl overflow-x-auto scrollbar-hide -mx-0 snap-x snap-mandatory">
        {TABS.map(({ id:tid, label, icon:Icon }) => (
          <button key={tid} onClick={() => setTab(tid)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap snap-start flex-shrink-0 touch-manipulation ${
              tab===tid ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white active:bg-dark-hover'
            }`}>
            <Icon size={13} className="flex-shrink-0"/> {label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
          transition={{ duration:0.15 }}
          className="glass-card p-4 sm:p-6 min-h-48">

          {/* Summary */}
          {tab==='summary' && (
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                  <FileText size={15} className="text-brand-400"/> Summary
                </h3>
                <GenBtn action="summarize" hasData={!!doc.summary}/>
              </div>
              {doc.summary
                ? <div className="prose prose-invert prose-sm max-w-none text-sm sm:text-base leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.summary}</ReactMarkdown>
                  </div>
                : <EmptyState icon={Brain} message="No summary yet." action={() => analyze('summarize')} actionLabel="Generate Summary"/>
              }
            </div>
          )}

          {/* Insights */}
          {tab==='insights' && (
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                  <Lightbulb size={15} className="text-brand-400"/> Key Insights
                </h3>
                <GenBtn action="insights" hasData={doc.keyInsights?.length > 0}/>
              </div>
              {doc.keyInsights?.length > 0
                ? <div className="space-y-2 sm:space-y-3">
                    {doc.keyInsights.map((ins, i) => (
                      <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
                        className="flex gap-2.5 p-3 bg-brand-600/5 border border-brand-600/20 rounded-lg">
                        <span className="text-brand-400 font-bold text-xs sm:text-sm flex-shrink-0 mt-0.5">{i+1}.</span>
                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{ins}</p>
                      </motion.div>
                    ))}
                  </div>
                : <EmptyState icon={Lightbulb} message="No insights yet." action={() => analyze('insights')} actionLabel="Extract Insights"/>
              }
            </div>
          )}

          {/* Keywords */}
          {tab==='keywords' && (
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                  <Tag size={15} className="text-brand-400"/> Keywords
                </h3>
                <GenBtn action="keywords" hasData={doc.keywords?.length > 0}/>
              </div>
              {doc.keywords?.length > 0
                ? <div className="flex flex-wrap gap-2">
                    {doc.keywords.map((kw, i) => (
                      <motion.span key={i} initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.025 }}
                        className="bg-dark-hover border border-dark-border text-slate-300 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm hover:border-brand-600/40 transition-colors">
                        {kw}
                      </motion.span>
                    ))}
                  </div>
                : <EmptyState icon={Tag} message="No keywords yet." action={() => analyze('keywords')} actionLabel="Extract Keywords"/>
              }
            </div>
          )}

          {/* Notes */}
          {tab==='notes' && (
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                  <BookOpen size={15} className="text-brand-400"/> Study Notes
                </h3>
                <GenBtn action="notes" hasData={!!doc.notes}/>
              </div>
              {doc.notes
                ? <div className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.notes}</ReactMarkdown>
                  </div>
                : <EmptyState icon={BookOpen} message="No notes yet." action={() => analyze('notes')} actionLabel="Generate Notes"/>
              }
            </div>
          )}

          {/* Quiz */}
          {tab==='quiz' && (
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                  <ClipboardList size={15} className="text-brand-400"/> Quiz
                </h3>
                <GenBtn action="quiz" hasData={quiz?.length > 0}/>
              </div>
              {quiz?.length > 0
                ? <div className="space-y-5 sm:space-y-6">
                    {quiz.map((q, qi) => (
                      <div key={qi} className="space-y-2.5">
                        <p className="font-medium text-white text-xs sm:text-sm">{qi+1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((opt, oi) => {
                            const letter    = opt.charAt(0)
                            const isSelected = answers[qi] === letter
                            const isCorrect  = submitted && letter === q.correct
                            const isWrong    = submitted && isSelected && !isCorrect
                            return (
                              <button key={oi} disabled={submitted}
                                onClick={() => setAnswers(p => ({...p,[qi]:letter}))}
                                className={`w-full text-left p-2.5 sm:p-3 rounded-lg border text-xs sm:text-sm transition-all touch-manipulation touch-card ${
                                  isCorrect  ? 'bg-green-500/20 border-green-500/40 text-green-300' :
                                  isWrong    ? 'bg-red-500/20 border-red-500/40 text-red-300' :
                                  isSelected ? 'bg-brand-600/20 border-brand-600/40 text-brand-300' :
                                  'bg-dark-hover border-dark-border text-slate-300 active:border-brand-600/30'
                                }`}>
                                {opt}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                    {!submitted
                      ? <button onClick={() => setSubmitted(true)}
                          disabled={Object.keys(answers).length < quiz.length}
                          className="btn-primary w-full justify-center disabled:opacity-40 text-sm py-3">
                          Submit Answers
                        </button>
                      : <div className="glass-card p-4 text-center bg-brand-600/10 border-brand-600/30">
                          <p className="text-base sm:text-lg font-bold text-white">Score: {score}/{quiz.length}</p>
                          <p className="text-slate-400 text-xs sm:text-sm mt-1">
                            {score===quiz.length ? '🎉 Perfect!' : score>=quiz.length/2 ? '👍 Good job!' : '📚 Keep studying!'}
                          </p>
                          <button onClick={() => { setAnswers({}); setSubmitted(false) }}
                            className="btn-secondary text-xs sm:text-sm mt-3 mx-auto justify-center">
                            Try Again
                          </button>
                        </div>
                    }
                  </div>
                : <EmptyState icon={ClipboardList} message="No quiz yet." action={() => analyze('quiz')} actionLabel="Generate Quiz"/>
              }
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
