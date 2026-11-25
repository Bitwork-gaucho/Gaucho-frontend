import { PickupLocation } from '../types'
import { formatAddress } from '../utils/batchStatus'
import './PickupLocations.css'

const Pin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

function LocationText({ location }: { location: PickupLocation }) {
  return (
    <span className="pickup-text">
      <span className="pickup-name">{location.name}</span>
      <span className="pickup-address">{formatAddress(location)}</span>
      {location.hours && <span className="pickup-hours">{location.hours}</span>}
    </span>
  )
}

/** Oversigt over en batchs afhentningssteder */
export function PickupLocationList({ locations, highlightId }: { locations?: PickupLocation[]; highlightId?: string }) {
  if (!locations || locations.length === 0) {
    return <p className="pickup-empty">Afhentningssteder er ikke fastlagt endnu.</p>
  }
  return (
    <ul className="pickup-list">
      {locations.map(l => (
        <li key={l.id} className={`pickup-item ${l.id === highlightId ? 'chosen' : ''}`}>
          <Pin />
          <LocationText location={l} />
          {l.id === highlightId && <span className="pickup-chosen-tag">Dit valg</span>}
        </li>
      ))}
    </ul>
  )
}

/** Vælg ét afhentningssted (radioknapper som kort) */
export function PickupLocationPicker({
  locations,
  value,
  onChange,
}: {
  locations: PickupLocation[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <fieldset className="pickup-picker">
      <legend>Vælg afhentningssted</legend>
      {locations.map(l => (
        <label key={l.id} className={`pickup-option ${value === l.id ? 'selected' : ''}`}>
          <input
            type="radio"
            name="pickup-location"
            value={l.id}
            checked={value === l.id}
            onChange={() => onChange(l.id)}
          />
          <LocationText location={l} />
        </label>
      ))}
    </fieldset>
  )
}

/** Én linje til kvittering, ordrer og betaling */
export function PickupLocationLine({ location }: { location?: PickupLocation }) {
  if (!location) return <span>Ikke valgt</span>
  return (
    <span className="pickup-line">
      <strong>{location.name}</strong>
      <span>{formatAddress(location)}{location.hours ? ` · ${location.hours}` : ''}</span>
    </span>
  )
}
