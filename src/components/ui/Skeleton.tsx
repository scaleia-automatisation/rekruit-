import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

export function Skeleton({ className, width, height, rounded = 'md' }: SkeletonProps) {
  return (
    <div
      className={clsx('skeleton', className)}
      style={{
        width,
        height,
        borderRadius: rounded === 'full' ? 9999 : rounded === 'lg' ? 14 : rounded === 'md' ? 8 : 4,
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--border)] p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton width={40} height={40} rounded="md" />
        <div className="flex-1">
          <Skeleton width="60%" height={14} className="mb-2" />
          <Skeleton width="40%" height={11} />
        </div>
      </div>
      <Skeleton width="100%" height={12} className="mb-2" />
      <Skeleton width="80%" height={12} />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <Skeleton width={32} height={32} rounded="full" />
      <div className="flex-1">
        <Skeleton width="45%" height={13} className="mb-1.5" />
        <Skeleton width="30%" height={11} />
      </div>
      <Skeleton width={60} height={22} rounded="full" />
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--border)] p-5 shadow-[var(--shadow-sm)]">
      <Skeleton width={80} height={11} className="mb-3" />
      <Skeleton width={60} height={28} className="mb-2" />
      <Skeleton width={100} height={11} />
    </div>
  )
}
