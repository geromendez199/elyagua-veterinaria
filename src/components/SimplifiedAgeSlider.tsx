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
      {/* Age Range Bands - Visual Selection */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-white">Etapas de desarrollo:</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {ageBands.map((band) => (
            <button
              key={band.label}
              onClick={() => handleBandClick(band)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 ${
                getActiveBand() === band
                  ? `${band.color} shadow-lg scale-105 border-current`
                  : `${band.color} hover:shadow-md`
              }`}
            >
              {band.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
