import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-[#0F6E56]/10 text-[#0F6E56]',
        variant === 'outline' && 'border border-[#0F6E56]/40 text-[#0F6E56]',
        className
      )}
      {...props}
    />
  )
}

export { Badge }
