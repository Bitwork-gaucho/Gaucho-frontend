import { useState } from 'react'
import { Batch, BatchImage, PickupLocation } from '../types'
import { mockApi } from '../services/mockApi'
import { formatAddress, imageSrc } from '../utils/batchStatus'
import './AdminBatchEditors.css'

interface EditorProps {
  batch: Batch
  onSaved: (batch: Batch) => void
}

const EMPTY_LOCATION = { name: '', address: '', postalCode: '', city: '', hours: '' }

/** Admin: tilføj og fjern afhentningssteder på en batch */
export function PickupLocationsEditor({ batch, onSaved }: EditorProps) {
  const [form, setForm] = useState(EMPTY_LOCATION)
  const [saving, setSaving] = useState(false)
  const locations = batch.pickupLocations ?? []

  async function save(next: PickupLocation[]) {
    setSaving(true)
    try {
      const updated = await mockApi.updateBatch(batch.id, { pickupLocations: next })
      if (updated) onSaved({ ...updated })
    } catch {
      alert('Afhentningsstederne kunne ikke gemmes')
    } finally {
      setSaving(false)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.address.trim() || !form.postalCode.trim() || !form.city.trim()) return
    const location: PickupLocation = {
      id: `loc-${Date.now()}`,
      name: form.name.trim(),
      address: form.address.trim(),
      postalCode: form.postalCode.trim(),
      city: form.city.trim(),
      ...(form.hours.trim() ? { hours: form.hours.trim() } : {}),
    }
    await save([...locations, location])
    setForm(EMPTY_LOCATION)
  }

  async function handleRemove(id: string) {
    const loc = locations.find(l => l.id === id)
    if (!loc || !window.confirm(`Fjern afhentningsstedet "${loc.name}"?`)) return
    await save(locations.filter(l => l.id !== id))
  }

  const field = (key: keyof typeof EMPTY_LOCATION) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value }),
  })

  return (
    <div className="editor-section">
      <h2>Afhentningssteder ({locations.length})</h2>
      <div className="control-card">
        {locations.length === 0 ? (
          <p className="editor-empty">Ingen afhentningssteder endnu. Kunderne kan ikke vælge et sted, før der er mindst ét.</p>
        ) : (
          <ul className="editor-list">
            {locations.map(l => (
              <li key={l.id}>
                <span className="editor-item-text">
                  <strong>{l.name}</strong>
                  <span>{formatAddress(l)}{l.hours ? ` · ${l.hours}` : ''}</span>
                </span>
                <button type="button" className="editor-remove" onClick={() => handleRemove(l.id)} disabled={saving}>
                  Fjern
                </button>
              </li>
            ))}
          </ul>
        )}

        <form className="editor-form" onSubmit={handleAdd}>
          <h3>Tilføj afhentningssted</h3>
          <div className="form-group">
            <label htmlFor="loc-name">Navn</label>
            <input id="loc-name" placeholder="fx København – Kødbyen" required {...field('name')} />
          </div>
          <div className="form-group">
            <label htmlFor="loc-address">Adresse</label>
            <input id="loc-address" placeholder="fx Flæsketorvet 20" required {...field('address')} />
          </div>
          <div className="editor-row">
            <div className="form-group">
              <label htmlFor="loc-zip">Postnr.</label>
              <input id="loc-zip" inputMode="numeric" placeholder="1711" required {...field('postalCode')} />
            </div>
            <div className="form-group">
              <label htmlFor="loc-city">By</label>
              <input id="loc-city" placeholder="København V" required {...field('city')} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="loc-hours">Åbningstid (valgfri)</label>
            <input id="loc-hours" placeholder="fx Lørdag kl. 10–14" {...field('hours')} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Gemmer…' : 'Tilføj sted'}
          </button>
        </form>
      </div>
    </div>
  )
}

/** Læs en billedfil som data-URL (demo: der er ingen server at uploade til) */
function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/** Admin: upload, sortér og slet billeder på en batch */
export function ImagesEditor({ batch, onSaved }: EditorProps) {
  const [saving, setSaving] = useState(false)
  const [alt, setAlt] = useState('')
  const [url, setUrl] = useState('')
  const images = batch.images ?? []

  async function save(next: BatchImage[]) {
    setSaving(true)
    try {
      const updated = await mockApi.updateBatch(batch.id, { images: next })
      if (updated) onSaved({ ...updated })
    } catch {
      alert('Billederne kunne ikke gemmes')
    } finally {
      setSaving(false)
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const added: BatchImage[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      added.push({ url: await readFile(file), alt: alt.trim() || batch.meatType })
    }
    if (added.length) {
      await save([...images, ...added])
      setAlt('')
    }
  }

  async function handleAddUrl(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    await save([...images, { url: url.trim(), alt: alt.trim() || batch.meatType }])
    setUrl('')
    setAlt('')
  }

  function move(i: number, step: number) {
    const j = i + step
    if (j < 0 || j >= images.length) return
    const next = [...images]
    ;[next[i], next[j]] = [next[j], next[i]]
    save(next)
  }

  async function remove(i: number) {
    if (!window.confirm('Slet dette billede fra batchen?')) return
    await save(images.filter((_, k) => k !== i))
  }

  return (
    <div className="editor-section">
      <h2>Billeder ({images.length})</h2>
      <div className="control-card">
        {images.length === 0 ? (
          <p className="editor-empty">Ingen billeder endnu. Det første billede bruges som forsidebillede.</p>
        ) : (
          <ul className="editor-images">
            {images.map((img, i) => (
              <li key={img.url.slice(0, 80) + i}>
                <img src={imageSrc(img.url)} alt={img.alt} />
                {i === 0 && <span className="editor-cover-tag">Forside</span>}
                <span className="editor-image-alt">{img.alt}</span>
                <span className="editor-image-actions">
                  <button type="button" onClick={() => move(i, -1)} disabled={saving || i === 0} aria-label="Flyt til venstre">←</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={saving || i === images.length - 1} aria-label="Flyt til højre">→</button>
                  <button type="button" className="editor-remove" onClick={() => remove(i)} disabled={saving}>Slet</button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="editor-form">
          <h3>Tilføj billeder</h3>
          <div className="form-group">
            <label htmlFor="img-alt">Beskrivelse (til skærmlæsere)</label>
            <input id="img-alt" value={alt} onChange={e => setAlt(e.target.value)} placeholder="fx Ribeye-bøf på panden" />
          </div>
          <div className="form-group">
            <label htmlFor="img-file">Upload fra din enhed</label>
            <input
              id="img-file"
              type="file"
              accept="image/*"
              multiple
              disabled={saving}
              onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
            />
          </div>
          <form onSubmit={handleAddUrl} className="editor-url">
            <div className="form-group">
              <label htmlFor="img-url">…eller indsæt et billedlink</label>
              <input id="img-url" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" />
            </div>
            <button type="submit" className="btn btn-outline" disabled={saving || !url.trim()}>Tilføj link</button>
          </form>
          <p className="editor-note">Demo: Billeder gemmes kun, så længe siden er åben, indtil der er en rigtig server.</p>
        </div>
      </div>
    </div>
  )
}
