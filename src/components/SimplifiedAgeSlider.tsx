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
      : `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`

  return (
    <div className="w-full space-y-4">
      {/* Label */}
      <label className="block text-left">
        <span className="text-lg font-bold text-white">Edad de tu mascota</span>
      </label>

      {/* Display */}
      <div className="bg-white/10 rounded-lg p-4 text-center">
        <p className="text-4xl font-bold text-white">{displayText}</p>
      </div>

      {/* Slider */}
      <div>
        <input
          type="range"
          min="0"
          max="20.5"
          step="0.5"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-400 rounded-lg appearance-none cursor-pointer slider-clean"
          aria-label="Selecciona la edad de tu mascota"
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-white/60 font-semibold px-1">
        <span>0</span>
        <span>5 años</span>
        <span>10 años</span>
        <span>15 años</span>
        <span>20 años</span>
      </div>

      {/* CSS for slider styling */}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: white;
          border: 2px solid #007869;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }

        input[type='range']::-webkit-slider-thumb:hover {
          box-shadow: 0 2px 8px rgba(0, 120, 105, 0.3);
        }

        input[type='range']::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: white;
          border: 2px solid #007869;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }

        input[type='range']::-moz-range-thumb:hover {
          box-shadow: 0 2px 8px rgba(0, 120, 105, 0.3);
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
