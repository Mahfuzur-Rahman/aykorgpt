export interface Source {
  source: string
  section: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  timestamp: string
}

export interface Conversation {
  id: string
  user_id: string
  messages: Array<{ role: string; content: string; ts: string; sources?: Source[] }>
  created_at: string
}

export interface ChatResponse {
  answer: string
  sources: Source[]
  queries_remaining: number
}

export interface QuotaResponse {
  plan: string
  queries_today: number
  queries_remaining: number
  reset_date: string
}
