import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { batchService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import './LandingPage.css'
import logo from '../../../public/logo.png'
import steakHero from '../../../public/steak-hero.png'

function Logo({ size = 22 }) {
  const imageSize = size === 22 ? 60 : 72
  return (
    <Link className="logo" to="/">
      <img src={logo} alt="Gaucho" style={{ height: imageSize, width: 'auto' }} />
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

function ChevronIcon({ open }) {
  return (
    <svg
      className="accordion-chevron"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'none' }}
    >
      <path d="M3 5 L7 9 L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function Accordion({ id, title, children, openId, setOpenId }) {
  const isOpen = openId === id
  return (
    <div className={`accordion ${isOpen ? 'is-open' : ''}`}>
      <button
        className="accordion-trigger"
        onClick={() => setOpenId(isOpen ? null : id)}
        aria-expanded={isOpen}
      >
        <span className="accordion-title">{title}</span>
        <ChevronIcon open={isOpen} />
      </button>
      <div className="accordion-panel">
        <div className="accordion-inner">{children}</div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [activeBatches, setActiveBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    batchService.getActiveBatches().then(batches => {
      setActiveBatches(batches)
      setLoading(false)
    })
  }, [])

  const batch = activeBatches[0] || null

  return (
    <div className="page-root">
      <header className="top-bar">
        <Logo size={22} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
          <Link data-testid="nav-batches" to="/batches" className="batch-indicator">
            <PulseDot />
            Batch åben
          </Link>
          <button
            className="hamburger"
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
          </button>
          {menuOpen && (
            <div className="dropdown-menu">
              <Link to="/batches" onClick={() => setMenuOpen(false)}>Batches</Link>
              <a href="#om-gaucho" onClick={() => setMenuOpen(false)}>Om Gaucho</a>
              <a href="#miljo" onClick={() => setMenuOpen(false)}>Miljø &amp; oprindelse</a>
              <a href="#saadan-virker-det" onClick={() => setMenuOpen(false)}>Sådan virker det</a>
              <a href="#kødet" onClick={() => setMenuOpen(false)}>Om kødet</a>
              <a href="#godkendelse" onClick={() => setMenuOpen(false)}>Godkendelse</a>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Log ind</Link>
              {session?.role === 'admin' && (
                <>
                  <Link to="/admin/batches" onClick={() => setMenuOpen(false)}>Admin: Batches</Link>
                  <Link to="/admin/payments" onClick={() => setMenuOpen(false)}>Admin: Konto</Link>
                  <Link to="/admin/scanner" onClick={() => setMenuOpen(false)}>Admin: Scanner</Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <section className="hero">
        <div className="hero-image-wrap">
          <img
            className="hero-img"
            src={steakHero}
            alt="Sizzling ribeye over glowing coals with Argentine pampas in the background"
          />
          <div className="hero-fade" />
        </div>

        <div className="hero-copy">
          <h1 className="hero-h1">
            Argentinsk oksekød,
            <br />
            sendt direkte til dit
            <br />
            <em>pickup-point.</em>
          </h1>
          <p className="hero-lead">
            Dybfrossent, græsfodret oksekød fra pampaen. Samles i fælles batches og sendes
            til Danmark. ca. {batch ? batch.deliveryWeeks : 6} uger. Den halve pris.
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
              <ArrowIcon />
            </span>
          </button>
          <button
            data-testid="show-more-btn"
            className="cta-btn-secondary"
            onClick={() => navigate('/batches')}
          >
            Vis mig mere
          </button>
        </div>

        <div className="metrics">
          <div className="metric">
            <div className="metric-key">PRIS</div>
            <div className="metric-val">{batch ? batch.pricePerKg : '—'} kr./kg</div>
            <div className="metric-sub">ca. halvpris vs. detail</div>
          </div>
          <div className="metric">
            <div className="metric-key">LEVERING</div>
            <div className="metric-val">ca. {batch ? batch.deliveryWeeks : 6} uger</div>
            <div className="metric-sub">fra køb</div>
          </div>
          <div className="metric">
            <div className="metric-key">KVALITET</div>
            <div className="metric-val">ægte argentinsk</div>
            <div className="metric-sub">fritgående, græsfodret</div>
          </div>
        </div>
      </section>

      <div className="info-accordion">
        <div className="accordion-section" id="om-gaucho">
          <Accordion id="gaucho" title="Om Gaucho — fra pampaen" openId={openId} setOpenId={setOpenId}>
            <p>
              Gauchos er Argentinas svar på cowboys — nomadiske ryttere, der i generationer har
              drevet kvæg over de endeløse pampas. Deres liv er afstemt med naturen: tidlig
              morgen i sadlen, aftenen samlet om asadoen.
            </p>
            <p>
              Det er denne tradition og respekt for dyret, der afspejler sig i hvert stykke kød
              fra Gaucho. Kvæget vokser langsomt, græsser frit og lever et naturligt liv.
              Argentinsk pampas er 20 gange større end Danmark.
            </p>
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
                <span className="fact-num">−18°</span>
                <span className="fact-label">lynfrosset for bedste smag</span>
              </div>
            </div>
          </Accordion>
        </div>

        <div className="accordion-section" id="miljo">
          <Accordion id="env" title="Miljø &amp; oprindelse" openId={openId} setOpenId={setOpenId}>
            <div className="env-grid">
              <div className="env-card">
                <div className="env-title">Naturlig græsning</div>
                <div className="env-desc">
                  Kvæget lever hele sit liv på åbne pampas og spiser udelukkende naturligt græs.
                  Ingen kraftfoder. Ingen stalde.
                </div>
              </div>
              <div className="env-card">
                <div className="env-title">Lavere vandaftryk</div>
                <div className="env-desc">
                  Argentinsk oksekød kræver markant mindre tilsat vand end konventionelt
                  kornfodret kvæg — pampaens regn klarer det.
                </div>
              </div>
              <div className="env-card">
                <div className="env-title">Én container</div>
                <div className="env-desc">
                  Vi sender frosset kød samlet i én container. Fuld lastudnyttelse minimerer CO₂
                  pr. kg markant frem for mange små forsendelser.
                </div>
              </div>
              <div className="env-card">
                <div className="env-title">Ingen antibiotika</div>
                <div className="env-desc">
                  Argentinsk oksekød eksporteret til EU er certificeret fri for hormoner og
                  unødvendig brug af antibiotika.
                </div>
              </div>
            </div>
          </Accordion>
        </div>

        <div className="accordion-section" id="saadan-virker-det">
          <Accordion id="how" title="Sådan virker det" openId={openId} setOpenId={setOpenId}>
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
                  <div className="step-title">Vi bestiller og sender</div>
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
                    ca. seks uger senere: tag en køletaske med til dit afhentningssted.
                  </div>
                </div>
              </div>
            </div>
          </Accordion>
        </div>

        <div className="accordion-section" id="kødet">
          <Accordion id="handling" title="Om kødet — optøning &amp; tilberedning" openId={openId} setOpenId={setOpenId}>
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
          </Accordion>
        </div>

        <div className="accordion-section" id="godkendelse">
          <Accordion id="approval" title="Godkendt af Fødevarestyrelsen" openId={openId} setOpenId={setOpenId}>
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
          </Accordion>
        </div>
      </div>

      <section className="final-cta">
        <h2 className="final-h2">
          Halv pris.
          <br />
          <em>Dobbelt tålmodighed.</em>
        </h2>
        <p className="final-lead">
          Batchen afsendes, når den er fyldt. Bestil nu — så spiser du argentinsk ribeye
          inden længe.
        </p>
        <div className="final-cta-buttons">
          <button className="final-btn" onClick={() => navigate('/batches/batch-001')}>
            Køb nu
            <ArrowIcon />
          </button>
        </div>
      </section>

      <footer>
        <div className="footer-logo">
          <Logo size={26} />
        </div>
        <nav className="footer-nav">
          <a href="#om-gaucho">Om os</a>
          <a href="#saadan-virker-det">Sådan virker det</a>
          <Link data-testid="nav-batches" to="/batches">Batches</Link>
          <a href="#godkendelse">Godkendelse</a>
          <a href="#">Vilkår</a>
          <a href="#">Privatliv</a>
        </nav>
        <div className="footer-bottom">
          <span>© Gaucho ApS 2026</span>
          <span>CVR 44 12 87 03</span>
        </div>
      </footer>
    </div>
  )
}
