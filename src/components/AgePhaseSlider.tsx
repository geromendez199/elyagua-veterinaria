'use client'

interface Phase {
  name: string
  min: number
  max: number
  bgColor: string
  width: number // percentage of total
}

const PHASES: Phase[] = [
  { name: 'Cachorro', min: 0, max: 26, bgColor: 'bg-blue-100', width: 10 },
  { name: 'Adolescente', min: 26, max: 52, bgColor: 'bg-blue-300', width: 10 },
  { name: 'Adulto', min: 52, max: 364, bgColor: 'bg-primary', width: 60 },
  { name: 'Senior', min: 364, max: 520, bgColor: 'bg-gray-300', width: 20 },
]

const formatWeeks = (weeks: number): string => {
  if (weeks < 4) {
    return `${weeks} semana${weeks !== 1 ? 's' : ''}`
  }
  if (weeks < 52) {
    const months = Math.round(weeks / 4.33)
    return `${months} mes${months !== 1 ? 'es' : ''}`
  }
  const years = Math.floor(weeks / 52)
  const remainingWeeks = weeks % 52
  const months = Math.round(remainingWeeks / 4.33)

  if (months === 0) {
    return `${years} año${years !== 1 ? 's' : ''}`
  }
  return `${years} año${years !== 1 ? 's' : ''} y ${months} mes${months !== 1 ? 'es' : ''}`
}

const getPhase = (weeks: number): Phase | undefined => {
  return PHASES.find((p) => weeks >= p.min && weeks < p.max)
}

const getPhaseIcon = (phaseName: string): string => {
  const icons: Record<string, string> = {
    Cachorro: '🐣',
    Adolescente: '🐕',
    Adulto: '💪',
    Senior: '🧓',
  }
  return icons[phaseName] || '🐾'
}

interface AgePhaseSliderProps {
  value: number
  onChange: (value: number) => void
}

export default function AgePhaseSlider({ value, onChange }: AgePhaseSliderProps) {
  const currentPhase = getPhase(value)
  const phaseIcon = currentPhase ? getPhaseIcon(currentPhase.name) : '🐾'

  return (
    <div className="w-full space-y-4">
      {/* Age Display */}
      <div className="text-center">
        <p className="text-primary-light text-sm mb-2">Edad actual:</p>
        <p className="text-3xl md:text-4xl font-bold text-white">
          <span className="text-4xl md:text-5xl mr-2">{phaseIcon}</span>
          {currentPhase?.name}
        </p>
        <p className="text-lg text-primary-light font-semibold mt-2">{formatWeeks(value)}</p>
      </div>

      {/* Phase Labels */}
      <div className="flex justify-between text-xs md:text-sm font-bold text-white px-2">
        <div className="text-center flex-1">
          <span className="block">Cachorro</span>
          <span className="text-primary-light text-xs">0-6 mes</span>
        </div>
        <div className="text-center flex-1">
          <span className="block">Adolescente</span>
          <span className="text-primary-light text-xs">6-12 mes</span>
        </div>
        <div className="text-center flex-1">
          <span className="block">Adulto</span>
          <span className="text-primary-light text-xs">1-7 años</span>
        </div>
        <div className="text-center flex-1">
          <span className="block">Senior</span>
          <span className="text-primary-light text-xs">7+ años</span>
        </div>
      </div>

      {/* Slider Container with Phase Background */}
      <div className="relative">
        {/* Phase Background Zones */}
        <div className="absolute inset-0 h-12 rounded-full overflow-hidden flex shadow-inner">
          {PHASES.map((phase, idx) => (
            <div
              key={idx}
              className={`${phase.bgColor} flex-grow transition-colors`}
              style={{ width: `${phase.width}%` }}
            />
          ))}
        </div>

        {/* Slider */}
        <input
          type="range"
          min="0"
          max="520"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="relative w-full h-12 rounded-full appearance-none bg-transparent cursor-pointer slider-thumb z-10"
          aria-label="Selecciona la edad de tu mascota"
          style={{
            WebkitAppearance: 'none',
          }}
        />
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between text-xs text-primary-light px-2 font-semibold">
        <span>0</span>
        <span>3 mes</span>
        <span>6 mes</span>
        <span>1 año</span>
        <span>3 años</span>
        <span>7+ años</span>
      </div>

      {/* Helpful Tip */}
      <div className="bg-white/10 border border-white/20 rounded-lg p-3 text-center">
        <p className="text-xs text-primary-light">
          💡 <strong>Primeras vacunas:</strong> A partir de las 6-8 semanas de edad
        </p>
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
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border: 3px solid #007869;
          transition: all 0.2s;
        }

        input[type='range']::-webkit-slider-thumb:hover {
          width: 32px;
          height: 32px;
          box-shadow: 0 4px 12px rgba(0, 120, 105, 0.4);
        }

        input[type='range']::-webkit-slider-thumb:active {
          box-shadow: 0 2px 16px rgba(0, 120, 105, 0.6);
        }

        input[type='range']::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border: 3px solid #007869;
          transition: all 0.2s;
        }

        input[type='range']::-moz-range-thumb:hover {
          width: 32px;
          height: 32px;
          box-shadow: 0 4px 12px rgba(0, 120, 105, 0.4);
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
