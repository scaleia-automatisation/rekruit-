import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-[10px] transition-all select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)] focus-visible:ring-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        'active:scale-[0.97]',
        {
          /* Primary — cyan with dark text */
          'bg-[var(--cyan)] text-[#0D0F12] hover:bg-[var(--cyan-600)] shadow-sm':
            variant === 'primary',

          /* Secondary — clean surface */
          'bg-white text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg)] hover:border-[var(--border-strong)] shadow-[var(--shadow-sm)]':
            variant === 'secondary',

          /* Ghost */
          'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]':
            variant === 'ghost',

          /* Danger */
          'bg-[var(--error)] text-white hover:bg-red-600 shadow-sm':
            variant === 'danger',

          'px-3 py-1.5 text-[13px] gap-1.5': size === 'sm',
          'px-4 py-2 text-sm gap-2':           size === 'md',
          'px-6 py-3 text-[15px] gap-2.5':     size === 'lg',
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-3.5 w-3.5 opacity-80"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
