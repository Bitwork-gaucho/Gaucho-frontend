import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Batch, Order } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import './AdminPaymentOverview.css'
import { formatKr } from '../utils/batchStatus'

export default function AdminPaymentOverview() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!batchId) return
    loadData()
  }, [batchId])

  async function loadData() {
    try {
      const [batchData, ordersData] = await Promise.all([
        mockApi.getBatchById(batchId!),
        mockApi.getAllOrders()
      ])
      setBatch(batchData)
      setAllOrders(ordersData.filter(o => o.batchId === batchId))
    } finally {
      setLoading(false)
    }
  }

  const paidOrders = allOrders.filter(o => o.status === 'PAID')
  const pendingOrders = allOrders.filter(o => o.status === 'PENDING')
  const cancelledOrders = allOrders.filter(o => o.status === 'CANCELLED')

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0)
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.amount, 0)

  const handleRefund = async (orderId: string) => {
    if (!window.confirm('Vil du refundere denne ordre?')) return
    try {
      const result = await mockApi.issueRefund(orderId)
      if (result.success) {
        alert(`Refunderet: ${formatKr(result.amount)}`)
        await loadData()
      }
    } catch (err) {
      alert('Refunderingen mislykkedes')
    }
  }

  const handleBulkRefund = async () => {
    const selected = allOrders.filter(o => o.status === 'PAID').map(o => o.id)
    if (!selected.length || !window.confirm(`Vil du refundere ${selected.length} ordrer?`)) return

    try {
      const result = await mockApi.bulkRefund(selected)
      if (result.success) {
        alert(`${result.refundedCount} ordrer refunderet – ${formatKr(result.totalAmount)} i alt`)
        await loadData()
      }
    } catch (err) {
      alert('Refunderingerne mislykkedes')
    }
  }

  if (loading) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Indlæser betalinger…</p>
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
          <button onClick={() => navigate('/admin')} className="btn btn-primary">Tilbage til admin</button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-payment-overview">
      <Header onLogout={logout} />

      <main className="admin-content">
        <div className="admin-container">
          <div className="header-row">
            <h1>Betalinger – {batch.name}</h1>
            <button onClick={() => navigate(`/admin/batch/${batch.id}`)} className="btn btn-outline">
              ← Tilbage til batch
            </button>
          </div>

          <div className="summary-section">
            <div className="summary-card">
              <h3>Omsætning</h3>
              <div className="summary-item">
                <span>Betalte ordrer</span>
                <span className="amount">{formatKr(totalRevenue)}</span>
              </div>
              <div className="summary-item">
                <span>Afventer betaling</span>
                <span className="amount pending">{formatKr(pendingRevenue)}</span>
              </div>
              <div className="summary-item total">
                <span>Forventet i alt</span>
                <span className="amount">{formatKr(totalRevenue + pendingRevenue)}</span>
              </div>
            </div>

            <div className="summary-card">
              <h3>Ordrer</h3>
              <div className="summary-item">
                <span>Betalt</span>
                <span className="count">{paidOrders.length}</span>
              </div>
              <div className="summary-item">
                <span>Afventer betaling</span>
                <span className="count">{pendingOrders.length}</span>
              </div>
              <div className="summary-item">
                <span>Annulleret</span>
                <span className="count">{cancelledOrders.length}</span>
              </div>
            </div>
          </div>

          <div className="orders-section">
            <div className="section-header">
              <h2>Betalte ordrer ({paidOrders.length})</h2>
              {paidOrders.length > 0 && (
                <button onClick={handleBulkRefund} className="btn btn-secondary">
                  Refundér alle
                </button>
              )}
            </div>

            {paidOrders.length > 0 ? (
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>E-mail</th>
                      <th>Kilo</th>
                      <th>Beløb</th>
                      <th>Kvitteringsnr.</th>
                      <th>Handlinger</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paidOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.userEmail}</td>
                        <td>{order.kilos} kg</td>
                        <td className="amount">{formatKr(order.amount)}</td>
                        <td><code>{order.receiptId?.substring(0, 8)}...</code></td>
                        <td>
                          <button
                            onClick={() => handleRefund(order.id)}
                            className="action-link"
                          >
                            Refundér
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">Ingen betalte ordrer endnu</div>
            )}
          </div>

          {pendingOrders.length > 0 && (
            <div className="orders-section">
              <h2>Afventer betaling ({pendingOrders.length})</h2>
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>E-mail</th>
                      <th>Kilo</th>
                      <th>Beløb</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.userEmail}</td>
                        <td>{order.kilos} kg</td>
                        <td className="amount">{formatKr(order.amount)}</td>
                        <td><span className="badge pending">Afventer betaling</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {cancelledOrders.length > 0 && (
            <div className="orders-section">
              <h2>Annullerede ordrer ({cancelledOrders.length})</h2>
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>E-mail</th>
                      <th>Kilo</th>
                      <th>Beløb</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cancelledOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.userEmail}</td>
                        <td>{order.kilos} kg</td>
                        <td className="amount">{formatKr(order.amount)}</td>
                        <td><span className="badge cancelled">Annulleret</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
