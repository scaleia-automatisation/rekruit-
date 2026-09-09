interface ScoreDisplayProps {
  score: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

function color(s: number) {
  return s >= 75 ? 'text-green-600' : s >= 50 ? 'text-orange-500' : 'text-red-500'
}
function bg(s: number) {
  return s >= 75 ? 'bg-green-500' : s >= 50 ? 'bg-orange-500' : 'bg-red-500'
}

export function ScoreDisplay({ score, label = 'Score IA', size = 'md' }: ScoreDisplayProps) {
  const sizeMap = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-6xl' }
  return (
    <div className="text-center bg-slate-50 rounded-2xl p-4 min-w-[80px]">
      <p className={`${sizeMap[size]} font-extrabold ${color(score)}`}>{score}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  )
}

interface ScoreBarProps {
  label: string
  score: number
}

export function ScoreBar({ label, score }: ScoreBarProps) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <span>{label}</span>
        <span className={`font-bold ${color(score)}`}>{score}/100</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${bg(score)}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}
