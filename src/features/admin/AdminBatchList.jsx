import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { batchService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import './AdminBatchList.css'

const EMPTY_FORM = {
  name: '',
  meatType: '',
  description: '',
  targetKilos: '',
  pricePerKg: '',
  comparePricePerKg: '',
  compareRetailer: '',
  deliveryWeeks: '6',
  status: 'UPCOMING',
}

export default function AdminBatchList() {
  const { session, logout } = useAuth()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  async function loadBatches() {
    setLoading(true)
    const all = await batchService.getActiveBatches()
    const upcoming = await batchService.getUpcomingBatches()
    const completed = await batchService.getCompletedBatches()
    setBatches([...all, ...upcoming, ...completed])
    setLoading(false)
  }

  useEffect(() => {
    loadBatches()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await batchService.createBatch({
        ...form,
        targetKilos: Number(form.targetKilos),
        pricePerKg: Number(form.pricePerKg),
        comparePricePerKg: form.comparePricePerKg ? Number(form.comparePricePerKg) : null,
        deliveryWeeks: Number(form.deliveryWeeks),
      })
      setForm(EMPTY_FORM)
      setShowCreateForm(false)
      await loadBatches()
    } catch {
      setError('Kunne ikke oprette batch. Prøv igen.')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(batchId) {
    if (!confirm('Slet denne batch og alle tilknyttede ordrer?')) return
    await batchService.deleteBatch(batchId)
    await loadBatches()
  }

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <Link to="/" className="admin-logo"><img src="/logo.png" alt="Gaucho" style={{ height: 60, width: 'auto' }} /></Link>
        <span className="admin-badge">Admin</span>
        <span className="admin-user">{session?.email}</span>
        <Link to="/admin/payments" className="admin-nav-link">Konto</Link>
        <Link to="/admin/scanner" className="admin-nav-link">Scanner</Link>
        <button className="admin-logout-btn" onClick={logout}>Log ud</button>
      </nav>

      <div data-testid="admin-batch-list" className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Batch Administration</h1>
          <button
            data-testid="create-batch-btn"
            className="create-batch-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            + Opret ny batch
          </button>
        </div>

        {showCreateForm && (
          <form className="create-batch-form" onSubmit={handleCreate}>
            <h3 className="create-form-title">Ny batch</h3>
            {error && <div className="create-form-error">{error}</div>}
            <div className="form-row">
              <label className="form-field">
                <span className="form-label">Navn</span>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="Batch 004"
                  required
                />
              </label>
              <label className="form-field">
                <span className="form-label">Kødtype</span>
                <input
                  className="form-input"
                  value={form.meatType}
                  onChange={e => updateField('meatType', e.target.value)}
                  placeholder="Ribeye, 250 g bøffer"
                  required
                />
              </label>
            </div>
            <label className="form-field">
              <span className="form-label">Beskrivelse</span>
              <input
                className="form-input"
                value={form.description}
                onChange={e => updateField('description', e.target.value)}
                placeholder="Estancia... · mørnet..."
              />
            </label>
            <div className="form-row">
              <label className="form-field">
                <span className="form-label">Mål kg</span>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  value={form.targetKilos}
                  onChange={e => updateField('targetKilos', e.target.value)}
                  placeholder="500"
                  required
                />
              </label>
              <label className="form-field">
                <span className="form-label">Pris kr./kg</span>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  value={form.pricePerKg}
                  onChange={e => updateField('pricePerKg', e.target.value)}
                  placeholder="149"
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label className="form-field">
                <span className="form-label">Sammenlign pris</span>
                <input
                  className="form-input"
                  type="number"
                  value={form.comparePricePerKg}
                  onChange={e => updateField('comparePricePerKg', e.target.value)}
                  placeholder="289"
                />
              </label>
              <label className="form-field">
                <span className="form-label">Detailforhandler</span>
                <input
                  className="form-input"
                  value={form.compareRetailer}
                  onChange={e => updateField('compareRetailer', e.target.value)}
                  placeholder="Føtex"
                />
              </label>
            </div>
            <div className="form-row">
              <label className="form-field">
                <span className="form-label">Levering uger</span>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  value={form.deliveryWeeks}
                  onChange={e => updateField('deliveryWeeks', e.target.value)}
                  placeholder="6"
                />
              </label>
              <label className="form-field">
                <span className="form-label">Status</span>
                <select
                  className="form-input"
                  value={form.status}
                  onChange={e => updateField('status', e.target.value)}
                >
                  <option value="UPCOMING">Kommende</option>
                  <option value="WAITING_TO_FILL">Åben for køb</option>
                </select>
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="create-form-submit" disabled={creating}>
                {creating ? 'Opretter...' : 'Opret batch'}
              </button>
              <button
                type="button"
                className="create-form-cancel"
                onClick={() => { setShowCreateForm(false); setForm(EMPTY_FORM) }}
              >
                Annuller
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="admin-loading">Henter batches...</div>
        ) : (
          <div className="admin-batches">
            <div className="admin-section-header">
              <span className="admin-count">{batches.length} batches i alt</span>
            </div>

            {batches.map(batch => (
              <div key={batch.id} data-testid="batch-card" className="admin-batch-card">
                <div className="admin-batch-info">
                  <div className="admin-batch-id">{batch.id}</div>
                  <div className="admin-batch-name">{batch.meatType || batch.name}</div>
                  <div className="admin-batch-meta">
                    <span className={`admin-batch-status status-${batch.status?.toLowerCase()}`}>
                      {batch.status}
                    </span>
                    <span className="admin-batch-progress">
                      {batch.soldKilos} / {batch.targetKilos} kg
                    </span>
                  </div>
                </div>
                <div className="admin-batch-actions">
                  <Link to={`/admin/batches/${batch.id}`} className="admin-view-btn">
                    Håndter
                  </Link>
                  <button
                    className="admin-delete-btn"
                    onClick={() => handleDelete(batch.id)}
                    aria-label="Slet batch"
                  >
                    Slet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
