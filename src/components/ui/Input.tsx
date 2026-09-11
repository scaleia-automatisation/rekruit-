import { type InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { AlertCircle } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, startIcon, endIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-primary)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              {startIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full rounded-[10px] border bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]',
              'placeholder:text-[var(--text-muted)]',
              'transition-all duration-150',
              'hover:border-[var(--border-strong)]',
              'focus:outline-none focus:border-[var(--cyan)] focus:shadow-[0_0_0_3px_var(--cyan-10)]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--bg)]',
              error
                ? 'border-[var(--error)] bg-[var(--error-bg)] focus:border-[var(--error)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.10)]'
                : 'border-[var(--border)]',
              startIcon ? 'pl-10' : '',
              endIcon ? 'pr-10' : '',
              className
            )}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 flex items-center text-[var(--text-muted)]">
              {endIcon}
            </div>
          )}
          {error && !endIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none">
              <AlertCircle size={14} className="text-[var(--error)]" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-[var(--error)] flex items-center gap-1">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--text-muted)]">{hint}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
