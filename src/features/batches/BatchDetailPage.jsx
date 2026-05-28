import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { batchService } from '../../services'
import { paymentService } from '../../services/paymentService'
import { shipmentService } from '../../services/shipmentService'
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

function ShipmentMap({ progress }) {
  // SVG arc from Argentina (bottom-left) to Denmark (top-right)
  const width = 400
  const height = 200
  // Start: Buenos Aires ~bottom-left; End: Copenhagen ~top-right
  const startX = 60
  const startY = 160
  const endX = 340
  const endY = 40
  // Quadratic bezier control point for arc shape
  const cx = 80
  const cy = 20

  // Ship position along the path at progress %
  // Approximate parametric position on quadratic bezier
  const t = Math.max(0, Math.min(1, progress || 0.35))
  const shipX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * cx + t * t * endX
  const shipY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * cy + t * t * endY

  return (
    <svg
      data-testid="shipment-map"
      viewBox={`0 0 ${width} ${height}`}
      className="shipment-map-svg"
      aria-label="Skibsrute fra Buenos Aires til København"
    >
      {/* Ocean background */}
      <rect width={width} height={height} fill="#0a1628" rx="4" />

      {/* Route arc (dashed) */}
      <path
        d={`M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`}
        stroke="#c8a96e"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        fill="none"
        opacity="0.5"
      />

      {/* Completed route */}
      {t > 0 && (
        <path
          d={`M ${startX} ${startY} Q ${cx} ${cy} ${shipX} ${shipY}`}
          stroke="#c8a96e"
          strokeWidth="2"
          fill="none"
          opacity="0.9"
        />
      )}

      {/* Origin dot — Buenos Aires */}
      <circle cx={startX} cy={startY} r="4" fill="#c8a96e" />
      <text x={startX + 6} y={startY + 4} fill="#f0ede8" fontSize="9" fontFamily="monospace">Buenos Aires</text>

      {/* Destination dot — Copenhagen */}
      <circle cx={endX} cy={endY} r="4" fill="#c8a96e" opacity="0.5" />
      <text x={endX - 60} y={endY - 6} fill="#f0ede8" fontSize="9" fontFamily="monospace">København</text>

      {/* Ship icon at current position */}
      <g transform={`translate(${shipX}, ${shipY})`}>
        <circle r="7" fill="#c8a96e" opacity="0.2" />
        <text textAnchor="middle" dominantBaseline="central" fontSize="12">⛵</text>
      </g>
    </svg>
  )
}

function ShipmentTracking({ batch }) {
  const [etaData, setEtaData] = useState(null)
  const [statusData, setStatusData] = useState(null)
  const [loadingShipment, setLoadingShipment] = useState(true)

  useEffect(() => {
    Promise.all([
      shipmentService.getShipmentETA(batch.shipmentId || batch.id),
      shipmentService.getShipmentStatus(batch.shipmentId || batch.id),
    ]).then(([eta, status]) => {
      setEtaData(eta)
      setStatusData(status)
      setLoadingShipment(false)
    })
  }, [batch.id])

  return (
    <div data-testid="shipment-tracking" className="shipment-tracking">
      <div className="shipment-tracking-header">
        <span className="shipment-tracking-label">Fragtstatus</span>
        <span className="shipment-route-indicator">
          Afgang · Buenos Aires → København · Ankomst
        </span>
      </div>

      <ShipmentMap progress={statusData?.progress ?? 0.35} />

      {loadingShipment ? (
        <div className="shipment-loading">Henter fraktinfo…</div>
      ) : (
        <div className="shipment-details">
          <div data-testid="shipment-status-text" className="shipment-status-text">
            {statusData?.description || 'Ukendt status'}
          </div>
          <div data-testid="shipment-eta" className="shipment-eta">
            ETA: {etaData?.eta || '—'} ({etaData?.daysRemaining} dage tilbage)
          </div>
        </div>
      )}
    </div>
  )
}

function CheckoutSummary({ batch, kilos, onBack, onConfirm }) {
  const total = kilos * batch.pricePerKg
  return (
    <div data-testid="checkout-summary" className="checkout-summary">
      <div className="checkout-header">
        <button className="checkout-back-btn" onClick={onBack}>← Tilbage</button>
        <h2 className="checkout-title">Gennemse bestilling</h2>
      </div>
      <div className="checkout-rows">
        <div className="checkout-row">
          <span>Mængde</span>
          <span>{kilos} kg</span>
        </div>
        <div className="checkout-row">
          <span>Pris pr. kg</span>
          <span>{batch.pricePerKg} kr./kg</span>
        </div>
        <div className="checkout-row checkout-row--total">
          <span>Total</span>
          <span data-testid="checkout-total">{total} kr.</span>
        </div>
      </div>
      <button
        data-testid="pay-btn"
        className="pay-btn"
        onClick={onConfirm}
      >
        Betal {total} kr.
      </button>
    </div>
  )
}

function OrderConfirmation({ batch, kilos, receiptData, onBackToBatch }) {
  const total = kilos * batch.pricePerKg
  return (
    <div data-testid="order-confirmation" className="order-confirmation">
      <div className="order-confirmation-icon">✓</div>
      <h2 className="order-confirmation-heading">Tak for din bestilling!</h2>
      <p className="order-confirmation-sub">
        Din ordre er registreret. Vi sender besked, når batchen er klar.
      </p>
      <div className="order-confirmation-summary">
        <div className="order-conf-row">
          <span>Mængde</span>
          <span>{kilos} kg</span>
        </div>
        <div className="order-conf-row">
          <span>Total</span>
          <span>{total} kr.</span>
        </div>
        <div className="order-conf-row">
          <span>Ordrenr.</span>
          <span>{receiptData?.receiptId}</span>
        </div>
      </div>
      <div data-testid="order-barcode" className="order-barcode">
        <div className="barcode-label">Kvitteringskode</div>
        <div className="barcode-value">{receiptData?.barcodeData}</div>
        <div className="barcode-visual" aria-hidden="true">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="barcode-bar"
              style={{ width: i % 3 === 0 ? '3px' : '2px', opacity: i % 5 === 0 ? 0.4 : 1 }}
            />
          ))}
        </div>
      </div>
      <a
        data-testid="order-share-link"
        href={`/batches/${batch.id}`}
        className="order-share-link"
      >
        Del med venner
      </a>
      <Link to={`/batches/${batch.id}`} className="order-back-link" onClick={onBackToBatch}>
        Tilbage til batch
      </Link>
    </div>
  )
}

export default function BatchDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const [batch, setBatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedKilos, setSelectedKilos] = useState(null)
  const [orderCancelled, setOrderCancelled] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  // Checkout flow
  const [checkoutStep, setCheckoutStep] = useState('browse') // 'browse' | 'checkout' | 'confirmation'
  const [paying, setPaying] = useState(false)
  const [receiptData, setReceiptData] = useState(null)

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

  async function handlePay() {
    setPaying(true)
    try {
      const result = await paymentService.processPayment(`ord-${Date.now()}`, {})
      setReceiptData(result)
      setCheckoutStep('confirmation')
    } finally {
      setPaying(false)
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

  // Checkout step
  if (checkoutStep === 'checkout') {
    return (
      <div className="batch-detail-page" data-testid="batch-detail">
        <nav className="batch-detail-nav">
          <Link to="/" className="batch-detail-logo">Gaucho<em>.</em></Link>
          <Link data-testid="nav-batches" to="/batches" className="nav-back">← Batches</Link>
          <Link to="/login" className="nav-login">{session ? session.email.split('@')[0] : 'Log ind'}</Link>
        </nav>
        <div className="batch-detail-container">
          <CheckoutSummary
            batch={batch}
            kilos={selectedKilos}
            onBack={() => setCheckoutStep('browse')}
            onConfirm={handlePay}
          />
        </div>
      </div>
    )
  }

  // Confirmation step
  if (checkoutStep === 'confirmation') {
    return (
      <div className="batch-detail-page" data-testid="batch-detail">
        <nav className="batch-detail-nav">
          <Link to="/" className="batch-detail-logo">Gaucho<em>.</em></Link>
          <Link data-testid="nav-batches" to="/batches" className="nav-back">← Batches</Link>
          <Link to="/login" className="nav-login">{session ? session.email.split('@')[0] : 'Log ind'}</Link>
        </nav>
        <div className="batch-detail-container">
          <OrderConfirmation
            batch={batch}
            kilos={selectedKilos}
            receiptData={receiptData}
            onBackToBatch={() => setCheckoutStep('browse')}
          />
        </div>
      </div>
    )
  }

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

        {/* Shipment tracking (IN_TRANSIT only) */}
        {batch.status === 'IN_TRANSIT' && (
          <ShipmentTracking batch={batch} />
        )}

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
            {selectedKilos && (
              <button
                data-testid="proceed-to-checkout-btn"
                className="proceed-to-checkout-btn"
                onClick={() => setCheckoutStep('checkout')}
              >
                Gå til betaling
              </button>
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
