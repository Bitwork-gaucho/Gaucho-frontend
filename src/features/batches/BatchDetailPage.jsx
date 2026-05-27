import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { batchService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import './BatchDetailPage.css'

function PulseDot() {
  return <span className="pulse-dot" />
}

const STATUS_LABELS = {
  WAITING_TO_FILL: 'Fyldes',
  ORDERED: 'Bestilt',
  IN_TRANSIT: 'På vej',
  ARRIVED: 'Ankommet',
  COMPLETED: 'Afsluttet',
  UPCOMING: 'Kommende',
}

const QUANTITY_PRESETS = [1, 2, 3, 5, 10]

export default function BatchDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const [batch, setBatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedKilos, setSelectedKilos] = useState(null)
  const [orderCancelled, setOrderCancelled] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    batchService.getBatchById(id).then(b => {
      setBatch(b)
      setLoading(false)
    })
  }, [id])

  async function handleShareClick() {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      // Fallback — silently fail
    }
  }

  async function handleCancelOrder() {
    setCancelling(true)
    try {
      await batchService.cancelOrder(`ord-mock-${id}`)
      setOrderCancelled(true)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="batch-detail-page">
        <nav className="batch-detail-nav">
          <Link to="/" className="batch-detail-logo">Gaucho<em>.</em></Link>
          <Link data-testid="nav-batches" to="/batches" className="nav-back">← Batches</Link>
        </nav>
        <div className="batch-detail-skeleton">
          <div className="skeleton-line" style={{ height: 16, width: '30%' }} />
          <div className="skeleton-line" style={{ height: 40, marginTop: 12 }} />
          <div className="skeleton-line" style={{ height: 14, width: '60%', marginTop: 10 }} />
        </div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="batch-detail-page">
        <nav className="batch-detail-nav">
          <Link to="/" className="batch-detail-logo">Gaucho<em>.</em></Link>
          <Link data-testid="nav-batches" to="/batches" className="nav-back">← Batches</Link>
        </nav>
        <div className="batch-not-found">
          <h2>Batch ikke fundet</h2>
          <Link to="/batches">Tilbage til alle batches</Link>
        </div>
      </div>
    )
  }

  const fillPct = Math.round((batch.soldKilos / batch.targetKilos) * 100)
  const orderTotal = selectedKilos ? selectedKilos * batch.pricePerKg : null

  return (
    <div className="batch-detail-page" data-testid="batch-detail">
      <nav className="batch-detail-nav">
        <Link to="/" className="batch-detail-logo">Gaucho<em>.</em></Link>
        <Link data-testid="nav-batches" to="/batches" className="nav-back">← Batches</Link>
        <Link to="/login" className="nav-login">{session ? session.email.split('@')[0] : 'Log ind'}</Link>
      </nav>

      <div className="batch-detail-container">
        {/* Batch header */}
        <div className="batch-detail-header">
          <div className="batch-detail-meta">
            <span className="batch-detail-id">{batch.name}</span>
            <span data-testid="batch-status" className="batch-detail-status">
              {batch.status === 'WAITING_TO_FILL' && <PulseDot />}
              {STATUS_LABELS[batch.status] || batch.status}
            </span>
          </div>
          <h1 className="batch-detail-title">{batch.meatType}</h1>
          <p className="batch-detail-description">{batch.description}</p>
        </div>

        {/* Progress */}
        <div className="batch-detail-progress">
          <div className="progress-meta">
            <span><span className="progress-count">{batch.soldKilos}</span> / {batch.targetKilos} kg solgt</span>
            <span>{fillPct}%</span>
          </div>
          <div data-testid="progress-bar" className="progress-bar">
            <div className="progress-fill" style={{ width: `${fillPct}%` }} />
            <div className="progress-tick" style={{ left: '25%' }} />
            <div className="progress-tick" style={{ left: '50%' }} />
            <div className="progress-tick" style={{ left: '75%' }} />
          </div>
          <div className="progress-info">
            Afsendes ved 100 % — {batch.customerCount} kunder deltager
          </div>
        </div>

        {/* Origin */}
        {batch.origin && (
          <div className="batch-detail-origin">
            <div className="origin-label">Oprindelse</div>
            <div className="origin-value">
              {batch.origin.farm} · {batch.origin.region}, {batch.origin.country}
            </div>
            <div className="origin-coords">{batch.origin.coords}</div>
          </div>
        )}

        {/* Price */}
        <div className="batch-detail-pricing">
          <div className="price-from">Fra</div>
          <div className="price-main">
            {batch.pricePerKg} <span className="price-unit">kr./kg</span>
          </div>
          {batch.comparePricePerKg && (
            <div className="price-compare">
              {batch.comparePricePerKg} kr./kg i {batch.compareRetailer} (−{batch.savingsPercent}%)
            </div>
          )}
        </div>

        {/* Quantity selector */}
        {batch.status !== 'COMPLETED' && batch.status !== 'UPCOMING' && (
          <div data-testid="quantity-selector" className="quantity-selector">
            <div className="quantity-label">Vælg mængde</div>
            <div className="quantity-presets">
              {QUANTITY_PRESETS.map(kg => (
                <button
                  key={kg}
                  data-testid={`quantity-btn-${kg}`}
                  className={`quantity-btn${selectedKilos === kg ? ' quantity-btn--active' : ''}`}
                  onClick={() => setSelectedKilos(kg)}
                >
                  {kg} kg
                </button>
              ))}
            </div>
            {orderTotal !== null && (
              <div data-testid="order-total" className="order-total">
                <span className="order-total-label">Total</span>
                <span className="order-total-value">{orderTotal} kr.</span>
                <span className="order-total-sub">({selectedKilos} kg × {batch.pricePerKg} kr./kg)</span>
              </div>
            )}
          </div>
        )}

        {/* Share button */}
        <button
          data-testid="share-btn"
          className="share-btn"
          onClick={handleShareClick}
        >
          Del denne batch
        </button>

        {/* Login / Order section */}
        {session ? (
          <div data-testid="order-details" className="order-details-section">
            <div className="order-details-header">
              <h3 className="order-details-title">Din bestilling</h3>
              <span className="order-details-user">{session.email}</span>
            </div>
            {orderCancelled ? (
              <div className="order-cancelled-msg">
                Din bestilling er annulleret.
              </div>
            ) : (
              <>
                <div className="order-details-body">
                  <div className="order-detail-row">
                    <span>Mængde</span>
                    <span>{selectedKilos || 2} kg</span>
                  </div>
                  <div className="order-detail-row">
                    <span>Beløb</span>
                    <span>{(selectedKilos || 2) * batch.pricePerKg} kr.</span>
                  </div>
                  <div className="order-detail-row">
                    <span>Status</span>
                    <span>{STATUS_LABELS[batch.status] || batch.status}</span>
                  </div>
                </div>
                <button
                  data-testid="cancel-order-btn"
                  className="cancel-order-btn"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? 'Annullerer...' : 'Annuller bestilling'}
                </button>
              </>
            )}
          </div>
        ) : (
          <div data-testid="login-section" className="login-section">
            <div className="login-section-header">
              <h3 className="login-section-title">Log ind for at se din bestilling</h3>
              <p className="login-section-subtitle">
                Allerede med i denne batch? Log ind for at se dine detaljer.
              </p>
            </div>
            <Link to="/login" className="login-section-btn">
              Log ind
            </Link>
          </div>
        )}
      </div>

      <footer className="batch-detail-footer">
        <span>© Gaucho ApS 2026</span>
        <span>CVR 44 12 87 03</span>
      </footer>
    </div>
  )
}
