'use client'

import { Plus, MessageSquare, LogOut, User, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Conversation } from '@/lib/types'

interface ChatSidebarProps {
  conversations: Conversation[]
  activeId: string | null
  userName?: string
  userEmail?: string
  plan?: string
  onNew: () => void
  onSelect: (conv: Conversation) => void
  onDelete?: (convId: string, e: React.MouseEvent) => void
  onLogout?: () => void
}

export function ChatSidebar({
  conversations,
  activeId,
  userName,
  userEmail,
  plan,
  onNew,
  onSelect,
  onDelete,
  onLogout,
}: ChatSidebarProps) {
  return (
    <aside className="w-64 h-full flex flex-col bg-[#F9F9F9] border-r dark:bg-gray-950 dark:border-gray-800">
      <div className="p-3 border-b dark:border-gray-800">
        <Button onClick={onNew} variant="outline" className="w-full gap-2 justify-start font-medium shadow-sm hover:bg-[#0F6E56]/5 hover:text-[#0F6E56] hover:border-[#0F6E56]/30 transition-all">
          <Plus size={16} />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Chat History
        </div>

        {conversations.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-12 px-4 leading-relaxed space-y-1">
            <MessageSquare size={20} className="mx-auto mb-2 opacity-30 text-gray-400" />
            <p>No past chats yet</p>
            <p className="text-[11px] text-gray-400/80">Your conversations will automatically appear here</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const firstMsg = conv.messages?.[0]
            const preview = firstMsg?.content?.slice(0, 38) ?? 'New conversation'
            const isActive = conv.id === activeId

            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`group w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-[#0F6E56]/10 text-[#0F6E56] font-medium shadow-sm'
                    : 'text-gray-700 hover:bg-gray-200/80 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare size={14} className={`shrink-0 ${isActive ? 'text-[#0F6E56]' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'}`} />
                  <span className="truncate leading-snug">
                    {preview}{preview.length === 38 ? '…' : ''}
                  </span>
                </div>

                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(conv.id, e)
                    }}
                    title="Delete Chat"
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-all shrink-0 text-gray-400"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* User profile & Logout footer */}
      <div className="p-3 border-t dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#0F6E56]/10 text-[#0F6E56] flex items-center justify-center shrink-0">
              <User size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                {userName || 'Logged In'}
              </p>
              <p className="text-[10px] text-gray-400 truncate capitalize">
                {plan === 'superuser' ? 'Superuser ♾️' : plan ? `${plan} Plan` : userEmail || 'Account'}
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
