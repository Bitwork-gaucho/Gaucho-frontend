import './Barcode.css'

const CODE39 = {
  '0': '100001001', '1': '101001001', '2': '101001100', '3': '101100101',
  '4': '101100110', '5': '100110101', '6': '100110110', '7': '101001010',
  '8': '101101010', '9': '101101100', 'A': '101000101', 'B': '101010001',
  'C': '101010100', 'D': '101100001', 'E': '101100100', 'F': '100110001',
  'G': '100110100', 'H': '100101001', 'I': '100101100', 'J': '100100101',
  'K': '101000010', 'L': '101010010', 'M': '101010110', 'N': '101100010',
  'O': '101100110', 'P': '100110010', 'Q': '100110110', 'R': '100101010',
  'S': '100101110', 'T': '100100110', 'U': '110001001', 'V': '110101001',
  'W': '110101100', 'X': '110100101', 'Y': '110010101', 'Z': '110010110',
  '-': '110010010', '.': '110100010', ' ': '110010001', '$': '110110001',
  '/': '110101010', '+': '110110010', '*': '110100110', '%': '110010010',
}

export function encodeCode39(text) {
  const upper = text.toUpperCase()
  const chars = `*${upper}*`
  return chars
    .split('')
    .map(c => CODE39[c])
    .join('0')
}

export function Barcode({ value, height = 60, testId = 'barcode' }) {
  const pattern = encodeCode39(value)
  const total = pattern.length
  return (
    <div data-testid={testId} className="barcode-svg-wrap">
      <svg
        viewBox={`0 0 ${total} ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height }}
        aria-label={`Barcode: ${value}`}
      >
        {pattern.split('').map((bit, i) =>
          bit === '1' ? (
            <rect
              key={i}
              x={i}
              y={0}
              width={1}
              height={height}
              fill="currentColor"
            />
          ) : null
        )}
      </svg>
      <div className="barcode-text">{value}</div>
    </div>
  )
}
