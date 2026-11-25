import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Batch } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import { BatchStatusBadge, BatchFill } from '../components/BatchStatus'
import { formatKr } from '../utils/batchStatus'
import { BatchCover } from '../components/BatchGallery'

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
        <h1>Alle batches</h1>
        {loading ? <p>Indlæser…</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {batches.map(batch => (
              <Link key={batch.id} to={`/batch/${batch.id}`} style={{ textDecoration: 'none', color: 'inherit', padding: '20px', border: '1px solid var(--rule)', borderRadius: '8px' }}>
                <BatchCover images={batch.images} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Batch {batch.name}</span>
                  <BatchStatusBadge status={batch.status} />
                </div>
                <h3>{batch.meatType}</h3>
                <p style={{ margin: '8px 0 16px' }}>{formatKr(batch.pricePerKg)}/kg</p>
                <BatchFill batch={batch} compact />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
