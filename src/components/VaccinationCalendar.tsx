'use client'

interface VaccinationPhase {
  name: string
  ageMin: number
  ageMax: number
  bgColor: string
  vaccines: {
    name: string
    schedule: string
    notes?: string
  }[]
}

const PERRO_SCHEDULE: VaccinationPhase[] = [
  {
    name: 'Cachorro',
    ageMin: 0,
    ageMax: 6,
    bgColor: 'bg-blue-50 border-blue-200',
    vaccines: [
      { name: 'Polivalente (V5/V6)', schedule: 'Semana 6, 9, 12, 15', notes: 'Protege contra parvovirosis, distemper, etc' },
      { name: 'Rabia', schedule: 'Semana 16 (4 meses)', notes: 'Primera dosis obligatoria' },
    ],
  },
  {
    name: 'Adolescente',
    ageMin: 6,
    ageMax: 12,
    bgColor: 'bg-primary/10 border-primary/30',
    vaccines: [
      { name: 'Refuerzo Polivalente', schedule: 'Mes 12', notes: 'Consolidar inmunidad' },
      { name: 'Refuerzo Rabia', schedule: 'Mes 12', notes: 'Refuerzo obligatorio' },
    ],
  },
  {
    name: 'Adulto',
    ageMin: 1,
    ageMax: 7,
    bgColor: 'bg-primary text-white border-primary',
    vaccines: [
      { name: 'Polivalente', schedule: 'Anual', notes: 'Mantener inmunidad' },
      { name: 'Rabia', schedule: 'Anual', notes: 'Obligatoria según norma local' },
      { name: 'Leptospirosis (si es necesario)', schedule: 'Cada 3 años', notes: 'Según evaluación veterinaria' },
    ],
  },
  {
    name: 'Senior',
    ageMin: 7,
    ageMax: 120,
    bgColor: 'bg-gray-50 border-gray-300',
    vaccines: [
      { name: 'Revisión Veterinaria', schedule: 'Anual obligatorio', notes: 'Control de salud general' },
      { name: 'Polivalente', schedule: 'Anual', notes: 'Evaluar necesidad según estado' },
      { name: 'Rabia', schedule: 'Anual', notes: 'Si continúa activo' },
    ],
  },
]

const GATO_SCHEDULE: VaccinationPhase[] = [
  {
    name: 'Cachorro',
    ageMin: 0,
    ageMax: 6,
    bgColor: 'bg-blue-50 border-blue-200',
    vaccines: [
      { name: 'Trivalente Felina (FVRC)', schedule: 'Semana 8, 12, 16', notes: 'Protege contra calicivirus, rinotraqueitis, panleucopenia' },
      { name: 'Rabia', schedule: 'Semana 12-16', notes: 'Primera dosis' },
    ],
  },
  {
    name: 'Adolescente',
    ageMin: 6,
    ageMax: 12,
    bgColor: 'bg-primary/10 border-primary/30',
    vaccines: [
      { name: 'Refuerzo Trivalente', schedule: 'Mes 12', notes: 'Consolidar protección' },
      { name: 'Refuerzo Rabia', schedule: 'Mes 12', notes: 'Refuerzo obligatorio' },
    ],
  },
  {
    name: 'Adulto',
    ageMin: 1,
    ageMax: 10,
    bgColor: 'bg-primary text-white border-primary',
    vaccines: [
      { name: 'Trivalente', schedule: 'Anual', notes: 'Mantener inmunidad' },
      { name: 'Rabia', schedule: 'Anual', notes: 'Obligatoria' },
      { name: 'Leucemia Felina (si es necesario)', schedule: 'Cada 2 años', notes: 'Para gatos con acceso al exterior' },
    ],
  },
  {
    name: 'Senior',
    ageMin: 10,
    ageMax: 120,
    bgColor: 'bg-gray-50 border-gray-300',
    vaccines: [
      { name: 'Revisión Veterinaria', schedule: 'Anual obligatorio', notes: 'Control completo de salud' },
      { name: 'Trivalente', schedule: 'Anual', notes: 'Si continúa en buen estado' },
      { name: 'Rabia', schedule: 'Según situación', notes: 'Evaluar con veterinario' },
    ],
  },
]

interface VaccinationCalendarProps {
  tipoMascota: 'perro' | 'gato'
  edadActual: number
}

const formatAgeForDisplay = (edadDecimal: number): string => {
  const years = Math.floor(edadDecimal)
  const months = Math.round((edadDecimal - years) * 12)

  if (years === 0) {
    return months === 1 ? `${months} mes` : `${months} meses`
  }
  if (months === 0) {
    return years === 1 ? `${years} año` : `${years} años`
  }
  return `${years} año${years !== 1 ? 's' : ''} y ${months} mes${months !== 1 ? 'es' : ''}`
}

export default function VaccinationCalendar({ tipoMascota, edadActual }: VaccinationCalendarProps) {
  const schedule = tipoMascota === 'perro' ? PERRO_SCHEDULE : GATO_SCHEDULE
  const tipoLabel = tipoMascota === 'perro' ? 'PERRO' : 'GATO'
  const icon = tipoMascota === 'perro' ? '🐕' : '🐱'
  const edadFormato = formatAgeForDisplay(edadActual)

  return (
    <div className="w-full bg-white rounded-2xl border-2 border-primary/20 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-5 flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="text-xl md:text-2xl font-bold">Calendario de Vacunación</h3>
          <p className="text-primary-light text-sm">{tipoLabel} • Edad actual: {edadFormato}</p>
        </div>
      </div>

      {/* Phases Grid */}
      <div className="p-6 space-y-4">
        {schedule.map((phase, idx) => {
          const isCurrentPhase = edadActual >= phase.ageMin && edadActual <= phase.ageMax

          return (
            <div
              key={idx}
              className={`border-2 rounded-xl p-4 transition-all ${phase.bgColor} ${
                isCurrentPhase ? 'ring-2 ring-primary ring-offset-1 shadow-md' : ''
              }`}
            >
              {/* Phase Title */}
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-lg font-bold ${phase.bgColor.includes('text-white') ? 'text-white' : 'text-primary'}`}>
                  {phase.name}
                </h4>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  isCurrentPhase
                    ? 'bg-primary text-white'
                    : phase.bgColor.includes('text-white')
                    ? 'bg-primary/20 text-primary'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {phase.ageMin}-{phase.ageMax} años
                </span>
              </div>

              {/* Vaccines List */}
              <div className="space-y-3">
                {phase.vaccines.map((vaccine, vIdx) => (
                  <div key={vIdx} className="flex gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      phase.bgColor.includes('text-white')
                        ? 'bg-white/30 text-white'
                        : 'bg-primary/20 text-primary'
                    }`}>
                      💉
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${phase.bgColor.includes('text-white') ? 'text-white' : 'text-gray-900'}`}>
                        {vaccine.name}
                      </p>
                      <p className={`text-xs ${phase.bgColor.includes('text-white') ? 'text-white/80' : 'text-gray-600'}`}>
                        📅 {vaccine.schedule}
                      </p>
                      {vaccine.notes && (
                        <p className={`text-xs italic mt-1 ${phase.bgColor.includes('text-white') ? 'text-white/70' : 'text-gray-500'}`}>
                          {vaccine.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Current Phase Indicator */}
              {isCurrentPhase && (
                <div className="mt-3 pt-3 border-t border-current/20">
                  <p className={`text-xs font-bold flex items-center gap-2 ${phase.bgColor.includes('text-white') ? 'text-white' : 'text-primary'}`}>
                    ✅ Tu mascota está en esta fase
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer Note */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 text-xs text-gray-600 space-y-1">
        <p>
          <strong>⚠️ Importante:</strong> Este calendario es orientativo. Siempre consulta con tu veterinario para un plan personalizado.
        </p>
        <p>Las vacunaciones pueden variar según el estado de salud, exposición a riesgos y normativas locales.</p>
      </div>
    </div>
  )
}
