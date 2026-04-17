import type { AnalysisResponse, FinancialProfile, RecommendationResponse, User } from '../types'

const BASE = '/api/v1'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || (Array.isArray(err.detail) ? err.detail[0]?.msg : err.detail) || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  createUser: (data: { email: string; full_name: string; password: string; age?: number; annual_income?: number }) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),

  getUser: (id: string) =>
    request<User>(`/users/${id}`),

  analyze: (userId: string, profile: FinancialProfile) =>
    request<AnalysisResponse>('/finances/analyze', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, profile }),
    }),

  recommend: (userId: string, question: string, sessionId?: string) =>
    request<RecommendationResponse>('/finances/recommendations', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, question, session_id: sessionId ?? '' }),
    }),
}
