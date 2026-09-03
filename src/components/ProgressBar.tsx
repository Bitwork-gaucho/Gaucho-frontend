import './ProgressBar.css'

interface ProgressBarProps {
  current: number
  target: number
  label?: string
  showPercentage?: boolean
  variant?: 'primary' | 'success' | 'warning'
}

export default function ProgressBar({ current, target, label, showPercentage = true, variant = 'primary' }: ProgressBarProps) {
  const percentage = Math.min(100, (current / target) * 100)
  const isComplete = percentage >= 100

  return (
    <div className={`progress-bar-wrapper ${variant}`}>
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-bar">
        <div
          className={`progress-fill ${isComplete ? 'complete' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="progress-info">
        <span className="progress-text">
          {current} / {target}
        </span>
        {showPercentage && (
          <span className="progress-percentage">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  )
}
