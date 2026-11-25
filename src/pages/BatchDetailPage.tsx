import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Batch, Order } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import QuantitySelector from '../components/QuantitySelector'
import ShareButton from '../components/ShareButton'
import { BatchStatusBadge, BatchFill, BatchTimeline } from '../components/BatchStatus'
import { ORDER_STATUS, formatKg, formatKr, isOpenForOrders, statusInfo } from '../utils/batchStatus'
import { CheckIcon } from '../components/Icons'
import BatchGallery from '../components/BatchGallery'
import { PickupLocationList, PickupLocationPicker } from '../components/PickupLocations'
import './BatchDetailPage.css'

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(0)
  const [existingOrder, setExistingOrder] = useState<Order | null>(null)
  const [processing, setProcessing] = useState(false)
  const [inWaitingList, setInWaitingList] = useState(false)
  const [pickupId, setPickupId] = useState('')
  const { session, logout } = useAuth()

  useEffect(() => {
    if (!id) return
    loadBatch()
  }, [id])

  useEffect(() => {
    if (batch && session) {
      loadExistingOrder()
      checkWaitingList()
    }
  }, [batch, session])

  async function loadBatch() {
    try {
      const data = await mockApi.getBatchById(id!)
      setBatch(data)
      // Kun ét sted: vælg det automatisk
      if (data?.pickupLocations?.length === 1) setPickupId(data.pickupLocations[0].id)
    } finally {
      setLoading(false)
    }
  }

  async function loadExistingOrder() {
    const order = await mockApi.getOrderByBatchAndUser(id!, session!.email)
    if (order) {
      setExistingOrder(order)
      setQuantity(order.kilos)
      if (order.pickupLocationId) setPickupId(order.pickupLocationId)
    }
  }

  async function checkWaitingList() {
    const inList = await mockApi.isInWaitingList(id!, session!.email)
    setInWaitingList(inList)
  }

  const needsPickup = (batch?.pickupLocations?.length ?? 0) > 0

  async function handlePlaceOrder() {
    if (!batch || !session || quantity === 0) return
    if (needsPickup && !pickupId) return

    setProcessing(true)
    try {
      const order = await mockApi.createOrder(batch.id, session.email, quantity, pickupId || undefined)
      setExistingOrder(order)
      navigate(`/checkout/${batch.id}`)
    } catch (err) {
      alert('Bestillingen kunne ikke gennemføres: ' + (err instanceof Error ? err.message : 'Ukendt fejl'))
    } finally {
      setProcessing(false)
    }
  }

  async function handleJoinWaitingList() {
    if (!batch || !session) return

    try {
      await mockApi.addToWaitingList(batch.id, session.email)
      setInWaitingList(true)
      alert('Du er skrevet op på ventelisten. Vi giver besked, hvis der bliver plads.')
    } catch (err) {
      alert('Du kunne ikke skrives op på ventelisten. Prøv igen.')
    }
  }

  if (loading) return <div><Header onLogout={logout} /><p style={{ padding: '40px' }}>Indlæser…</p></div>
  if (!batch) return <div><Header onLogout={logout} /><p style={{ padding: '40px' }}>Batchen blev ikke fundet</p></div>

  const available = Math.max(0, batch.targetKilos - batch.soldKilos)
  const orderTotal = quantity * batch.pricePerKg
  const isFull = available === 0
  const open = isOpenForOrders(batch)
  const locations = batch.pickupLocations ?? []

  return (
    <div className="batch-detail-page">
      <Header onLogout={logout} />

      <main className="batch-detail-content">
        <div className="batch-detail-header">
          <div className="batch-detail-info">
            <BatchGallery images={batch.images} />

            <div className="batch-number-row">
              <span className="batch-number">Batch {batch.name}</span>
              <BatchStatusBadge status={batch.status} />
            </div>
            <h1>{batch.meatType}</h1>
            <p className="batch-description">{batch.description}</p>

            {batch.origin && (
              <div className="batch-origin">
                <div className="origin-item">
                  <strong>Gård:</strong> {batch.origin.farm}
                </div>
                <div className="origin-item">
                  <strong>Region:</strong> {batch.origin.region}, {batch.origin.country}
                </div>
                <div className="origin-item">
                  <strong>Koordinater:</strong> {batch.origin.coords}
                </div>
              </div>
            )}

            <section className="batch-pickup">
              <h2>Afhentningssteder</h2>
              <PickupLocationList locations={locations} highlightId={existingOrder?.pickupLocationId} />
            </section>

            <div className="batch-pricing">
              <div className="price-compare">
                <div className="price-item">
                  <span className="label">Gaucho-pris</span>
                  <span className="value">{formatKr(batch.pricePerKg)}/kg</span>
                </div>
                {batch.compareRetailer && (
                  <div className="price-item compare">
                    <span className="label">Pris hos {batch.compareRetailer}</span>
                    <span className="value">{formatKr(batch.comparePricePerKg ?? 0)}/kg</span>
                  </div>
                )}
              </div>
              {batch.savingsPercent && (
                <div className="savings">
                  Spar <strong>{batch.savingsPercent} %</strong> i forhold til butikspris
                </div>
              )}
            </div>

            <BatchFill batch={batch} />

            <BatchTimeline batch={batch} />
          </div>
        </div>

        <div className="batch-purchase-section">
          {!session ? (
            <div className="login-prompt">
              <p>{open ? 'Log ind for at bestille' : 'Log ind for at se dine bestillinger'}</p>
              <Link to="/login" className="btn btn-primary">Log ind</Link>
            </div>
          ) : !open ? (
            <div className="batch-closed-section">
              <h2>Lukket for bestilling</h2>
              <p>
                Batchen er {statusInfo(batch.status).label.toLowerCase()}, så der kan ikke længere bestilles fra den.
                {' '}Se de andre batches for at bestille.
              </p>
              {existingOrder && (
                <div className="existing-order-info">
                  <p>Din bestilling: <strong>{formatKg(existingOrder.kilos)}</strong> · {ORDER_STATUS[existingOrder.status]}</p>
                  {existingOrder.status === 'PAID' && (
                    <Link to={`/tracking/${batch.id}`} className="btn btn-primary">Følg forsendelsen</Link>
                  )}
                </div>
              )}
              <Link to="/batches" className="btn btn-secondary">Se alle batches</Link>
            </div>
          ) : isFull && !existingOrder ? (
            <div className="batch-full-section">
              <h2>Batchen er fyldt</h2>
              <p>Skriv dig op på ventelisten, så giver vi besked, hvis der bliver plads.</p>
              {!inWaitingList ? (
                <button onClick={handleJoinWaitingList} className="btn btn-primary">
                  Skriv mig på ventelisten
                </button>
              ) : (
                <p className="waiting-list-status"><CheckIcon /> Du står på ventelisten</p>
              )}
            </div>
          ) : (
            <div className="purchase-form">
              <h2>Bestil</h2>

              {existingOrder && (
                <div className="existing-order-info">
                  <p>Du har allerede bestilt fra denne batch: <strong>{formatKg(existingOrder.kilos)}</strong></p>
                  <p>Status: <strong>{ORDER_STATUS[existingOrder.status]}</strong></p>
                </div>
              )}

              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={available}
                presets={[1, 2, 3, 5, 10]}
              />

              {locations.length > 0 && (
                <PickupLocationPicker locations={locations} value={pickupId} onChange={setPickupId} />
              )}

              <ShareButton batchId={batch.id} batchName={batch.name} meatType={batch.meatType} />

              {quantity > 0 && (
                <div className="order-summary">
                  <div className="summary-row">
                    <span>{formatKg(quantity)} × {formatKr(batch.pricePerKg)}/kg</span>
                    <span className="amount">{formatKr(orderTotal)}</span>
                  </div>
                  {batch.savingsPercent && (
                    <div className="summary-row savings">
                      <span>Anslået besparelse</span>
                      <span className="amount">ca. {formatKr(Math.round((quantity * batch.pricePerKg * batch.savingsPercent) / 100))}</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>I alt</span>
                    <span className="amount">{formatKr(orderTotal)}</span>
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary btn-large"
                onClick={handlePlaceOrder}
                disabled={processing || quantity === 0 || (needsPickup && !pickupId)}
              >
                {processing ? 'Behandler…' : existingOrder ? 'Opdater bestilling og gå til betaling' : 'Gå til betaling'}
              </button>

              {quantity > 0 && needsPickup && !pickupId && (
                <p className="pickup-hint">Vælg et afhentningssted for at fortsætte</p>
              )}

              <div className="available-info">
                {formatKg(available)} tilbage · {batch.customerCount} kunder har bestilt
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
