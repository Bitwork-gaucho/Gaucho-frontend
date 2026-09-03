import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Batch } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const { logout } = useAuth()

  useEffect(() => {
    loadBatches()
  }, [])

  async function loadBatches() {
    try {
      const data = await mockApi.getBatches()
      setBatches(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header onLogout={logout} />
      <div style={{ padding: '40px 20px' }}>
        <h1>All Batches</h1>
        {loading ? <p>Loading...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {batches.map(batch => (
              <Link key={batch.id} to={`/batch/${batch.id}`} style={{ textDecoration: 'none', color: 'inherit', padding: '20px', border: '1px solid var(--rule)', borderRadius: '8px' }}>
                <h3>{batch.meatType}</h3>
                <p>{batch.pricePerKg} kr./kg</p>
                <p>{Math.round((batch.soldKilos / batch.targetKilos) * 100)}%</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
