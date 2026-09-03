import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Batch, Order } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import './AdminPaymentOverview.css'

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
    if (!window.confirm('Issue refund for this order?')) return
    try {
      const result = await mockApi.issueRefund(orderId)
      if (result.success) {
        alert(`Refund issued: ${result.amount} kr.`)
        await loadData()
      }
    } catch (err) {
      alert('Failed to issue refund')
    }
  }

  const handleBulkRefund = async () => {
    const selected = allOrders.filter(o => o.status === 'PAID').map(o => o.id)
    if (!selected.length || !window.confirm(`Issue refunds for ${selected.length} orders?`)) return

    try {
      const result = await mockApi.bulkRefund(selected)
      if (result.success) {
        alert(`${result.refundedCount} refunds issued - ${result.totalAmount} kr. total`)
        await loadData()
      }
    } catch (err) {
      alert('Failed to issue bulk refunds')
    }
  }

  if (loading) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading payment data...</p>
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
          <button onClick={() => navigate('/admin')} className="btn btn-primary">Back to Admin</button>
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
            <h1>Payment Overview - {batch.name}</h1>
            <button onClick={() => navigate(`/admin/batch/${batch.id}`)} className="btn btn-outline">
              ← Back to Batch
            </button>
          </div>

          <div className="summary-section">
            <div className="summary-card">
              <h3>Revenue Summary</h3>
              <div className="summary-item">
                <span>Paid Orders</span>
                <span className="amount">{totalRevenue} kr.</span>
              </div>
              <div className="summary-item">
                <span>Pending Orders</span>
                <span className="amount pending">{pendingRevenue} kr.</span>
              </div>
              <div className="summary-item total">
                <span>Projected Total</span>
                <span className="amount">{totalRevenue + pendingRevenue} kr.</span>
              </div>
            </div>

            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-item">
                <span>Paid</span>
                <span className="count">{paidOrders.length}</span>
              </div>
              <div className="summary-item">
                <span>Pending</span>
                <span className="count">{pendingOrders.length}</span>
              </div>
              <div className="summary-item">
                <span>Cancelled</span>
                <span className="count">{cancelledOrders.length}</span>
              </div>
            </div>
          </div>

          <div className="orders-section">
            <div className="section-header">
              <h2>Paid Orders ({paidOrders.length})</h2>
              {paidOrders.length > 0 && (
                <button onClick={handleBulkRefund} className="btn btn-secondary">
                  Issue All Refunds
                </button>
              )}
            </div>

            {paidOrders.length > 0 ? (
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Kilos</th>
                      <th>Amount</th>
                      <th>Receipt ID</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paidOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.userEmail}</td>
                        <td>{order.kilos} kg</td>
                        <td className="amount">{order.amount} kr.</td>
                        <td><code>{order.receiptId?.substring(0, 8)}...</code></td>
                        <td>
                          <button
                            onClick={() => handleRefund(order.id)}
                            className="action-link"
                          >
                            Refund
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">No paid orders yet</div>
            )}
          </div>

          {pendingOrders.length > 0 && (
            <div className="orders-section">
              <h2>Pending Orders ({pendingOrders.length})</h2>
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Kilos</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.userEmail}</td>
                        <td>{order.kilos} kg</td>
                        <td className="amount">{order.amount} kr.</td>
                        <td><span className="badge pending">Pending Payment</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {cancelledOrders.length > 0 && (
            <div className="orders-section">
              <h2>Cancelled Orders ({cancelledOrders.length})</h2>
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Kilos</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cancelledOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.userEmail}</td>
                        <td>{order.kilos} kg</td>
                        <td className="amount">{order.amount} kr.</td>
                        <td><span className="badge cancelled">Cancelled</span></td>
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
