import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { batchService } from '../../services'
import './BatchListPage.css'

function PulseDot() {
  return <span className="pulse-dot" />
}

function SkeletonCard() {
  return (
    <div className="batch-card skeleton">
      <div className="skeleton-line" style={{ height: 14, width: '40%' }} />
      <div className="skeleton-line" style={{ height: 28, marginTop: 10 }} />
      <div className="skeleton-line" style={{ height: 14, width: '70%', marginTop: 8 }} />
      <div className="skeleton-line" style={{ height: 8, marginTop: 20 }} />
    </div>
  )
}

function ActiveBatchCard({ batch }) {
  const navigate = useNavigate()
  const fillPct = Math.round((batch.soldKilos / batch.targetKilos) * 100)

  return (
    <div
      data-testid="batch-card"
      className="batch-card active-card"
      onClick={() => navigate(`/batches/${batch.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/batches/${batch.id}`)}
    >
      <div className="batch-card-header">
        <span className="batch-name">{batch.name}</span>
        <span className="batch-status-badge">
          <PulseDot />
          <span data-testid="batch-status">Fyldes</span>
        </span>
      </div>
      <div className="batch-card-body">
        <div className="batch-meat-type">{batch.meatType}</div>
        <div className="batch-description">{batch.description}</div>

        <div className="progress-wrap">
          <div className="progress-meta">
            <span><span className="progress-count">{batch.soldKilos}</span> / {batch.targetKilos} kg</span>
            <span>{fillPct}%</span>
          </div>
          <div data-testid="progress-bar" className="progress-bar">
            <div className="progress-fill" style={{ width: `${fillPct}%` }} />
          </div>
        </div>

        <div className="batch-price">
          <span className="price-label">Fra</span>
          <span className="price-value">{batch.pricePerKg} kr./kg</span>
          <span className="price-compare">{batch.comparePricePerKg} kr./kg i {batch.compareRetailer}</span>
        </div>
      </div>
    </div>
  )
}

function UpcomingBatchCard({ batch }) {
  const [showForm, setShowForm] = useState(false)
  const [interestEmail, setInterestEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleInterestSubmit(e) {
    e.preventDefault()
    if (!interestEmail) return
    setSubmitting(true)
    try {
      await batchService.registerInterest(batch.id, interestEmail)
      setSubmitted(true)
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div data-testid="batch-card" className="batch-card upcoming-card">
      <div className="batch-card-header">
        <span className="batch-name">{batch.name}</span>
        <span className="upcoming-badge">Kommer snart</span>
      </div>
      <div className="batch-card-body">
        <div className="batch-meat-type">{batch.meatType}</div>
        <div className="batch-description">{batch.description}</div>
        <div className="batch-price">
          <span className="price-label">Fra</span>
          <span className="price-value">{batch.pricePerKg} kr./kg</span>
        </div>

        {submitted ? (
          <div className="interest-success">
            Tak! Vi notificerer dig, når batchen åbner.
          </div>
        ) : showForm ? (
          <form className="interest-form" onSubmit={handleInterestSubmit}>
            <input
              data-testid="interest-email-input"
              type="email"
              className="interest-email-input"
              placeholder="din@email.dk"
              value={interestEmail}
              onChange={e => setInterestEmail(e.target.value)}
              required
            />
            <div className="interest-form-actions">
              <button
                data-testid="interest-submit-btn"
                type="submit"
                className="interest-submit-btn"
                disabled={submitting}
              >
                {submitting ? 'Sender...' : 'Registrer interesse'}
              </button>
              <button
                type="button"
                className="interest-cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Annuller
              </button>
            </div>
          </form>
        ) : (
          <button
            data-testid="upcoming-batch-interest-btn"
            className="interest-btn"
            onClick={() => setShowForm(true)}
          >
            Tilmeld interesse
          </button>
        )}
      </div>
    </div>
  )
}

export default function BatchListPage() {
  const [activeBatches, setActiveBatches] = useState([])
  const [upcomingBatches, setUpcomingBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      batchService.getActiveBatches(),
      batchService.getUpcomingBatches(),
    ]).then(([active, upcoming]) => {
      setActiveBatches(active)
      setUpcomingBatches(upcoming)
      setLoading(false)
    })
  }, [])

  return (
    <div className="batch-list-page">
      <nav className="batch-list-nav">
        <Link to="/" className="batch-list-logo"><img src="/logo.png" alt="Gaucho" style={{ height: 60, width: 'auto' }} /></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative', marginLeft: 'auto' }}>
          <button
            className="hamburger"
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
          </button>
          {menuOpen && (
            <div className="dropdown-menu">
              <Link to="/" onClick={() => setMenuOpen(false)}>Hjem</Link>
              <Link to="/batches" onClick={() => setMenuOpen(false)}>Batches</Link>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Log ind</Link>
            </div>
          )}
        </div>
      </nav>

      <div data-testid="batch-list" className="batch-list-container">
        <div className="batch-list-hero">
          <h1 className="batch-list-title">
            Alle <em>batches</em>
          </h1>
          <p className="batch-list-subtitle">
            Aktive og kommende batches fra Argentinas pampas
          </p>
        </div>

        <section data-testid="active-batches-section" className="batches-section">
          <div className="section-header">
            <h2 className="section-title">
              <PulseDot />
              Åbne nu
            </h2>
          </div>
          <div className="batches-grid">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : activeBatches.length === 0 ? (
              <p className="no-batches">Ingen aktive batches i øjeblikket.</p>
            ) : (
              activeBatches.map(batch => (
                <ActiveBatchCard key={batch.id} batch={batch} />
              ))
            )}
          </div>
        </section>

        <section data-testid="upcoming-batches-section" className="batches-section">
          <div className="section-header">
            <h2 className="section-title">Kommer snart</h2>
          </div>
          <div className="batches-grid">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : upcomingBatches.length === 0 ? (
              <p className="no-batches">Ingen kommende batches planlagt endnu.</p>
            ) : (
              upcomingBatches.map(batch => (
                <UpcomingBatchCard key={batch.id} batch={batch} />
              ))
            )}
          </div>
        </section>
      </div>

      <footer className="batch-list-footer">
        <span>© Gaucho ApS 2026</span>
        <span>CVR 44 12 87 03</span>
      </footer>
    </div>
  )
}
