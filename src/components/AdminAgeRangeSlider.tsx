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

  return (
    <div className="space-y-4">
      {/* Visual Scale Reference */}
      <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
        <p className="text-xs font-semibold text-primary mb-3">Escala de referencia:</p>
        <div className="flex justify-between text-xs text-gray-700 font-semibold px-1">
          <span>0</span>
          <span>1m</span>
          <span>3m</span>
          <span>6m</span>
          <span>12m</span>
          <span>2 años</span>
          <span>5 años</span>
          <span>10 años</span>
          <span>20 años</span>
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
