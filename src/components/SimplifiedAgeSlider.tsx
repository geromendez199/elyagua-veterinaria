'use client'

interface SimplifiedAgeSliderProps {
  value: number // decimal age in years (e.g., 2.5 = 2 años y 6 meses)
  onChange: (value: number) => void
}

export default function SimplifiedAgeSlider({ value, onChange }: SimplifiedAgeSliderProps) {
  const years = Math.floor(value)
  const months = Math.round((value - years) * 12)

  const displayText =
    months === 0
      ? `${years} ${years === 1 ? 'año' : 'años'}`
      : years === 0
        ? `${months} ${months === 1 ? 'mes' : 'meses'}`
        : `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`

  // Quick preset buttons
  const presets = [
    { label: '0-1m', minMonths: 0, maxMonths: 1 },
    { label: '1-3m', minMonths: 1, maxMonths: 3 },
    { label: '3-6m', minMonths: 3, maxMonths: 6 },
    { label: '6-12m', minMonths: 6, maxMonths: 12 },
    { label: '+ 1 año', minMonths: 12, maxMonths: 240 },
  ]

  const handlePreset = (minMonths: number, maxMonths: number) => {
    const midMonths = (minMonths + maxMonths) / 2
    onChange(midMonths / 12) // Convert to years
  }

  const isPresetActive = (minMonths: number, maxMonths: number): boolean => {
    const currentMonths = value * 12
    return currentMonths >= minMonths && currentMonths <= maxMonths
  }

  return (
    <div className="w-full space-y-5">
      {/* Label */}
      <label className="block text-left">
        <span className="text-lg font-bold text-white">Edad de tu mascota</span>
      </label>

      {/* Display */}
      <div className="bg-white/10 rounded-lg p-5 text-center border border-white/20">
        <p className="text-4xl font-bold text-white">{displayText}</p>
      </div>

      {/* Quick Preset Buttons */}
      <div className="flex gap-2 flex-wrap justify-center">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePreset(preset.minMonths, preset.maxMonths)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              isPresetActive(preset.minMonths, preset.maxMonths)
                ? 'bg-white text-primary shadow-lg scale-105'
                : 'border-2 border-white text-white hover:bg-white/10'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="space-y-3">
        <input
          type="range"
          min="0"
          max="20.5"
          step="0.25"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-3 bg-gradient-to-r from-white/30 to-white/40 rounded-full appearance-none cursor-pointer slider-enhanced"
          aria-label="Selecciona la edad de tu mascota"
        />
      </div>

      {/* Scale labels - Detailed for young pets */}
      <div className="flex justify-between text-xs text-white/60 font-semibold px-1">
        <span>0</span>
        <span>1m</span>
        <span>3m</span>
        <span>6m</span>
        <span>1 año</span>
        <span>3 años</span>
        <span>5 años</span>
        <span>10 años</span>
        <span>20 años</span>
      </div>

      {/* CSS for slider styling */}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: white;
          border: 3px solid #007869;
          cursor: pointer;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(0, 120, 105, 0.5);
        }

        input[type='range']::-webkit-slider-thumb:active {
          transform: scale(1.15);
        }

        input[type='range']::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: white;
          border: 3px solid #007869;
          cursor: pointer;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        input[type='range']::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(0, 120, 105, 0.5);
        }

        input[type='range']::-moz-range-track {
          background: transparent;
          border: none;
        }

        input[type='range']::-moz-range-progress {
          background: transparent;
        }
      `}</style>
    </div>
  )
}
