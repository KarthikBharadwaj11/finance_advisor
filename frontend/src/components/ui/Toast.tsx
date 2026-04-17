import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error'

interface ToastItem {
  id: string
  type: ToastType
  message: string
}

let addToast: (type: ToastType, message: string) => void = () => {}

export function toast(type: ToastType, message: string) {
  addToast(type, message)
}

export function ToastProvider() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    addToast = (type, message) => {
      const id = Math.random().toString(36).slice(2)
      setItems(prev => [...prev, { id, type, message }])
      setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 4000)
    }
  }, [])

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {items.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-xl ${
              t.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-800/50 text-emerald-300'
                : 'bg-rose-950/90 border-rose-800/50 text-rose-300'
            }`}
          >
            {t.type === 'success' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
            <span className="text-sm font-medium">{t.message}</span>
            <button onClick={() => setItems(prev => prev.filter(x => x.id !== t.id))} className="ml-1 opacity-60 hover:opacity-100">
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
