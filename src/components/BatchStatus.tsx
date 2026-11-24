import { Batch } from '../types'
import { BATCH_STEPS, BatchStatus, fillInfo, formatKg, statusInfo, stepIndex } from '../utils/batchStatus'
import { CheckIcon } from './Icons'
import './BatchStatus.css'

/** Lille farvet mærke med batchens status */
export function BatchStatusBadge({ status }: { status: BatchStatus }) {
  const info = statusInfo(status)
  return (
    <span className={`status-badge tone-${info.tone}`}>
      <span className="status-dot" aria-hidden="true" />
      {info.label}
    </span>
  )
}

/** Hvor meget af batchen der er solgt, og hvad der mangler */
export function BatchFill({ batch, compact = false }: { batch: Batch; compact?: boolean }) {
  const { remaining, percent, full } = fillInfo(batch)
  const open = batch.status === 'WAITING_TO_FILL'

  return (
    <div className={`batch-fill ${compact ? 'compact' : ''}`}>
      <div
        className="fill-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={batch.targetKilos}
        aria-valuenow={batch.soldKilos}
        aria-label="Solgt af batchen"
      >
        <div className={`fill-bar ${full || !open ? 'full' : ''}`} style={{ width: `${open ? percent : 100}%` }} />
      </div>
      <div className="fill-text">
        {open ? (
          <>
            <span><strong>{formatKg(batch.soldKilos)}</strong> af {formatKg(batch.targetKilos)} solgt</span>
            <span className="fill-remaining">
              {full ? 'Batchen er fyldt' : `Mangler ${formatKg(remaining)}`}
            </span>
          </>
        ) : (
          <span>{formatKg(batch.soldKilos)} solgt · lukket for bestilling</span>
        )}
      </div>
    </div>
  )
}

/** Tidslinje over batchens faser med forklaring af den nuværende */
export function BatchTimeline({ batch }: { batch: Batch }) {
  const current = stepIndex(batch.status)
  const info = statusInfo(batch.status)
  const pickup = batch.status === 'READY_FOR_PICKUP' && (batch.pickupLocation || batch.pickupTimeWindow)

  return (
    <div className="batch-timeline">
      <ol className="timeline-steps">
        {BATCH_STEPS.map((step, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo'
          return (
            <li key={step} className={`timeline-step ${state}`} aria-current={state === 'current' ? 'step' : undefined}>
              <span className="step-marker">
                {state === 'done' ? <CheckIcon size={14} /> : i + 1}
              </span>
              <span className="step-label">{statusInfo(step).label}</span>
            </li>
          )
        })}
      </ol>

      <div className={`timeline-now tone-${info.tone}`}>
        <div className="now-title">
          {batch.status === 'COMPLETED' ? 'Afsluttet' : `Nu: ${info.label}`}
        </div>
        <p>{info.description}</p>
        {pickup && (
          <p className="now-pickup">
            {batch.pickupLocation && <>Afhentning: <strong>{batch.pickupLocation}</strong></>}
            {batch.pickupTimeWindow && <> · kl. {batch.pickupTimeWindow.start}–{batch.pickupTimeWindow.end}</>}
          </p>
        )}
      </div>
    </div>
  )
}
