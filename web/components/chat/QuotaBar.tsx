interface QuotaBarProps {
  used: number
  limit: number
  unlimited?: boolean
  onUpgrade: () => void
}

export function QuotaBar({ used, limit, unlimited = false, onUpgrade }: QuotaBarProps) {
  const pct = Math.min((used / limit) * 100, 100)
  const isWarning = used >= limit * 0.8
  const isExhausted = used >= limit

  if (unlimited) {
    return (
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b bg-[#0F6E56]/5 border-[#0F6E56]/20 dark:bg-[#0F6E56]/10 dark:border-[#0F6E56]/30">
        <span className="inline-flex items-center gap-1.5 font-medium text-[#0F6E56]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F6E56]" />
          Unlimited questions
        </span>
        <span className="text-gray-400 dark:text-gray-500 text-xs">· Superuser</span>
      </div>
    )
  }

  return (
    <div
      className={`px-4 py-2 flex items-center gap-3 text-sm border-b ${
        isExhausted
          ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900'
          : 'bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-800'
      }`}
    >
      <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap shrink-0">
        {used} / {limit} questions used today
      </span>
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isExhausted ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-[#0F6E56]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isExhausted && (
        <button
          onClick={onUpgrade}
          className="text-[#0F6E56] font-semibold hover:underline whitespace-nowrap shrink-0 text-xs"
        >
          Upgrade →
        </button>
      )}
    </div>
  )
}
