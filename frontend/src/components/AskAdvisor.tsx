import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, BookOpen, Loader2 } from 'lucide-react'
import { api } from '../api/client'
import type { RecommendationResponse } from '../types'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  steps?: number
}

interface Props {
  userId: string
}

const SUGGESTIONS = [
  'What is the 50/30/20 rule?',
  'How much should I have in an emergency fund?',
  'What is dollar-cost averaging?',
  'How do index funds work?',
  'When should I start investing?',
]

export function AskAdvisor({ userId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (question: string) => {
    if (!question.trim() || loading) return
    const q = question.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setLoading(true)
    try {
      const res: RecommendationResponse = await api.recommend(userId, q, sessionId)
      setSessionId(res.session_id)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.answer,
        sources: res.sources,
        steps: res.agent_steps.length,
      }])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${msg}` }])
    } finally {
      setLoading(false)
    }
  }

  const empty = messages.length === 0

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-h-[700px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {empty ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full gap-6 pb-4"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20">
                <Bot size={22} className="text-violet-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-zinc-200">Ask your AI Advisor</p>
                <p className="text-xs text-zinc-500 mt-1">Powered by RAG — answers grounded in financial knowledge</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-sm">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-lg border border-[#1e1e26] bg-[#0f0f12] px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20 mt-0.5">
                    <Bot size={13} className="text-violet-400" />
                  </div>
                )}
                <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white'
                      : 'bg-[#0f0f12] border border-[#1e1e26] text-zinc-300'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {[...new Set(msg.sources)].map(s => (
                        <span key={s} className="flex items-center gap-1 rounded-md border border-[#1e1e26] bg-[#0a0a0e] px-2 py-0.5 text-[10px] text-zinc-500">
                          <BookOpen size={9} />
                          {s.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#17171c] border border-[#1e1e26] mt-0.5">
                    <User size={13} className="text-zinc-400" />
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <Bot size={13} className="text-violet-400" />
                </div>
                <div className="rounded-xl bg-[#0f0f12] border border-[#1e1e26] px-4 py-3 flex items-center gap-2">
                  <Loader2 size={12} className="text-violet-400 animate-spin" />
                  <span className="text-xs text-zinc-500">Retrieving knowledge & reasoning...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send(input))}
          placeholder="Ask about budgeting, investing, retirement..."
          disabled={loading}
          className="flex-1 rounded-xl border border-[#1e1e26] bg-[#0f0f12] px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-all focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] disabled:opacity-50"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:bg-violet-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
