import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Batch, Order } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import QuantitySelector from '../components/QuantitySelector'
import ShareButton from '../components/ShareButton'
import ProgressBar from '../components/ProgressBar'
import { CheckIcon } from '../components/Icons'
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
    } finally {
      setLoading(false)
    }
  }

  async function loadExistingOrder() {
    const order = await mockApi.getOrderByBatchAndUser(id!, session!.email)
    if (order) {
      setExistingOrder(order)
      setQuantity(order.kilos)
    }
  }

  async function checkWaitingList() {
    const inList = await mockApi.isInWaitingList(id!, session!.email)
    setInWaitingList(inList)
  }

  async function handlePlaceOrder() {
    if (!batch || !session || quantity === 0) return

    setProcessing(true)
    try {
      const order = await mockApi.createOrder(batch.id, session.email, quantity)
      setExistingOrder(order)
      navigate(`/checkout/${batch.id}`)
    } catch (err) {
      alert('Failed to place order: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setProcessing(false)
    }
  }

  async function handleJoinWaitingList() {
    if (!batch || !session) return

    try {
      await mockApi.addToWaitingList(batch.id, session.email)
      setInWaitingList(true)
      alert('You\'ve been added to the waiting list. We\'ll notify you when a slot opens up.')
    } catch (err) {
      alert('Failed to join waiting list')
    }
  }

  if (loading) return <div><Header onLogout={logout} /><p style={{ padding: '40px' }}>Loading...</p></div>
  if (!batch) return <div><Header onLogout={logout} /><p style={{ padding: '40px' }}>Batch not found</p></div>

  const available = Math.max(0, batch.targetKilos - batch.soldKilos)
  const orderTotal = quantity * batch.pricePerKg
  const isFull = available === 0

  return (
    <div className="batch-detail-page">
      <Header onLogout={logout} />

      <main className="batch-detail-content">
        <div className="batch-detail-header">
          <div className="batch-detail-info">
            <span className="batch-number">{batch.name}</span>
            <h1>{batch.meatType}</h1>
            <p className="batch-description">{batch.description}</p>

            <div className="batch-origin">
              <div className="origin-item">
                <strong>Farm:</strong> {batch.origin.farm}
              </div>
              <div className="origin-item">
                <strong>Region:</strong> {batch.origin.region}, {batch.origin.country}
              </div>
              <div className="origin-item">
                <strong>Coords:</strong> {batch.origin.coords}
              </div>
            </div>

            <div className="batch-pricing">
              <div className="price-compare">
                <div className="price-item">
                  <span className="label">Gaucho Price</span>
                  <span className="value">{batch.pricePerKg} kr./kg</span>
                </div>
                {batch.compareRetailer && (
                  <div className="price-item compare">
                    <span className="label">{batch.compareRetailer} Price</span>
                    <span className="value">{batch.comparePricePerKg} kr./kg</span>
                  </div>
                )}
              </div>
              {batch.savingsPercent && (
                <div className="savings">
                  Save <strong>{batch.savingsPercent}%</strong> compared to retail
                </div>
              )}
            </div>

            <ProgressBar
              current={batch.soldKilos}
              target={batch.targetKilos}
              label="Batch Fill Progress"
              showPercentage={true}
            />

            <div className="batch-status">Status: <strong>{batch.status}</strong></div>
          </div>
        </div>

        <div className="batch-purchase-section">
          {!session ? (
            <div className="login-prompt">
              <p>Log in to place an order</p>
              <a href="/login" className="btn btn-primary">Log In</a>
            </div>
          ) : isFull && !existingOrder ? (
            <div className="batch-full-section">
              <h2>This Batch is Full!</h2>
              <p>Join the waiting list to get notified when a slot opens up.</p>
              {!inWaitingList ? (
                <button onClick={handleJoinWaitingList} className="btn btn-primary">
                  Join Waiting List
                </button>
              ) : (
                <p className="waiting-list-status"><CheckIcon /> You're on the waiting list</p>
              )}
            </div>
          ) : (
            <div className="purchase-form">
              <h2>Place Your Order</h2>

              {existingOrder && (
                <div className="existing-order-info">
                  <p>You already have an order for this batch: <strong>{existingOrder.kilos} kg</strong></p>
                  <p>Status: <strong>{existingOrder.status}</strong></p>
                </div>
              )}

              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={available}
                presets={[1, 2, 3, 5, 10]}
              />

              <ShareButton batchId={batch.id} batchName={batch.name} meatType={batch.meatType} />

              {quantity > 0 && (
                <div className="order-summary">
                  <div className="summary-row">
                    <span>{quantity} kg × {batch.pricePerKg} kr./kg</span>
                    <span className="amount">{orderTotal} kr.</span>
                  </div>
                  {batch.savingsPercent && (
                    <div className="summary-row savings">
                      <span>Est. Savings</span>
                      <span className="amount">~{Math.round((quantity * batch.pricePerKg * batch.savingsPercent) / 100)} kr.</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>Total</span>
                    <span className="amount">{orderTotal} kr.</span>
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary btn-large"
                onClick={handlePlaceOrder}
                disabled={processing || quantity === 0}
              >
                {processing ? 'Processing...' : existingOrder ? 'Update Order & Checkout' : 'Proceed to Checkout'}
              </button>

              <div className="available-info">
                {available} kg available • {batch.customerCount} customers
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
