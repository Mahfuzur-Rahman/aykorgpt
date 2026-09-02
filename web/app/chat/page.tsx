'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Menu, Download, Sparkles, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { ChatMessages } from '@/components/chat/ChatMessages'
import { ChatInput } from '@/components/chat/ChatInput'
import { QuotaBar } from '@/components/chat/QuotaBar'
import { UpgradeModal } from '@/components/UpgradeModal'
import { exportChatToPdf } from '@/lib/pdf-export'
import { getSession, clearSession, type Session } from '@/lib/session'
import type { Message, Conversation } from '@/lib/types'

const FREE_LIMIT = 10

export default function ChatPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<Session | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [queriesUsed, setQueriesUsed] = useState(0)
  const [isUnlimited, setIsUnlimited] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  function handleLogout() {
    clearSession()
    toast.success('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      // Our own session (from lib/session) or test superuser session.
      const session = getSession()
      const superuserId =
        typeof window !== 'undefined'
          ? localStorage.getItem('bd_superuser_id')
          : null

      if (!session && !superuserId) {
        toast.error('Please sign in or create an account to start chatting.')
        router.push('/login')
        return
      }

      if (superuserId) setIsUnlimited(true)
      if (session && session.plan !== 'free') setIsUnlimited(true)

      const id = session?.user_id ?? superuserId
      if (!id) {
        router.push('/login')
        return
      }
      setUserId(id)
      setCurrentUser(session)
      setActiveConvId(crypto.randomUUID())

      const token = session?.token || (id.startsWith('superuser-') ? `${id}.0.mock_signature` : '')
      if (token) {
        // Load conversations for sidebar via secure API
        try {
          const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/api/conversations`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (res.ok) {
            const convs = await res.json()
            if (Array.isArray(convs)) {
              setConversations(convs as Conversation[])
            }
          }
        } catch { /* non-critical */ }
      }

      // Load today's quota usage
      try {
        const res = await fetch(
          `${(process.env.NEXT_PUBLIC_API_URL || '')}/api/quota/${id}`,
          {
            headers: {
              Authorization: `Bearer ${session?.token || "superuser-loginnow.0.mock_signature"}`
            }
          }
        )
        if (res.ok) {
          const quota = await res.json()
          setQueriesUsed(quota.queries_today ?? 0)
          // plan !== 'free' (superuser / pro) or a negative remaining = unlimited
          if (quota.plan !== 'free' || quota.queries_remaining < 0) {
            setIsUnlimited(true)
          }
        }
      } catch { /* non-critical */ }
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sidebar refresh ───────────────────────────────────────────────────────
  async function refreshConversations() {
    if (!userId) return
    const session = getSession()
    const token = session?.token || (userId.startsWith('superuser-') ? `${userId}.0.mock_signature` : '')
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setConversations(data as Conversation[])
        }
      }
    } catch { /* skip */ }
  }

  // ── Delete conversation ───────────────────────────────────────────────────
  async function handleDeleteConversation(convId: string, e: React.MouseEvent) {
    e.stopPropagation()
    const session = getSession()
    const token = session?.token || (userId.startsWith('superuser-') ? `${userId}.0.mock_signature` : '')
    
    // Optimistically remove from state
    setConversations((prev) => prev.filter((c) => c.id !== convId))
    if (activeConvId === convId) {
      handleNewChat()
    }

    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/api/conversations/${convId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Chat deleted')
    } catch {
      toast.error('Could not delete chat from server.')
      refreshConversations()
    }
  }

  // ── New chat ──────────────────────────────────────────────────────────────
  function handleNewChat() {
    setActiveConvId(crypto.randomUUID())
    setMessages([])
    setSidebarOpen(false)
  }

  // ── Load past conversation ────────────────────────────────────────────────
  function handleSelectConversation(conv: Conversation) {
    setActiveConvId(conv.id)
    const mapped: Message[] = (conv.messages ?? []).map((m, i) => ({
      id: `${conv.id}-${i}`,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      sources: m.sources ?? [],
      timestamp: m.ts || new Date().toISOString(),
    }))
    setMessages(mapped)
    setSidebarOpen(false)
  }

  // ── Send message ──────────────────────────────────────────────────────────
  async function sendMessage(text?: string) {
    const question = (text ?? input).trim()
    if (!question || loading) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(
        `${(process.env.NEXT_PUBLIC_API_URL || '')}/api/chat`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getSession()?.token || "superuser-loginnow.0.mock_signature"}`
          },
          body: JSON.stringify({
            question,
            user_id: userId || 'anonymous',
            conversation_id: activeConvId,
          }),
        }
      )

      if (res.status === 429) {
        toast.error('Daily limit reached. Upgrade to Pro for unlimited questions.')
        setQueriesUsed(FREE_LIMIT)
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id))
        return
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.answer,
          sources: data.sources ?? [],
          timestamp: new Date().toISOString(),
        },
      ])

      // Update quota counter from API response. A negative remaining means
      // the account is unlimited (superuser / pro) — never count or cap it.
      if (data.queries_remaining < 0) {
        setIsUnlimited(true)
      } else if (!isUnlimited && typeof data.queries_remaining === 'number') {
        setQueriesUsed(FREE_LIMIT - data.queries_remaining)
      }

      refreshConversations()
    } catch {
      toast.error('Network error. Please check your connection.', {
        action: {
          label: 'Retry',
          onClick: () => sendMessage(question),
        },
      })
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id))
    } finally {
      setLoading(false)
    }
  }

  const isExhausted = !isUnlimited && queriesUsed >= FREE_LIMIT

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 lg:relative lg:z-auto lg:translate-x-0
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <ChatSidebar
          conversations={conversations}
          activeId={activeConvId}
          userName={currentUser?.full_name || (userId.startsWith('superuser-') ? 'Super Admin' : undefined)}
          userEmail={currentUser?.email}
          plan={currentUser?.plan || (isUnlimited ? 'superuser' : 'free')}
          onNew={handleNewChat}
          onSelect={handleSelectConversation}
          onDelete={handleDeleteConversation}
          onLogout={handleLogout}
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        {/* Header Bar */}
        <header className="flex items-center justify-between px-4 py-2.5 border-b dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <span className="font-bold text-gray-900 dark:text-white hidden sm:inline text-sm">Aykor<span className="text-[#0F6E56]">GPT</span></span>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => exportChatToPdf(messages, activeConvId)}
                className="flex items-center gap-1.5 text-xs border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors text-gray-700 dark:text-gray-300 font-medium"
              >
                <Download size={14} /> Export Report (PDF)
              </button>
            )}

            {!isUnlimited && (
              <button
                onClick={() => setUpgradeOpen(true)}
                className="flex items-center gap-1.5 text-xs bg-[#0F6E56] hover:bg-[#0a5a45] text-white px-3 py-1.5 rounded-lg transition-colors font-semibold shadow-sm"
              >
                <Sparkles size={13} /> Upgrade to Pro
              </button>
            )}

            <button
              onClick={handleLogout}
              title="Log out of AykorGPT"
              className="flex items-center gap-1.5 text-xs border border-gray-200 dark:border-gray-700 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1.5 rounded-lg transition-colors text-gray-600 dark:text-gray-400 font-medium"
            >
              <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Quota bar */}
        <QuotaBar
          used={queriesUsed}
          limit={FREE_LIMIT}
          unlimited={isUnlimited}
          onUpgrade={() => setUpgradeOpen(true)}
        />

        {/* Messages */}
        <ChatMessages
          messages={messages}
          loading={loading}
          onExample={(q) => sendMessage(q)}
        />

        {/* Input or upgrade prompt */}
        {isExhausted ? (
          <div className="border-t dark:border-gray-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-8 text-center shrink-0">
            <p className="text-sm text-amber-800 dark:text-amber-300 mb-4 font-medium">
              You&apos;ve used all 10 free questions today.
            </p>
            <button
              onClick={() => setUpgradeOpen(true)}
              className="bg-[#0F6E56] hover:bg-[#0a5a45] text-white px-8 py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              Upgrade to Pro — Unlimited Questions
            </button>
            <p className="text-xs text-gray-400 mt-3">Or come back tomorrow for 10 more free questions.</p>
          </div>
        ) : (
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={() => sendMessage()}
            disabled={loading}
          />
        )}
      </div>

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        userId={userId}
        onSuccess={() => setIsUnlimited(true)}
      />
    </div>
  )
}
