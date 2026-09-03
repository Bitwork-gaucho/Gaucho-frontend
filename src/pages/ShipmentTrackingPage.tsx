import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Batch, Shipment } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import ProgressBar from '../components/ProgressBar'
import './ShipmentTrackingPage.css'

const STATUS_TIMELINE = [
  { status: 'WAITING_TO_FILL', label: 'Waiting to Fill', icon: '⏳' },
  { status: 'ORDERED', label: 'Ordered', icon: '✓' },
  { status: 'IN_TRANSIT', label: 'In Transit', icon: '📦' },
  { status: 'AT_CUSTOMS', label: 'At Customs', icon: '📋' },
  { status: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: '✓' }
]

export default function ShipmentTrackingPage() {
  const { batchId } = useParams<{ batchId: string }>()
  const { session, logout } = useAuth()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!batchId) return
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [batchId])

  async function loadData() {
    try {
      const batchData = await mockApi.getBatchById(batchId!)
      setBatch(batchData)

      if (batchData?.shipmentId) {
        const shipmentData = await mockApi.getShipmentStatus(batchData.shipmentId)
        setShipment(shipmentData)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading tracking information...</p>
        </div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Batch not found</p>
        </div>
      </div>
    )
  }

  const currentStatusIndex = STATUS_TIMELINE.findIndex(s => s.status === batch.status)
  const progress = ((currentStatusIndex + 1) / STATUS_TIMELINE.length) * 100

  return (
    <div className="tracking-page">
      <Header onLogout={logout} />

      <main className="tracking-content">
        <div className="tracking-container">
          <h1>Shipment Tracking</h1>
          <p className="batch-title">{batch.name} - {batch.meatType}</p>

          <div className="tracking-layout">
            <div className="timeline-section">
              <h2>Order Status</h2>
              <ProgressBar
                current={currentStatusIndex + 1}
                target={STATUS_TIMELINE.length}
                label="Progress to Delivery"
                showPercentage={true}
              />

              <div className="timeline">
                {STATUS_TIMELINE.map((step, index) => {
                  const isActive = index <= currentStatusIndex
                  const isCurrent = index === currentStatusIndex

                  return (
                    <div key={step.status} className={`timeline-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="step-icon">{step.icon}</div>
                      <div className="step-content">
                        <h3>{step.label}</h3>
                        {isCurrent && batch.status === 'IN_TRANSIT' && (
                          <p className="step-detail">Estimated arrival in 5-7 days</p>
                        )}
                        {isCurrent && batch.status === 'AT_CUSTOMS' && (
                          <p className="step-detail">Expected clearance in 1-3 days</p>
                        )}
                        {isCurrent && batch.status === 'READY_FOR_PICKUP' && (
                          <p className="step-detail">Available now! {batch.pickupTimeWindow && `${batch.pickupTimeWindow.start} - ${batch.pickupTimeWindow.end}`}</p>
                        )}
                      </div>
                      {index < STATUS_TIMELINE.length - 1 && <div className={`step-line ${isActive ? 'active' : ''}`} />}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="details-section">
              <h2>Shipment Details</h2>

              {shipment ? (
                <div className="details-card">
                  <div className="detail-item">
                    <span className="label">Status</span>
                    <span className="value">{shipment.status}</span>
                  </div>
                  {shipment.supplierName && (
                    <div className="detail-item">
                      <span className="label">Supplier</span>
                      <span className="value">{shipment.supplierName}</span>
                    </div>
                  )}
                  {shipment.logisticsCompany && (
                    <div className="detail-item">
                      <span className="label">Logistics</span>
                      <span className="value">{shipment.logisticsCompany}</span>
                    </div>
                  )}
                  {shipment.containerNumber && (
                    <div className="detail-item">
                      <span className="label">Container</span>
                      <span className="value">{shipment.containerNumber}</span>
                    </div>
                  )}
                  {shipment.eta && (
                    <div className="detail-item">
                      <span className="label">ETA</span>
                      <span className="value">{new Date(shipment.eta).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="details-card">
                  <p className="empty-state">Shipment details will appear once the batch is ordered.</p>
                </div>
              )}

              <h2>Batch Information</h2>
              <div className="details-card">
                <div className="detail-item">
                  <span className="label">Batch Name</span>
                  <span className="value">{batch.name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Meat Type</span>
                  <span className="value">{batch.meatType}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Sold / Target</span>
                  <span className="value">{batch.soldKilos} / {batch.targetKilos} kg</span>
                </div>
                <div className="detail-item">
                  <span className="label">Price per kg</span>
                  <span className="value">{batch.pricePerKg} kr./kg</span>
                </div>
                {batch.pickupLocation && (
                  <div className="detail-item">
                    <span className="label">Pickup Location</span>
                    <span className="value">{batch.pickupLocation}</span>
                  </div>
                )}
              </div>

              <div className="help-section">
                <h3>Questions?</h3>
                <p>Contact us at support@gaucho.dk or check our <a href="#help">Help Center</a></p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
