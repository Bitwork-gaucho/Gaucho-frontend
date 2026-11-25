import { useState } from 'react'
import { BatchImage } from '../types'
import { imageSrc } from '../utils/batchStatus'
import './BatchGallery.css'

const Arrow = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <polyline points={dir === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
  </svg>
)

/** Stort billede med pile og miniaturer. Viser intet, hvis batchen ikke har billeder. */
export default function BatchGallery({ images }: { images?: BatchImage[] }) {
  const [index, setIndex] = useState(0)
  if (!images || images.length === 0) return null

  const count = images.length
  const current = images[Math.min(index, count - 1)]
  const go = (step: number) => setIndex(i => (i + step + count) % count)

  return (
    <div
      className="batch-gallery"
      onKeyDown={e => {
        if (e.key === 'ArrowLeft') go(-1)
        if (e.key === 'ArrowRight') go(1)
      }}
    >
      <div className="gallery-main">
        <img src={imageSrc(current.url)} alt={current.alt} />
        {count > 1 && (
          <>
            <button type="button" className="gallery-arrow prev" onClick={() => go(-1)} aria-label="Forrige billede">
              <Arrow dir="left" />
            </button>
            <button type="button" className="gallery-arrow next" onClick={() => go(1)} aria-label="Næste billede">
              <Arrow dir="right" />
            </button>
            <span className="gallery-count">{index + 1} / {count}</span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="gallery-thumbs">
          {images.map((img, i) => (
            <button
              type="button"
              key={img.url + i}
              className={`gallery-thumb ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Vis billede ${i + 1}: ${img.alt}`}
              aria-current={i === index ? 'true' : undefined}
            >
              <img src={imageSrc(img.url)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Første billede som forsidebillede på et kort */
export function BatchCover({ images, className = '' }: { images?: BatchImage[]; className?: string }) {
  const first = images?.[0]
  if (!first) return null
  return (
    <div className={`batch-cover ${className}`}>
      <img src={imageSrc(first.url)} alt={first.alt} loading="lazy" />
      {images!.length > 1 && <span className="cover-count">{images!.length} billeder</span>}
    </div>
  )
}
