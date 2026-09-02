// Client-side session for our OWN auth (not Supabase Auth). The token is a
// signed opaque string issued by the backend; we store it plus basic profile
// info in localStorage and send user_id to the API like before.

export interface Session {
  user_id: string
  token: string
  full_name: string
  email: string
  plan: string
}

const KEY = 'bd_session'

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function setSession(session: Session): void {
  localStorage.setItem(KEY, JSON.stringify(session))
  // A real login supersedes any test-superuser session.
  localStorage.removeItem('bd_superuser_id')
}

export function clearSession(): void {
  localStorage.removeItem(KEY)
  localStorage.removeItem('bd_superuser_id')
}
