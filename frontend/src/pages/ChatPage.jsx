import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Send, Plus, MessageSquare, FileText, Trash2, Brain, Loader, ChevronRight, X
} from 'lucide-react'
import api from '../utils/api'
import { formatRelativeDate, getFileColor } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const { id: chatId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)

  const [chats, setChats] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [documents, setDocuments] = useState([])
  const [selectedDocs, setSelectedDocs] = useState([])
  const [showDocPicker, setShowDocPicker] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [sidebarDocs, setSidebarDocs] = useState([])

  useEffect(() => {
    api.get('/chat').then(r => setChats(r.data.chats)).catch(() => {})
    api.get('/documents?limit=50').then(r => setDocuments(r.data.documents)).catch(() => {})

    const docFromQuery = searchParams.get('doc')
    if (docFromQuery) {
      setSelectedDocs([docFromQuery])
      setShowDocPicker(true)
    }
  }, [])

  useEffect(() => {
    if (chatId) {
      setLoadingChat(true)
      api.get(`/chat/${chatId}`)
        .then(r => {
          setCurrentChat(r.data.chat)
          setMessages(r.data.chat.messages || [])
          setSidebarDocs(r.data.chat.documents || [])
        })
        .catch(() => toast.error('Chat not found'))
        .finally(() => setLoadingChat(false))
    } else {
      setCurrentChat(null)
      setMessages([])
      setSidebarDocs([])
    }
  }, [chatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startChat = async () => {
    if (selectedDocs.length === 0) {
      toast.error('Select at least one document')
      return
    }
    try {
      const { data } = await api.post('/chat', { documentIds: selectedDocs })
      setChats(prev => [data.chat, ...prev])
      setShowDocPicker(false)
      setSelectedDocs([])
      navigate(`/chat/${data.chat._id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create chat')
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !chatId || sending) return
    const msg = input.trim()
    setInput('')
    setSending(true)

    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }])

    try {
      const { data } = await api.post(`/chat/${chatId}/message`, { message: msg })
      setMessages(prev => [...prev, { ...data.message, timestamp: new Date() }])
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message')
      setMessages(prev => prev.slice(0, -1))
      setInput(msg)
    } finally {
      setSending(false)
    }
  }

  const deleteChat = async (id, e) => {
    e.stopPropagation()
    try {
      await api.delete(`/chat/${id}`)
      setChats(prev => prev.filter(c => c._id !== id))
      if (chatId === id) navigate('/chat')
    } catch {
      toast.error('Failed to delete chat')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Chat list sidebar */}
      <div className="w-64 flex-shrink-0 glass-card p-3 flex flex-col gap-2 overflow-hidden">
        <button
          onClick={() => setShowDocPicker(true)}
          className="btn-primary w-full justify-center text-sm"
        >
          <Plus size={14} /> New Chat
        </button>
        <div className="flex-1 overflow-y-auto space-y-1 mt-1">
          {chats.map(chat => (
            <div
              key={chat._id}
              onClick={() => navigate(`/chat/${chat._id}`)}
              className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                chatId === chat._id ? 'bg-brand-600/20 text-brand-300 border border-brand-600/30' : 'text-slate-400 hover:bg-dark-hover hover:text-white'
              }`}
            >
              <MessageSquare size={14} className="flex-shrink-0" />
              <span className="truncate flex-1 text-xs">{chat.title}</span>
              <button
                onClick={(e) => deleteChat(chat._id, e)}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-all flex-shrink-0"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {chats.length === 0 && (
            <div className="text-center text-slate-600 text-xs py-8">No chats yet</div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col glass-card overflow-hidden">
        {!chatId ? (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="w-16 h-16 bg-brand-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain size={28} className="text-brand-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Start a Document Chat</h3>
              <p className="text-slate-400 mb-6 max-w-sm">Select one or more documents and start asking questions with AI.</p>
              <button onClick={() => setShowDocPicker(true)} className="btn-primary mx-auto justify-center">
                <Plus size={16} /> Select Documents
              </button>
            </div>
          </div>
        ) : loadingChat ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader size={28} className="text-brand-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-dark-border flex items-center gap-3">
              <MessageSquare size={16} className="text-brand-400" />
              <span className="text-sm font-medium text-white truncate flex-1">{currentChat?.title}</span>
              <div className="flex gap-2">
                {sidebarDocs.slice(0, 3).map(d => (
                  <span key={d._id} className={`tag text-xs ${getFileColor(d.fileType)}`}>
                    {d.title?.substring(0, 12)}{d.title?.length > 12 ? '…' : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-slate-500 py-12">
                  <MessageSquare size={32} className="mx-auto mb-3 text-slate-600" />
                  <p>Ask anything about your document(s)</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                    msg.role === 'user' ? 'bg-brand-600' : 'bg-dark-border'
                  }`}>
                    {msg.role === 'user' ? 'U' : <Brain size={14} className="text-brand-400" />}
                  </div>
                  <div className={`max-w-[75%] px-4 py-3 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-sm'
                      : 'bg-dark-hover text-slate-200 rounded-tl-sm'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
              {sending && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center flex-shrink-0">
                    <Brain size={14} className="text-brand-400" />
                  </div>
                  <div className="bg-dark-hover px-4 py-3 rounded-xl rounded-tl-sm flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="w-2 h-2 bg-brand-400 rounded-full"
                          animate={{ y: [-3,3,-3] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-dark-border">
              <div className="flex gap-3 items-end">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about your document... (Enter to send, Shift+Enter for newline)"
                  rows={2}
                  className="flex-1 bg-dark-200 border border-dark-border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="btn-primary p-3 rounded-xl disabled:opacity-40"
                >
                  {sending ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Document Picker Modal */}
      <AnimatePresence>
        {showDocPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDocPicker(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative glass-card p-6 w-full max-w-lg z-10 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Select Documents</h3>
                <button onClick={() => setShowDocPicker(false)} className="btn-ghost p-1.5"><X size={16} /></button>
              </div>
              <p className="text-sm text-slate-400 mb-4">Choose one or more documents to chat with</p>
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {documents.map(doc => (
                  <label key={doc._id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedDocs.includes(doc._id) ? 'border-brand-600/50 bg-brand-600/10' : 'border-dark-border hover:border-brand-600/30 hover:bg-dark-hover'
                    }`}
                  >
                    <input type="checkbox" checked={selectedDocs.includes(doc._id)} onChange={(e) => {
                      if (e.target.checked) setSelectedDocs(prev => [...prev, doc._id])
                      else setSelectedDocs(prev => prev.filter(id => id !== doc._id))
                    }} className="sr-only" />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedDocs.includes(doc._id) ? 'bg-brand-600 border-brand-600' : 'border-dark-border'
                    }`}>
                      {selectedDocs.includes(doc._id) && <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-current"><path d="M10.28 1.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-8a1 1 0 00-1.414-1.414z"/></svg>}
                    </div>
                    <div className={`tag text-xs ${getFileColor(doc.fileType)} flex-shrink-0`}>{doc.fileType?.toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                      <p className="text-xs text-slate-500">{doc.wordCount?.toLocaleString()} words</p>
                    </div>
                  </label>
                ))}
                {documents.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <FileText size={32} className="mx-auto mb-2 text-slate-600" />
                    <p>No documents available. Upload some first.</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDocPicker(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={startChat} disabled={selectedDocs.length === 0} className="btn-primary flex-1 justify-center disabled:opacity-40">
                  Start Chat ({selectedDocs.length} doc{selectedDocs.length !== 1 ? 's' : ''})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
