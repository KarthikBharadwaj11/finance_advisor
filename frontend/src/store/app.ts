import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AnalysisResponse, User } from '../types'

interface AppState {
  user: User | null
  lastAnalysis: AnalysisResponse | null
  setUser: (user: User) => void
  setLastAnalysis: (a: AnalysisResponse) => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      lastAnalysis: null,
      setUser: (user) => set({ user }),
      setLastAnalysis: (lastAnalysis) => set({ lastAnalysis }),
      logout: () => set({ user: null, lastAnalysis: null }),
    }),
    { name: 'financeadv-store' }
  )
)
