import './QuantitySelector.css'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  max?: number
  presets?: number[]
}

export default function QuantitySelector({ value, onChange, max = 500, presets = [1, 2, 3, 5, 10] }: QuantitySelectorProps) {
  const handlePresetClick = (preset: number) => {
    const newValue = value + preset
    if (newValue <= max) {
      onChange(newValue)
    }
  }

  const handleReset = () => {
    onChange(0)
  }

  return (
    <div className="quantity-selector">
      <div className="presets">
        {presets.map(preset => (
          <button
            key={preset}
            className="preset-btn"
            onClick={() => handlePresetClick(preset)}
            disabled={value + preset > max}
          >
            +{preset}kg
          </button>
        ))}
      </div>

      <div className="quantity-input-group">
        <label htmlFor="quantity">Total: {value} kg</label>
        <input
          id="quantity"
          type="number"
          min="0"
          max={max}
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.min(max, parseInt(e.target.value) || 0)))}
          className="quantity-input"
        />
        {value > 0 && (
          <button className="reset-btn" onClick={handleReset}>Clear</button>
        )}
      </div>
    </div>
  )
}
