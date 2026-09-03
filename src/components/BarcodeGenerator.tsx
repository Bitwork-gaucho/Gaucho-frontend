import { useEffect, useRef } from 'react'
import './BarcodeGenerator.css'

interface BarcodeGeneratorProps {
  data: string
  format?: 'CODE128' | 'CODE39'
}

export default function BarcodeGenerator({ data, format = 'CODE128' }: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !data) return

    // Simple barcode simulation using canvas
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const barWidth = 2
    const barHeight = height - 20

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = '#000000'
    let x = 10

    // Create a simple pattern based on the data
    for (let i = 0; i < data.length && x < width - 10; i++) {
      const char = data.charCodeAt(i)
      const pattern = (char % 7) + 1

      for (let j = 0; j < pattern && x < width - 10; j++) {
        if (j % 2 === 0) {
          ctx.fillRect(x, 10, barWidth, barHeight)
        }
        x += barWidth
      }
      x += barWidth * 2
    }

    // Add text below barcode
    ctx.fillStyle = '#000000'
    ctx.font = '12px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(data, width / 2, height - 5)
  }, [data])

  return (
    <div className="barcode-container">
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        className="barcode-canvas"
      />
      <p className="barcode-text">{data}</p>
    </div>
  )
}
