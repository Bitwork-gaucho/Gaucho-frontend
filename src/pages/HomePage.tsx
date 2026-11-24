import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Batch } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import { ChevronRightIcon } from '../components/Icons'
import { BatchStatusBadge, BatchFill } from '../components/BatchStatus'
import { formatKr } from '../utils/batchStatus'
import './HomePage.css'

export default function HomePage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const { session, logout } = useAuth()

  useEffect(() => {
    loadBatches()
  }, [])

  async function loadBatches() {
    try {
      const data = await mockApi.getBatches()
      setBatches(data)
    } catch (err) {
      console.error('Kunne ikke hente batches:', err)
    } finally {
      setLoading(false)
    }
  }

  const activeBatch = batches.find(b => b.status === 'WAITING_TO_FILL')

  return (
    <div className="home-page">
      <Header onLogout={logout} />

      <main className="home-content">
        <section className="hero">
          <div className="hero-left">
            <h1>Argentinsk oksekød, sendt direkte til dit afhentningssted.</h1>
            <p>Dybfrossent græsfodret oksekød fra pampaen. Samles i fælles batches og sendes til Danmark, ca. 6 uger. Den halve pris.</p>
          </div>
          <div className="hero-right">
            <img src={`${import.meta.env.BASE_URL}steak-hero.png`} alt="Græsfodret oksekød fra Argentina" style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius)', objectFit: 'cover' }} />
          </div>
        </section>

        <section className="active-batch">
          {activeBatch && (
            <div className="batch-card-featured">
              <div className="batch-info">
                <div className="batch-label-row">
                  <span className="batch-label">Batch {activeBatch.name}</span>
                  <BatchStatusBadge status={activeBatch.status} />
                </div>
                <h2>{activeBatch.meatType}</h2>
                <p className="batch-description">{activeBatch.description}</p>
                <div className="batch-meta">
                  <span className="price">{formatKr(activeBatch.pricePerKg)}/kg</span>
                </div>
                <BatchFill batch={activeBatch} />
              </div>
              <Link to={`/batch/${activeBatch.id}`} className="btn btn-primary">
                Køb nu <ChevronRightIcon />
              </Link>
            </div>
          )}
        </section>

        <section className="info-grid">
          <div className="info-card">
            <h3>Om Gaucho — fra pampaen</h3>
            <p>Vi importerer dybfrossent oksekød direkte fra Argentina og leverer det til afhentningssteder rundt i landet.</p>
          </div>
          <div className="info-card">
            <h3>Miljø & oprindelse</h3>
            <p>Alt vores kød kommer fra græsfodrede kvæg på store arealer i Argentina. Dyrevelfærd og bæredygtighed er højt prioriteret.</p>
          </div>
          <div className="info-card">
            <h3>Sådan virker det</h3>
            <p>Se et batch, vælg hvor meget du vil have, betal online, og hent dit kød på den planlagte afhentningsdag.</p>
          </div>
        </section>

        <section className="batches-section">
          <h2>Alle tilgængelige batches</h2>
          {loading ? (
            <p>Indlæser…</p>
          ) : (
            <div className="batch-grid">
              {batches.map(batch => (
                <Link to={`/batch/${batch.id}`} key={batch.id} className="batch-card">
                  <div className="batch-header">
                    <span className="batch-id">Batch {batch.name}</span>
                    <BatchStatusBadge status={batch.status} />
                  </div>
                  <h3>{batch.meatType}</h3>
                  <p className="batch-desc">{batch.description}</p>
                  <BatchFill batch={batch} compact />
                  <div className="batch-footer">
                    <span className="price">{formatKr(batch.pricePerKg)}/kg</span>
                    <span className="batch-cta">{batch.status === 'WAITING_TO_FILL' ? 'Se og bestil →' : 'Se status →'}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
