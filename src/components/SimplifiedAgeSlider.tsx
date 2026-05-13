'use client'

interface SimplifiedAgeSliderProps {
  value: number // decimal age in years (e.g., 2.5 = 2 años y 6 meses)
  onChange: (value: number) => void
}

interface WeekBand {
  label: string
  minWeeks: number
  maxWeeks: number
  color: string
}

interface YearBand {
  label: string
  minMonths: number
  maxYears: number
  color: string
}

type AgeBand = WeekBand | YearBand

export default function SimplifiedAgeSlider({ value, onChange }: SimplifiedAgeSliderProps) {
  const years = Math.floor(value)
  const months = Math.round((value - years) * 12)

  const displayText =
    months === 0
      ? `${years} ${years === 1 ? 'año' : 'años'}`
      : years === 0
        ? `${months} ${months === 1 ? 'mes' : 'meses'}`
        : `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`

  // Age range bands based on developmental stages
  const ageBands: AgeBand[] = [
    { label: '6-8 sem', minWeeks: 6, maxWeeks: 8, color: 'bg-red-100 text-red-700 border-red-300' },
    { label: '8-10 sem', minWeeks: 8, maxWeeks: 10, color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { label: '12-14 sem', minWeeks: 12, maxWeeks: 14, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { label: '16-18 sem', minWeeks: 16, maxWeeks: 18, color: 'bg-green-100 text-green-700 border-green-300' },
    { label: '20-24 sem', minWeeks: 20, maxWeeks: 24, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { label: 'Anual', minMonths: 12, maxYears: 20, color: 'bg-purple-100 text-purple-700 border-purple-300' },
  ]

  const handleBandClick = (band: AgeBand) => {
    if ('minWeeks' in band) {
      const weekBand = band as WeekBand
      const midWeeks = (weekBand.minWeeks + weekBand.maxWeeks) / 2
      onChange(midWeeks / 52) // Convert weeks to years
    } else {
      const yearBand = band as YearBand
      const midMonths = yearBand.minMonths + (yearBand.maxYears - 1) * 12 / 2
      onChange(midMonths / 12)
    }
  }

  const getActiveBand = (): AgeBand | null => {
    const months = value * 12
    for (const band of ageBands) {
      if ('minWeeks' in band) {
        const weekBand = band as WeekBand
        const minMonths = (weekBand.minWeeks / 52) * 12
        const maxMonths = (weekBand.maxWeeks / 52) * 12
        if (months >= minMonths && months <= maxMonths) return band
      } else {
        const yearBand = band as YearBand
        if (months >= yearBand.minMonths) {
          return band
        }
      }
    }
    return null
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

      {/* Age Range Bands - Visual Selection */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-white/70">Etapas de desarrollo:</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {ageBands.map((band) => (
            <button
              key={band.label}
              onClick={() => handleBandClick(band)}
              className={`px-3 py-2 rounded-lg font-semibold text-xs transition-all border-2 ${
                getActiveBand() === band
                  ? `${band.color} shadow-lg scale-110 border-current`
                  : `${band.color} hover:shadow-md`
              }`}
            >
              {band.label}
            </button>
          ))}
        </div>
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

      {/* Scale labels - Positioned to match exact slider values */}
      <div className="relative h-6 px-1">
        {[
          { label: '0', value: 0 },
          { label: '1m', value: 1 / 12 },
          { label: '3m', value: 3 / 12 },
          { label: '6m', value: 6 / 12 },
          { label: '12m', value: 1 },
          { label: '2 años', value: 2 },
          { label: '5 años', value: 5 },
          { label: '10 años', value: 10 },
          { label: '20 años', value: 20 },
        ].map((item) => (
          <span
            key={item.label}
            className="absolute text-xs text-white/60 font-semibold whitespace-nowrap"
            style={{
              left: `${(item.value / 20.5) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {item.label}
          </span>
        ))}
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
