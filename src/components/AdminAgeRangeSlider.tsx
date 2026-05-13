'use client'

interface AdminAgeRangeSliderProps {
  minAge: number
  maxAge: string
  onMinChange: (value: number) => void
  onMaxChange: (value: string) => void
}

export default function AdminAgeRangeSlider({
  minAge,
  maxAge,
  onMinChange,
  onMaxChange,
}: AdminAgeRangeSliderProps) {
  const inputCls = 'w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none text-gray-900 bg-white text-sm'

  // Age range bands based on developmental stages
  const ageBands = [
    { label: '6-8 sem', minValue: 6/52, maxValue: 8/52, color: 'bg-red-100 text-red-700 border-red-300' },
    { label: '8-10 sem', minValue: 8/52, maxValue: 10/52, color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { label: '12-14 sem', minValue: 12/52, maxValue: 14/52, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { label: '16-18 sem', minValue: 16/52, maxValue: 18/52, color: 'bg-green-100 text-green-700 border-green-300' },
    { label: '20-24 sem', minValue: 20/52, maxValue: 24/52, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { label: 'Anual', minValue: 1, maxValue: 20, color: 'bg-purple-100 text-purple-700 border-purple-300' },
  ]

  return (
    <div className="space-y-4">
      {/* Age Range Bands Reference */}
      <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
        <p className="text-xs font-semibold text-primary mb-3">Etapas de desarrollo:</p>
        <div className="flex gap-2 flex-wrap">
          {ageBands.map((band) => (
            <div
              key={band.label}
              className={`px-2 py-1 rounded text-xs font-semibold border-2 ${band.color}`}
            >
              {band.label}
            </div>
          ))}
        </div>
      </div>

      {/* Age Range Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Edad Mínima (años)</label>
          <input
            type="number"
            min="0"
            max="20"
            step="0.5"
            value={minAge}
            onChange={(e) => onMinChange(parseFloat(e.target.value) || 0)}
            className={inputCls}
            placeholder="ej: 0"
          />
          <p className="text-xs text-gray-500 mt-1">Desde: {minAge === 0 ? 'Recién nacido' : `${minAge} año${minAge !== 1 ? 's' : ''}`}</p>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Edad Máxima (dejar vacío = sin límite)</label>
          <input
            type="number"
            min="0"
            max="20"
            step="0.5"
            value={maxAge}
            onChange={(e) => onMaxChange(e.target.value)}
            className={inputCls}
            placeholder="ej: 7"
          />
          <p className="text-xs text-gray-500 mt-1">Hasta: {maxAge ? `${maxAge} año${maxAge !== '1' ? 's' : ''}` : 'Sin límite (senior)'}</p>
        </div>
      </div>

      {/* Visual Range Representation */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-2">Rango seleccionado:</p>
        <div className="text-sm text-gray-900">
          {minAge === 0 && !maxAge && 'Todas las edades'}
          {minAge === 0 && maxAge && `Desde recién nacido hasta ${maxAge} año${maxAge !== '1' ? 's' : ''}`}
          {minAge > 0 && !maxAge && `Desde ${minAge} año${minAge !== 1 ? 's' : ''} en adelante`}
          {minAge > 0 && maxAge && `De ${minAge} a ${maxAge} años`}
        </div>
      </div>
    </div>
  )
}
