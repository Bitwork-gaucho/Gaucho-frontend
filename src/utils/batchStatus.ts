import { Batch } from '../types'

export type BatchStatus = Batch['status']

// Farvetone for statusmærket. Accentfarven er forbeholdt knapper og links,
// så status bruger de semantiske farver.
export type StatusTone = 'neutral' | 'open' | 'progress' | 'ready' | 'done'

interface StatusInfo {
  /** Kort navn til mærker og tidslinje */
  label: string
  /** Forklaring til kunden: hvad sker der lige nu */
  description: string
  tone: StatusTone
}

export const BATCH_STATUS: Record<BatchStatus, StatusInfo> = {
  UPCOMING: {
    label: 'Kommer snart',
    description: 'Batchen åbner snart for bestilling.',
    tone: 'neutral',
  },
  WAITING_TO_FILL: {
    label: 'Åben for bestilling',
    description: 'Vi samler bestillinger. Når batchen er fyldt, bestiller vi kødet hjem fra gården.',
    tone: 'open',
  },
  ORDERED: {
    label: 'Bestilt',
    description: 'Batchen er fyldt, og kødet er bestilt hos gården. Det bliver nu pakket og frosset til forsendelse.',
    tone: 'progress',
  },
  IN_TRANSIT: {
    label: 'På vej',
    description: 'Kødet er på vej til Danmark med skib. Det tager typisk 4–5 uger.',
    tone: 'progress',
  },
  AT_CUSTOMS: {
    label: 'I tolden',
    description: 'Forsendelsen er ankommet og bliver kontrolleret i tolden. Det tager normalt 1–3 dage.',
    tone: 'progress',
  },
  READY_FOR_PICKUP: {
    label: 'Klar til afhentning',
    description: 'Kødet er klar. Medbring din kvittering med stregkode, når du henter.',
    tone: 'ready',
  },
  COMPLETED: {
    label: 'Afsluttet',
    description: 'Alle bestillinger i batchen er udleveret.',
    tone: 'done',
  },
}

/** Faserne i den rækkefølge en batch går igennem dem */
export const BATCH_STEPS: BatchStatus[] = [
  'WAITING_TO_FILL',
  'ORDERED',
  'IN_TRANSIT',
  'AT_CUSTOMS',
  'READY_FOR_PICKUP',
]

export function statusInfo(status: BatchStatus): StatusInfo {
  return BATCH_STATUS[status] ?? { label: status, description: '', tone: 'neutral' }
}

/** Index i BATCH_STEPS; -1 før første fase, BATCH_STEPS.length når afsluttet */
export function stepIndex(status: BatchStatus): number {
  if (status === 'COMPLETED') return BATCH_STEPS.length
  return BATCH_STEPS.indexOf(status)
}

export function isOpenForOrders(batch: Batch): boolean {
  return batch.status === 'WAITING_TO_FILL'
}

export function fillInfo(batch: Batch) {
  const remaining = Math.max(0, batch.targetKilos - batch.soldKilos)
  const percent = batch.targetKilos > 0
    ? Math.min(100, Math.round((batch.soldKilos / batch.targetKilos) * 100))
    : 0
  return { remaining, percent, full: remaining === 0 }
}

const dkNumber = new Intl.NumberFormat('da-DK')
export const formatKg = (kg: number) => `${dkNumber.format(kg)} kg`
export const formatKr = (kr: number) => `${dkNumber.format(kr)} kr.`

export const ORDER_STATUS: Record<'PENDING' | 'PAID' | 'CANCELLED', string> = {
  PENDING: 'Afventer betaling',
  PAID: 'Betalt',
  CANCELLED: 'Annulleret',
}

export const SHIPMENT_STATUS: Record<'PREPARING' | 'IN_TRANSIT' | 'AT_CUSTOMS' | 'CLEARED', string> = {
  PREPARING: 'Klargøres',
  IN_TRANSIT: 'På vej',
  AT_CUSTOMS: 'I tolden',
  CLEARED: 'Fortoldet',
}

export function formatDate(iso: string | Date, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Date(iso).toLocaleDateString('da-DK', opts)
}
