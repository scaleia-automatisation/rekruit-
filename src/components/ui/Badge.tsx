import { type ReactNode } from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  children: ReactNode
  variant?: 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'purple'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'blue', size = 'sm' }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center font-medium rounded-full',
      {
        'bg-blue-100 text-blue-700': variant === 'blue',
        'bg-green-100 text-green-700': variant === 'green',
        'bg-orange-100 text-orange-700': variant === 'orange',
        'bg-red-100 text-red-700': variant === 'red',
        'bg-slate-100 text-slate-600': variant === 'gray',
        'bg-purple-100 text-purple-700': variant === 'purple',
        'px-2 py-0.5 text-xs': size === 'sm',
        'px-3 py-1 text-sm': size === 'md',
      }
    )}>
      {children}
    </span>
  )
}
