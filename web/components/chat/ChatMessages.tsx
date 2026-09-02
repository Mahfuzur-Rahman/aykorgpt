'use client'

import { useEffect, useRef } from 'react'
import { TypingIndicator } from './TypingIndicator'
import { SourceChips } from './SourceChips'
import type { Message } from '@/lib/types'

const EXAMPLES = [
  'What is the VAT rate on software services?',
  'How is TDS calculated on rent payments?',
  'What are the income tax slabs for individuals?',
]

interface ChatMessagesProps {
  messages: Message[]
  loading: boolean
  onExample: (question: string) => void
}

export function ChatMessages({ messages, loading, onExample }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* Empty state */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Ask AykorGPT anything
              </h2>
              <p className="text-sm text-gray-400">Try one of these questions:</p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center">
              {EXAMPLES.map((q) => (
                <button
                  key={q}
                  onClick={() => onExample(q)}
                  className="border border-[#0F6E56]/30 text-[#0F6E56] rounded-full px-4 py-2 text-sm hover:bg-[#0F6E56]/5 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'user' ? (
              <div className="max-w-[75%] bg-[#0F6E56] text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed">
                {msg.content}
              </div>
            ) : (
              <div className="max-w-[80%] bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
                {msg.sources && msg.sources.length > 0 && (
                  <SourceChips sources={msg.sources} />
                )}
              </div>
            )}
          </div>
        ))}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
