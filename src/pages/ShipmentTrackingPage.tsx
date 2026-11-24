import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Batch, Shipment } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import { BatchTimeline } from '../components/BatchStatus'
import { SHIPMENT_STATUS, formatDate, formatKg, formatKr } from '../utils/batchStatus'
import './ShipmentTrackingPage.css'

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
          <p>Indlæser forsendelsesoplysninger…</p>
        </div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Batchen blev ikke fundet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tracking-page">
      <Header onLogout={logout} />

      <main className="tracking-content">
        <div className="tracking-container">
          <h1>Følg forsendelsen</h1>
          <p className="batch-title">Batch {batch.name} – {batch.meatType}</p>

          <div className="tracking-layout">
            <div className="timeline-section">
              <h2>Status</h2>
              <BatchTimeline batch={batch} />
            </div>

            <div className="details-section">
              <h2>Forsendelse</h2>

              {shipment ? (
                <div className="details-card">
                  <div className="detail-item">
                    <span className="label">Status</span>
                    <span className="value">{SHIPMENT_STATUS[shipment.status] ?? shipment.status}</span>
                  </div>
                  {shipment.supplierName && (
                    <div className="detail-item">
                      <span className="label">Leverandør</span>
                      <span className="value">{shipment.supplierName}</span>
                    </div>
                  )}
                  {shipment.logisticsCompany && (
                    <div className="detail-item">
                      <span className="label">Fragtfirma</span>
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
                      <span className="label">Forventet ankomst</span>
                      <span className="value">{formatDate(shipment.eta)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="details-card">
                  <p className="empty-state">Oplysninger om forsendelsen vises, når kødet er sendt afsted.</p>
                </div>
              )}

              <h2>Batch</h2>
              <div className="details-card">
                <div className="detail-item">
                  <span className="label">Batchnavn</span>
                  <span className="value">{batch.name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Kødtype</span>
                  <span className="value">{batch.meatType}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Solgt</span>
                  <span className="value">{formatKg(batch.soldKilos)} af {formatKg(batch.targetKilos)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Pris pr. kg</span>
                  <span className="value">{formatKr(batch.pricePerKg)}/kg</span>
                </div>
                {batch.pickupLocation && (
                  <div className="detail-item">
                    <span className="label">Afhentningssted</span>
                    <span className="value">{batch.pickupLocation}</span>
                  </div>
                )}
              </div>

              <div className="help-section">
                <h3>Spørgsmål?</h3>
                <p>Skriv til os på support@gaucho.dk eller se vores <a href="#help">hjælpecenter</a></p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
