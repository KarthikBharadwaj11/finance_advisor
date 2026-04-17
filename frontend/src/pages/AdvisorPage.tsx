import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, BookOpen, Loader2, Sparkles, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { api } from '../api/client'
import { useAppStore } from '../store/app'
import { toast } from '../components/ui/Toast'
import type { RecommendationResponse } from '../types'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  toolCount?: number
}

const SUGGESTIONS = [
  { label: 'Emergency fund', q: 'How much should I keep in an emergency fund and where should I keep it?' },
  { label: 'Index funds', q: 'How do index funds work and why are they recommended for most investors?' },
  { label: '50/30/20 rule', q: 'Explain the 50/30/20 budgeting rule and how to apply it to my finances.' },
  { label: 'Debt payoff', q: 'What is the difference between the debt avalanche and debt snowball methods?' },
  { label: 'Roth IRA', q: 'What is a Roth IRA and who should open one?' },
  { label: 'Dollar-cost averaging', q: 'What is dollar-cost averaging and when should I use it?' },
]

export function AdvisorPage() {
  const user = useAppStore(s => s.user)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const formatAnswer = (raw: string): string => {
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && 'narrative_summary' in parsed) {
        let md = parsed.narrative_summary + '\n\n'
        if (parsed.key_insights?.length) {
          md += '**Key Insights**\n'
          parsed.key_insights.forEach((s: string) => { md += `- ${s}\n` })
          md += '\n'
        }
        if (parsed.priority_actions?.length) {
          md += '**Priority Actions**\n'
          parsed.priority_actions.forEach((s: string, i: number) => { md += `${i + 1}. ${s}\n` })
        }
        return md.trim()
      }
    } catch { /* not JSON, fall through */ }
    return raw
  }

  const send = async (question: string) => {
    if (!question.trim() || loading || !user) return
    const q = question.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setLoading(true)
    try {
      const res: RecommendationResponse = await api.recommend(user.id, q, sessionId || undefined)
      setSessionId(res.session_id)
      setMessages(prev => [...prev, { role: 'assistant', content: formatAnswer(res.answer), sources: [...new Set(res.sources)], toolCount: res.agent_steps.length }])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      toast('error', msg)
      setMessages(prev => [...prev, { role: 'assistant', content: `I encountered an error: ${msg}` }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const empty = messages.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif', color: '#e8e8f0' }}>

      {/* Header */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#f1f1f5' }}>AI Advisor</div>
          <div style={{ fontSize: 12, color: '#44444f', marginTop: 2 }}>RAG-powered · answers grounded in financial knowledge</div>
        </div>
        {sessionId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 11, color: '#55556a' }}>Session active</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        {empty ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', paddingBottom: 60, textAlign: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={22} color="#8b5cf6" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#e8e8f0', marginBottom: 6 }}>Ask your AI Financial Advisor</div>
              <div style={{ fontSize: 13, color: '#55556a', maxWidth: 380, lineHeight: 1.6 }}>
                Powered by RAG — every answer is retrieved from a curated financial knowledge base, not just model weights.
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 560, marginTop: 8 }}>
              {SUGGESTIONS.map(s => (
                <button key={s.label} onClick={() => send(s.q)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.2)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)' }}>
                  <ChevronRight size={12} color="#44444f" style={{ marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#88889a', lineHeight: 1.5 }}>{s.q}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  style={{ display: 'flex', gap: 10, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role === 'assistant' && (
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <Bot size={13} color="#a78bfa" />
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '80%', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      padding: '11px 15px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      fontSize: 13, lineHeight: 1.65,
                      background: msg.role === 'user' ? '#7c3aed' : '#0d0d18',
                      border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.07)',
                      color: msg.role === 'user' ? '#fff' : '#ccccdc',
                      boxShadow: msg.role === 'user' ? '0 0 20px rgba(124,58,237,0.3)' : 'none',
                    }}>
                      {msg.role === 'user' ? msg.content : (
                        <ReactMarkdown components={{
                          p: ({ children }) => <p style={{ margin: '0 0 8px', lineHeight: 1.65 }}>{children}</p>,
                          strong: ({ children }) => <strong style={{ color: '#e8e8f0', fontWeight: 600 }}>{children}</strong>,
                          ul: ({ children }) => <ul style={{ margin: '6px 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</ul>,
                          ol: ({ children }) => <ol style={{ margin: '6px 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</ol>,
                          li: ({ children }) => <li style={{ fontSize: 13, lineHeight: 1.6, color: '#ccccdc' }}>{children}</li>,
                          h1: ({ children }) => <div style={{ fontSize: 15, fontWeight: 700, color: '#e8e8f0', margin: '10px 0 6px' }}>{children}</div>,
                          h2: ({ children }) => <div style={{ fontSize: 14, fontWeight: 700, color: '#e8e8f0', margin: '10px 0 5px' }}>{children}</div>,
                          h3: ({ children }) => <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0f0', margin: '8px 0 4px' }}>{children}</div>,
                          code: ({ children }) => <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace', color: '#a78bfa' }}>{children}</code>,
                        }}>
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {msg.sources.map(s => (
                          <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', fontSize: 10, color: '#44444f' }}>
                            <BookOpen size={8} color="#44444f" />
                            {s.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                    {msg.toolCount !== undefined && (
                      <span style={{ fontSize: 10, color: '#33333f' }}>{msg.toolCount} tool{msg.toolCount !== 1 ? 's' : ''} used</span>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <User size={13} color="#66667a" />
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={13} color="#a78bfa" />
                  </div>
                  <div style={{ padding: '11px 15px', borderRadius: '14px 14px 14px 4px', background: '#0d0d18', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Loader2 size={12} color="#8b5cf6" style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: 12, color: '#55556a' }}>Retrieving knowledge and reasoning...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '16px 32px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', gap: 10 }}>
          <input
            ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send(input))}
            placeholder="Ask about budgeting, investing, retirement planning..."
            disabled={loading}
            style={{ flex: 1, padding: '13px 18px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: '#0d0d18', color: '#e8e8f0', fontSize: 13, outline: 'none', fontFamily: 'inherit', opacity: loading ? 0.5 : 1 }}
            onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.08)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            style={{ width: 48, height: 48, borderRadius: 14, background: input.trim() && !loading ? '#7c3aed' : 'rgba(124,58,237,0.2)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', flexShrink: 0, boxShadow: input.trim() && !loading ? '0 0 20px rgba(124,58,237,0.4)' : 'none', transition: 'all 0.15s' }}>
            <Send size={16} />
          </button>
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: '#2a2a35', marginTop: 10 }}>For educational purposes only. Not financial advice.</div>
      </div>
    </div>
  )
}
