'use client'

import { useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  disabled?: boolean
  loading?: boolean
}

export function ChatInput({ value, onChange, onSend, disabled, loading }: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  // Auto-resize up to 4 lines (~120px)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [value])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="border-t bg-white dark:bg-gray-950 dark:border-gray-800 px-4 py-4 shrink-0">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-3 items-end">
          <Textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? 'Daily limit reached. Upgrade to continue.'
                : 'Ask a Bangladesh tax question… (Enter to send, Shift+Enter for newline)'
            }
            disabled={disabled || loading}
            rows={1}
            className="resize-none min-h-[44px] py-3 leading-snug"
          />
          <Button
            onClick={onSend}
            disabled={disabled || loading || !value.trim()}
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Send message"
          >
            <Send size={16} />
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          BD Tax Bot provides informational guidance only. Always consult a registered tax consultant.
        </p>
      </div>
    </div>
  )
}
