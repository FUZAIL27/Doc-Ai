import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, Plus, MessageSquare, FileText, Trash2, Brain, Loader, X, ChevronLeft, Menu } from 'lucide-react'
import api from '../utils/api'
import { getFileColor } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const { id: chatId }    = useParams()
  const [searchParams]    = useSearchParams()
  const navigate          = useNavigate()
  const messagesEndRef    = useRef(null)
  const textareaRef       = useRef(null)

  const [chats,         setChats]         = useState([])
  const [currentChat,   setCurrentChat]   = useState(null)
  const [messages,      setMessages]      = useState([])
  const [input,         setInput]         = useState('')
  const [sending,       setSending]       = useState(false)
  const [documents,     setDocuments]     = useState([])
  const [selectedDocs,  setSelectedDocs]  = useState([])
  const [showDocPicker, setShowDocPicker] = useState(false)
  const [loadingChat,   setLoadingChat]   = useState(false)
  const [showChatList,  setShowChatList]  = useState(false)
  const [sidebarDocs,   setSidebarDocs]   = useState([])

  useEffect(() => {
    api.get('/chat').then(r => setChats(r.data.chats)).catch(() => {})
    api.get('/documents?limit=50').then(r => setDocuments(r.data.documents)).catch(() => {})
    const docId = searchParams.get('doc')
    if (docId) { setSelectedDocs([docId]); setShowDocPicker(true) }
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
      setCurrentChat(null); setMessages([]); setSidebarDocs([])
    }
  }, [chatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startChat = async () => {
    if (!selectedDocs.length) { toast.error('Select at least one document'); return }
    try {
      const { data } = await api.post('/chat', { documentIds: selectedDocs })
      setChats(p => [data.chat, ...p])
      setShowDocPicker(false); setSelectedDocs([]); setShowChatList(false)
      navigate(`/chat/${data.chat._id}`)
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create chat') }
  }

  const sendMessage = async () => {
    if (!input.trim() || !chatId || sending) return
    const msg = input.trim()
    setInput('')
    if (textareaRef.current) { textareaRef.current.style.height = 'auto' }
    setSending(true)
    setMessages(p => [...p, { role:'user', content:msg, timestamp:new Date() }])
    try {
      const { data } = await api.post(`/chat/${chatId}/message`, { message:msg })
      setMessages(p => [...p, { ...data.message, timestamp:new Date() }])
    } catch (err) {
      toast.error(err.response?.data?.error || 'Send failed')
      setMessages(p => p.slice(0,-1))
      setInput(msg)
    } finally { setSending(false) }
  }

  const deleteChat = async (id, e) => {
    e.stopPropagation()
    try {
      await api.delete(`/chat/${id}`)
      setChats(p => p.filter(c => c._id !== id))
      if (chatId === id) navigate('/chat')
    } catch { toast.error('Delete failed') }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const handleTextareaInput = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  /* Chat list panel (shared between desktop sidebar and mobile drawer) */
  const ChatListPanel = () => (
    <div className="flex flex-col h-full bg-dark-200">
      <div className="p-3 border-b border-dark-border flex items-center gap-2">
        <button onClick={() => setShowDocPicker(true)} className="btn-primary flex-1 justify-center text-sm py-2">
          <Plus size={14}/> New Chat
        </button>
        <button onClick={() => setShowChatList(false)} className="lg:hidden btn-ghost p-2 flex-shrink-0">
          <X size={16}/>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {chats.map(chat => (
          <div key={chat._id}
            onClick={() => { navigate(`/chat/${chat._id}`); setShowChatList(false) }}
            className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors text-xs touch-manipulation ${
              chatId===chat._id ? 'bg-brand-600/20 text-brand-300 border border-brand-600/30' : 'text-slate-400 hover:bg-dark-hover hover:text-white active:bg-dark-border'
            }`}>
            <MessageSquare size={13} className="flex-shrink-0"/>
            <span className="truncate flex-1">{chat.title}</span>
            <button onClick={e => deleteChat(chat._id, e)}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-all flex-shrink-0 touch-manipulation">
              <Trash2 size={11}/>
            </button>
          </div>
        ))}
        {!chats.length && <div className="text-center text-slate-600 text-xs py-8">No chats yet</div>}
      </div>
    </div>
  )

  return (
    /* Full height minus header (14 = 3.5rem, 16 = 4rem) */
    <div className="flex h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] -m-4 sm:-m-6 relative overflow-hidden">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 flex-shrink-0 border-r border-dark-border">
        <div className="w-full"><ChatListPanel/></div>
      </div>

      {/* Mobile chat-list drawer */}
      <AnimatePresence>
        {showChatList && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowChatList(false)}/>
            <motion.div initial={{ x:-280 }} animate={{ x:0 }} exit={{ x:-280 }}
              transition={{ duration:0.25, ease:'easeOut' }}
              className="relative z-10 w-72 flex-shrink-0 shadow-2xl h-full">
              <ChatListPanel/>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-dark-300">
        {!chatId ? (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center text-center p-6">
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain size={22} className="text-brand-400"/>
              </div>
              <h3 className="text-base sm:text-xl font-bold text-white mb-2">Start a Document Chat</h3>
              <p className="text-slate-400 mb-5 text-xs sm:text-sm max-w-xs mx-auto">Select documents and ask AI anything about them.</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button onClick={() => setShowChatList(true)} className="btn-secondary lg:hidden justify-center text-sm">
                  <Menu size={14}/> Chat History
                </button>
                <button onClick={() => setShowDocPicker(true)} className="btn-primary justify-center text-sm">
                  <Plus size={14}/> Select Documents
                </button>
              </div>
            </div>
          </div>
        ) : loadingChat ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader size={26} className="text-brand-400 animate-spin"/>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-3 sm:px-4 py-2.5 border-b border-dark-border flex items-center gap-2 bg-dark-200/60 backdrop-blur-sm flex-shrink-0">
              <button onClick={() => setShowChatList(true)} className="lg:hidden btn-ghost p-1.5 flex-shrink-0">
                <ChevronLeft size={17}/>
              </button>
              <MessageSquare size={14} className="text-brand-400 flex-shrink-0 hidden sm:block"/>
              <span className="text-xs sm:text-sm font-medium text-white truncate flex-1">{currentChat?.title}</span>
              <div className="flex gap-1.5 flex-shrink-0">
                {sidebarDocs.slice(0,2).map(d => (
                  <span key={d._id} className={`tag text-[9px] sm:text-[10px] ${getFileColor(d.fileType)} hidden sm:inline-flex`}>
                    {d.title?.substring(0,10)}{d.title?.length>10?'…':''}
                  </span>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3 sm:space-y-4">
              {messages.length===0 && (
                <div className="text-center text-slate-500 py-10">
                  <MessageSquare size={24} className="mx-auto mb-2 text-slate-600"/>
                  <p className="text-xs sm:text-sm">Ask anything about your document(s)</p>
                </div>
              )}
              {messages.map((msg,i) => (
                <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  className={`flex gap-2 sm:gap-3 ${msg.role==='user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    msg.role==='user' ? 'bg-brand-600' : 'bg-dark-border'}`}>
                    {msg.role==='user' ? 'U' : <Brain size={12} className="text-brand-400"/>}
                  </div>
                  <div className={`max-w-[82%] sm:max-w-[75%] px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm ${
                    msg.role==='user'
                      ? 'bg-brand-600 text-white rounded-tr-sm'
                      : 'bg-dark-hover text-slate-200 rounded-tl-sm'
                  }`}>
                    {msg.role==='assistant'
                      ? <div className="prose prose-invert prose-sm max-w-none text-xs sm:text-sm leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      : <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    }
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {sending && (
                <div className="flex gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-dark-border flex items-center justify-center flex-shrink-0">
                    <Brain size={12} className="text-brand-400"/>
                  </div>
                  <div className="bg-dark-hover px-3 py-2.5 rounded-xl rounded-tl-sm flex items-center gap-1.5">
                    {[0,1,2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 bg-brand-400 rounded-full"
                        animate={{ y:[-2,2,-2] }} transition={{ duration:0.55, delay:i*0.13, repeat:Infinity }}/>
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}/>
            </div>

            {/* Input bar */}
            <div className="p-2.5 sm:p-4 border-t border-dark-border bg-dark-200/60 backdrop-blur-sm flex-shrink-0">
              <div className="flex gap-2 items-end max-w-4xl mx-auto">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onInput={handleTextareaInput}
                  placeholder="Ask anything... (Enter to send)"
                  rows={1}
                  className="flex-1 bg-dark-200 border border-dark-border rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none transition-all"
                  style={{ minHeight:'42px', maxHeight:'120px', fontSize:'16px' }}
                />
                <button onClick={sendMessage} disabled={!input.trim() || sending}
                  className="btn-primary p-2.5 rounded-xl disabled:opacity-40 flex-shrink-0 h-[42px] w-[42px] justify-center">
                  {sending ? <Loader size={16} className="animate-spin"/> : <Send size={16}/>}
                </button>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-600 text-center mt-1.5">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>

      {/* Document picker — bottom sheet on mobile */}
      <AnimatePresence>
        {showDocPicker && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDocPicker(false)}/>

            <motion.div
              initial={{ opacity:0, y:60 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:60 }}
              transition={{ duration:0.25, ease:'easeOut' }}
              className="relative glass-card w-full sm:max-w-lg max-h-[88dvh] sm:max-h-[80vh] flex flex-col z-10 rounded-t-2xl sm:rounded-xl overflow-hidden shadow-2xl">

              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
                <div className="w-10 h-1 bg-dark-border rounded-full"/>
              </div>

              <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border flex-shrink-0">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white">Select Documents</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Chat with one or more documents</p>
                </div>
                <button onClick={() => setShowDocPicker(false)} className="btn-ghost p-1.5"><X size={16}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {documents.map(doc => (
                  <label key={doc._id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all touch-card ${
                      selectedDocs.includes(doc._id)
                        ? 'border-brand-600/50 bg-brand-600/10'
                        : 'border-dark-border active:bg-dark-hover'
                    }`}>
                    <input type="checkbox" className="sr-only"
                      checked={selectedDocs.includes(doc._id)}
                      onChange={e => {
                        if (e.target.checked) setSelectedDocs(p => [...p, doc._id])
                        else setSelectedDocs(p => p.filter(id => id!==doc._id))
                      }}/>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedDocs.includes(doc._id) ? 'bg-brand-600 border-brand-600' : 'border-dark-border'}`}>
                      {selectedDocs.includes(doc._id) && (
                        <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-current">
                          <path d="M10.28 1.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-8a1 1 0 00-1.414-1.414z"/>
                        </svg>
                      )}
                    </div>
                    <div className={`tag text-[9px] sm:text-[10px] ${getFileColor(doc.fileType)} flex-shrink-0`}>
                      {doc.fileType?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-white truncate">{doc.title}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500">{doc.wordCount?.toLocaleString()} words</p>
                    </div>
                  </label>
                ))}
                {!documents.length && (
                  <div className="text-center py-10 text-slate-500">
                    <FileText size={26} className="mx-auto mb-2 text-slate-600"/>
                    <p className="text-sm">No documents yet. Upload some first.</p>
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-4 border-t border-dark-border flex gap-3 flex-shrink-0">
                <button onClick={() => setShowDocPicker(false)} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
                <button onClick={startChat} disabled={!selectedDocs.length}
                  className="btn-primary flex-1 justify-center text-sm disabled:opacity-40">
                  Start Chat ({selectedDocs.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
