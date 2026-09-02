'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Source } from '@/lib/types'

export function SourceChips({ sources }: { sources: Source[] }) {
  const [open, setOpen] = useState(false)

  if (!sources.length) return null

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0F6E56] dark:hover:text-gray-300 transition-colors font-medium"
      >
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        <span>{sources.length} cited source{sources.length !== 1 ? 's' : ''}</span>
      </button>

      {open && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {sources.map((s, i) => {
            const isUrl = s.section && (s.section.startsWith('http://') || s.section.startsWith('https://'))
            if (isUrl) {
              return (
                <a
                  key={i}
                  href={s.section}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border border-[#0F6E56]/30 text-[#0F6E56] bg-[#0F6E56]/5 hover:bg-[#0F6E56]/15 transition-all max-w-xs"
                  title={s.source}
                >
                  <Globe size={12} className="shrink-0" />
                  <span className="truncate">{s.source.replace('🌐 ', '')}</span>
                  <ExternalLink size={10} className="shrink-0 opacity-70" />
                </a>
              )
            }
            return (
              <Badge key={i} variant="outline" className="text-xs font-normal py-1 px-2.5">
                {s.source}{s.section ? ` — ${s.section}` : ''}
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
