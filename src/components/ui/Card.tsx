import { type HTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  elevated?: boolean
  hover?: boolean
}

export function Card({ children, padding = 'md', elevated, hover, className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--border)] transition-all duration-150',
        elevated ? 'shadow-[var(--shadow-md)]' : 'shadow-[var(--shadow-sm)]',
        hover && 'hover:shadow-[var(--shadow-md)] hover:border-[var(--border-strong)] hover:-translate-y-px cursor-pointer',
        {
          'p-0':  padding === 'none',
          'p-4':  padding === 'sm',
          'p-5':  padding === 'md',
          'p-7':  padding === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
