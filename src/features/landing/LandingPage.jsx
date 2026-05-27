import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { batchService } from '../../services'
import './LandingPage.css'

function Logo({ size = 22 }) {
  const wordmarkSize = size === 22 ? 26 : 30
  return (
    <Link className="logo" to="/">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M16 4 C9 4 4 9 4 16 C4 23 9 28 16 28 C20 28 23 26 25 24 L25 17 L17 17"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="square"
          fill="none"
        />
        <circle cx="16" cy="16" r="1.6" fill="var(--accent)" />
      </svg>
      <span className="logo-wordmark" style={{ fontSize: wordmarkSize }}>
        Gaucho<em>.</em>
      </span>
    </Link>
  )
}

function ArrowIcon() {
  return (
    <svg width="22" height="10" viewBox="0 0 22 10" fill="none" aria-hidden="true">
      <path d="M0 5 H20 M16 1 L20 5 L16 9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function PulseDot() {
  return <span className="pulse-dot" />
}

function SectionMark({ num, label }) {
  return (
    <div className="section-mark">
      <span className="num">§ {num}</span>
      <span className="rule" />
      <span>{label}</span>
    </div>
  )
}

function BatchSkeleton() {
  return (
    <div className="batch-skeleton">
      <div className="skeleton-line" style={{ height: 14, width: '40%' }} />
      <div className="skeleton-line" style={{ height: 28, marginTop: 10 }} />
      <div className="skeleton-line" style={{ height: 14, width: '70%', marginTop: 8 }} />
      <div className="skeleton-line" style={{ height: 8, marginTop: 20 }} />
    </div>
  )
}

function BatchCard({ batch }) {
  const fillPct = Math.round((batch.soldKilos / batch.targetKilos) * 100)
  const [meatBase, meatSub] = batch.meatType.split(', ')

  return (
    <div className="batch-card">
      <div className="batch-card-header">
        <span>{batch.name}</span>
        <span className="batch-status">
          <PulseDot />
          Fyldes
        </span>
      </div>
      <div className="batch-card-body">
        <div className="batch-title">
          {meatBase}, <em>{meatSub}</em>
        </div>
        <div className="batch-origin">{batch.description}</div>

        <div className="progress-wrap">
          <div className="progress-meta">
            <span>
              <span className="progress-count">{batch.soldKilos}</span> / {batch.targetKilos} kg
            </span>
            <span>{fillPct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${fillPct}%` }} />
            <div className="progress-tick" style={{ left: '25%' }} />
            <div className="progress-tick" style={{ left: '50%' }} />
            <div className="progress-tick" style={{ left: '75%' }} />
          </div>
          <div className="progress-label">
            <strong>{batch.customerCount} kunder</strong> er med. Afsendes ved 100 % — næste
            milepæl <strong>{batch.nextMilestonePercent} %</strong>.
          </div>
        </div>

        <div className="batch-footer">
          <div>
            <div className="price-from">Fra</div>
            <div className="price-main">
              {batch.pricePerKg}
              <span className="price-unit"> kr./kg</span>
            </div>
            <div className="price-compare">
              {batch.comparePricePerKg} kr./kg i {batch.compareRetailer}
            </div>
          </div>
          <button className="join-btn">
            Vær med
            <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [activeBatches, setActiveBatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    batchService.getActiveBatches().then(batches => {
      setActiveBatches(batches)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const handler = e => {
      if (e.key === 'p' || e.key === 'P') document.body.classList.toggle('pampas')
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const batch = activeBatches[0] || null
  const fillPct = batch ? Math.round((batch.soldKilos / batch.targetKilos) * 100) : 62

  return (
    <>
      <div className="stage-label">
        GAUCHO — <b>landing.mobile</b> · v1
      </div>

      <div className="phone-shell">
        <div className="page-root">

          {/* ── TOP BAR ── */}
          <header className="top-bar">
            <Logo size={22} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Link data-testid="nav-batches" to="/batches" className="batch-indicator">
                <PulseDot />
                Batch åben
              </Link>
              <button className="hamburger" aria-label="Menu">
                <span />
                <span />
              </button>
            </div>
          </header>

          {/* ── HERO ── */}
          <section className="hero">
            <div className="hero-image-wrap">
              <img
                className="hero-img"
                src="project/steak-hero.png"
                alt="Sizzling ribeye over glowing coals with Argentine pampas in the background"
              />
              <div className="hero-fade" />
              <div className="hero-coords">
                <span>{batch ? batch.origin.coords : '34.6°S · 64.3°W'}</span>
                <span>N° 001</span>
              </div>
            </div>

            <div className="hero-copy">
              <h1 className="hero-h1">
                Argentinsk oksekød,
                <br />
                sendt med hele
                <br />
                <em>containeren.</em>
              </h1>
              <p className="hero-lead">
                Vi samler bestillinger i fælles batches og sender dybfrossent, græsfodret oksekød
                fra pampaen til et afhentningssted nær dig. Seks uger. Den halve pris.
              </p>
            </div>

            <div className="hero-cta">
              <button
                data-testid="buy-now-btn"
                className="cta-btn"
                onClick={() => navigate('/batches/batch-001')}
              >
                <span>Køb nu</span>
                <span className="cta-meta">
                  {batch ? `${batch.name} · ${fillPct} %` : 'Batch 001 · 62 %'}
                  <ArrowIcon />
                </span>
              </button>
              <button
                data-testid="show-more-btn"
                className="cta-btn-secondary"
                onClick={() => navigate('/batches')}
              >
                Vis mig mere
                <ArrowIcon />
              </button>
            </div>

            <div className="metrics">
              <div className="metric">
                <div className="metric-key">Besparelse</div>
                <div className="metric-val">−{batch ? batch.savingsPercent : 48} %</div>
                <div className="metric-sub">mod {batch ? batch.compareRetailer : 'Føtex'}</div>
              </div>
              <div className="metric">
                <div className="metric-key">Afhentning</div>
                <div className="metric-val">{batch ? batch.deliveryWeeks : 6} uger</div>
                <div className="metric-sub">fra køb</div>
              </div>
              <div className="metric">
                <div className="metric-key">Oprindelse</div>
                <div className="metric-val">1 gård</div>
                <div className="metric-sub">pr. batch</div>
              </div>
            </div>
          </section>

          {/* ── LIVE BATCH ── */}
          <section className="live-batch">
            <SectionMark num="01" label="Åben nu" />
            {loading ? <BatchSkeleton /> : batch ? <BatchCard batch={batch} /> : null}
          </section>

          {/* ── GAUCHO CULTURE ── */}
          <section className="gaucho-section">
            <SectionMark num="02" label="Gauchoens arv" />
            <h2 className="section-h2">
              Fra <em>pampaen</em> til
              <br />
              dit middagsbord.
            </h2>
            <div className="gaucho-image-placeholder" />
            <div className="gaucho-text">
              <p>
                Gauchos er Argentinas svar på cowboys — nomadiske ryttere, der i generationer har
                drevet kvæg over de endeløse pampas. Deres liv er afstemt med naturen: tidlig
                morgen i sadlen, aftenen samlet om asadoen.
              </p>
              <p>
                Det er denne tradition og respekt for dyret, der afspejler sig i hvert stykke kød
                fra Gaucho. Kvæget vokser langsomt, græsser frit og lever et naturligt liv.
                Resultatet er smag, der taler for sig selv.
              </p>
            </div>
            <div className="gaucho-facts">
              <div className="gaucho-fact">
                <span className="fact-num">21</span>
                <span className="fact-label">dages tørmodning</span>
              </div>
              <div className="gaucho-fact">
                <span className="fact-num">100 %</span>
                <span className="fact-label">græsfodret</span>
              </div>
              <div className="gaucho-fact">
                <span className="fact-num">1</span>
                <span className="fact-label">gård pr. batch</span>
              </div>
            </div>
          </section>

          {/* ── ENVIRONMENTAL BENEFITS ── */}
          <section className="env-section">
            <SectionMark num="03" label="Bæredygtighed" />
            <h2 className="section-h2">
              Argentinsk <em>græs.</em>
              <br />
              Argentinsk sol.
            </h2>
            <div className="env-grid">
              <div className="env-card">
                <div className="env-icon">🌾</div>
                <div className="env-title">Naturlig græsning</div>
                <div className="env-desc">
                  Kvæget lever hele sit liv på åbne pampas og spiser udelukkende naturligt græs.
                  Ingen kraftfoder. Ingen stalde.
                </div>
              </div>
              <div className="env-card">
                <div className="env-icon">💧</div>
                <div className="env-title">Lavere vandaftryk</div>
                <div className="env-desc">
                  Argentinsk oksekød kræver markant mindre tilsat vand end konventionelt
                  kornfodret kvæg — pampaens regn klarer det.
                </div>
              </div>
              <div className="env-card">
                <div className="env-icon">🚢</div>
                <div className="env-title">Én container</div>
                <div className="env-desc">
                  Vi sender frosset kød samlet i én container. Fuld lastudnyttelse minimerer CO₂
                  pr. kg markant frem for mange små forsendelser.
                </div>
              </div>
              <div className="env-card">
                <div className="env-icon">🔬</div>
                <div className="env-title">Ingen antibiotika</div>
                <div className="env-desc">
                  Argentinsk oksekød eksporteret til EU er certificeret fri for hormoner og
                  unødvendig brug af antibiotika.
                </div>
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section className="how-section">
            <SectionMark num="04" label="Sådan virker det" />
            <h2 className="how-h2">
              Et <em>håndtryk</em>
              <br />
              på seks uger, mellem to kyster.
            </h2>
            <div className="steps">
              <div className="step">
                <div className="step-num">01</div>
                <div>
                  <div className="step-title">Vær med i et batch</div>
                  <div className="step-desc">
                    Køb fra blot 1 kg. Vi samler bestillinger, indtil batchet er fyldt.
                  </div>
                </div>
              </div>
              <div className="step">
                <div className="step-num">02</div>
                <div>
                  <div className="step-title">Vi sejler det op</div>
                  <div className="step-desc">
                    Én container forlader Buenos Aires med kurs mod København. Følg den på kortet.
                  </div>
                </div>
              </div>
              <div className="step">
                <div className="step-num">03</div>
                <div>
                  <div className="step-title">Hent det frosset</div>
                  <div className="step-desc">
                    Seks uger senere: tag en køletaske med til dit afhentningssted.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── MEAT HANDLING ── */}
          <section className="handling-section">
            <SectionMark num="05" label="Forberedelse" />
            <h2 className="section-h2">
              Optøning, opbevaring
              <br />& <em>tilberedning.</em>
            </h2>
            <div className="handling-grid">
              <div className="handling-item">
                <div className="handling-num">01</div>
                <div>
                  <div className="handling-title">Optø i køleskab</div>
                  <div className="handling-desc">
                    Flyt kødet fra fryseren til køleskabet 24–48 timer før tilberedning. Langsom
                    optøning giver det bedste resultat og bevarer saftighed og smag.
                  </div>
                </div>
              </div>
              <div className="handling-item">
                <div className="handling-num">02</div>
                <div>
                  <div className="handling-title">Gentag ikke frysning</div>
                  <div className="handling-desc">
                    Optøet kød må ikke nedfryses igen. Planlæg din tilberedning, så du bruger
                    kødet inden for 2–3 dage efter optøning.
                  </div>
                </div>
              </div>
              <div className="handling-item">
                <div className="handling-num">03</div>
                <div>
                  <div className="handling-title">Medbring køletaske</div>
                  <div className="handling-desc">
                    Medbring en isoleret køletaske eller kølekasse ved afhentning. Kødet holdes
                    frosset frem til levering.
                  </div>
                </div>
              </div>
              <div className="handling-item">
                <div className="handling-num">04</div>
                <div>
                  <div className="handling-title">Tilbered ved høj varme</div>
                  <div className="handling-desc">
                    Ribeye egner sig perfekt til grill eller pande ved høj varme. Krydr enkelt med
                    salt og peber — lad kødet tale for sig selv.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── FOOD AUTHORITY APPROVAL ── */}
          <section className="approval-section">
            <SectionMark num="06" label="Godkendt" />
            <div className="approval-card">
              <div className="approval-badge">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <path
                    d="M16 3L19.5 9.5L27 10.5L21.5 15.5L22.5 23L16 19.5L9.5 23L10.5 15.5L5 10.5L12.5 9.5L16 3Z"
                    stroke="var(--accent2)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M12 16L15 19L21 13"
                    stroke="var(--accent2)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="approval-title">Godkendt af Fødevarestyrelsen</h3>
                <p className="approval-desc">
                  Gaucho Meat er registreret som autoriseret fødevarevirksomhed i Danmark. Alle
                  importer sker i overensstemmelse med dansk og EU-lovgivning for fødevarer. Vi er
                  underlagt løbende kontrol af Fødevarestyrelsen.
                </p>
                <div className="approval-meta">
                  <span className="approval-cvr">CVR 44 12 87 03</span>
                  <span className="approval-aut">Autorisationsnr. · DK-FVM-2026-0041</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── FINAL CTA ── */}
          <section className="final-cta">
            <div className="final-eyebrow">— Gå om bord —</div>
            <h2 className="final-h2">
              Halv pris.
              <br />
              <em>Dobbelt tålmodighed.</em>
            </h2>
            <p className="final-lead">
              Batch 001 afsendes, når det er fyldt. Bestil nu — så spiser du argentinsk ribeye
              sidst i juli.
            </p>
            <button className="final-btn" onClick={() => navigate('/batches/batch-001')}>
              Køb nu
              <ArrowIcon />
            </button>
            <button className="final-btn-secondary" onClick={() => navigate('/batches')}>Se alle batches</button>
          </section>

          {/* ── FOOTER ── */}
          <footer>
            <div className="footer-logo">
              <Logo size={26} />
            </div>
            <nav className="footer-nav">
              <a href="#">Om os</a>
              <a href="#">Kontakt</a>
              <Link data-testid="nav-batches" to="/batches">Batches</Link>
              <a href="#">Afhentningssteder</a>
              <a href="#">Vilkår</a>
              <a href="#">Privatliv</a>
            </nav>
            <div className="footer-bottom">
              <span>© Gaucho ApS 2026</span>
              <span>CVR 44 12 87 03</span>
            </div>
          </footer>

        </div>
      </div>
    </>
  )
}
