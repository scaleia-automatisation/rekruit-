import { type ReactNode } from 'react'
import { clsx } from 'clsx'

type Variant = 'cyan' | 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'purple'

interface BadgeProps {
  children: ReactNode
  variant?: Variant
  size?: 'sm' | 'md'
  dot?: boolean
}

const styles: Record<Variant, string> = {
  cyan:   'bg-[var(--cyan-10)] text-[var(--cyan-700)] border border-[var(--cyan-20)]',
  blue:   'bg-blue-50 text-blue-700 border border-blue-100',
  green:  'bg-emerald-50 text-emerald-700 border border-emerald-100',
  orange: 'bg-amber-50 text-amber-700 border border-amber-100',
  red:    'bg-red-50 text-red-600 border border-red-100',
  gray:   'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]',
  purple: 'bg-violet-50 text-violet-700 border border-violet-100',
}

const dots: Record<Variant, string> = {
  cyan:   'bg-[var(--cyan-600)]',
  blue:   'bg-blue-500',
  green:  'bg-emerald-500',
  orange: 'bg-amber-500',
  red:    'bg-red-500',
  gray:   'bg-slate-400',
  purple: 'bg-violet-500',
}

export function Badge({ children, variant = 'gray', size = 'sm', dot }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      styles[variant],
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
    )}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dots[variant])} />}
      {children}
    </span>
  )
}
