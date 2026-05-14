'use client'

import { Fragment, useState } from 'react'
import { Baby, Heart, ShieldCheck, AlertCircle } from 'lucide-react'

type PetType = 'perro' | 'gato'

interface VaccineRow {
  name: string
  when: string
  frequency: string
  notes: string
  required?: boolean
}

interface VaccinationPhase {
  name: string
  ageRange: string
  icon: React.ReactNode
  headerColor: string
  bodyColor: string
  altRowColor: string
  textColor: string
  vaccines: VaccineRow[]
}

const PERRO_PHASES: VaccinationPhase[] = [
  {
    name: 'Cachorro',
    ageRange: '6 – 16 semanas',
    icon: <Baby size={24} className="text-rose-500" />,
    headerColor: 'bg-rose-500',
    bodyColor: 'bg-rose-50',
    altRowColor: 'bg-white',
    textColor: 'text-rose-600',
    vaccines: [
      {
        name: 'Polivalente (Séxtuple / Óctuple)',
        when: 'Sem. 6, 8, 12 y 16',
        frequency: 'Serie inicial — 4 dosis',
        notes: 'Protege contra moquillo, parvovirus, hepatitis, parainfluenza, adenovirus y leptospirosis',
        required: true,
      },
      {
        name: 'Antirrábica',
        when: 'Semana 16 (4 meses)',
        frequency: '1ª dosis',
        notes: 'Obligatoria por ley en Argentina (Ordenanza 41831/87)',
        required: true,
      },
      {
        name: 'Bordetella (Tos de las perreras)',
        when: 'Desde semana 8',
        frequency: 'Dosis inicial + refuerzo anual',
        notes: 'Recomendada si frecuenta guarderías, peluquerías o parques caninos',
        required: false,
      },
    ],
  },
  {
    name: 'Adolescente',
    ageRange: '6 – 12 meses',
    icon: <Heart size={24} className="text-amber-500" />,
    headerColor: 'bg-amber-500',
    bodyColor: 'bg-amber-50',
    altRowColor: 'bg-white',
    textColor: 'text-amber-600',
    vaccines: [
      {
        name: 'Refuerzo Polivalente',
        when: 'A los 12 meses',
        frequency: 'Refuerzo anual',
        notes: 'Consolida la inmunidad obtenida en la serie inicial',
        required: true,
      },
      {
        name: 'Refuerzo Antirrábica',
        when: 'A los 12 meses',
        frequency: 'Refuerzo anual',
        notes: 'Obligatorio por normativa nacional',
        required: true,
      },
      {
        name: 'Leishmaniasis',
        when: 'Desde los 6 meses',
        frequency: '3 dosis iniciales + anual',
        notes: 'Recomendada en zonas endémicas (NEA, NOA, Litoral). Requiere test previo',
        required: false,
      },
    ],
  },
  {
    name: 'Adulto',
    ageRange: '1 – 7 años',
    icon: <ShieldCheck size={24} className="text-blue-600" />,
    headerColor: 'bg-primary',
    bodyColor: 'bg-primary/5',
    altRowColor: 'bg-white',
    textColor: 'text-primary',
    vaccines: [
      {
        name: 'Polivalente',
        when: 'Cada año',
        frequency: 'Anual',
        notes: 'Mantiene la inmunidad frente a moquillo, parvovirus, hepatitis y leptospirosis',
        required: true,
      },
      {
        name: 'Antirrábica',
        when: 'Cada año',
        frequency: 'Anual',
        notes: 'Obligatoria por ley durante toda la vida del animal',
        required: true,
      },
      {
        name: 'Bordetella',
        when: 'Cada año',
        frequency: 'Anual',
        notes: 'Recomendada si frecuenta espacios con otros perros',
        required: false,
      },
    ],
  },
  {
    name: 'Senior',
    ageRange: '7+ años',
    icon: <AlertCircle size={24} className="text-purple-600" />,
    headerColor: 'bg-purple-600',
    bodyColor: 'bg-purple-50',
    altRowColor: 'bg-white',
    textColor: 'text-purple-600',
    vaccines: [
      {
        name: 'Chequeo Veterinario Geriátrico',
        when: 'Cada 6 a 12 meses',
        frequency: 'Semestral / Anual',
        notes: 'Control completo de salud: análisis, presión y evaluación general',
        required: true,
      },
      {
        name: 'Polivalente',
        when: 'Cada año',
        frequency: 'Anual',
        notes: 'Se mantiene salvo contraindicación veterinaria',
        required: true,
      },
      {
        name: 'Antirrábica',
        when: 'Cada año',
        frequency: 'Anual',
        notes: 'Continúa siendo obligatoria por ley',
        required: true,
      },
    ],
  },
]

const GATO_PHASES: VaccinationPhase[] = [
  {
    name: 'Cachorro',
    ageRange: '8 – 16 semanas',
    icon: <Baby size={24} className="text-rose-500" />,
    headerColor: 'bg-rose-500',
    bodyColor: 'bg-rose-50',
    altRowColor: 'bg-white',
    textColor: 'text-rose-600',
    vaccines: [
      {
        name: 'Triple Felina (FVRCP)',
        when: 'Sem. 8, 12 y 16',
        frequency: 'Serie inicial — 3 dosis',
        notes: 'Protege contra rinotraqueítis viral, calicivirus y panleucopenia',
        required: true,
      },
      {
        name: 'Antirrábica',
        when: 'Semana 12 – 16',
        frequency: '1ª dosis',
        notes: 'Obligatoria por ley en Argentina (Ordenanza 41831/87)',
        required: true,
      },
      {
        name: 'Leucemia Felina (FeLV)',
        when: 'Sem. 12 + refuerzo a las 4 sem',
        frequency: '2 dosis iniciales',
        notes: 'Requiere test previo. Recomendada para gatos con acceso al exterior',
        required: false,
      },
    ],
  },
  {
    name: 'Adolescente',
    ageRange: '6 – 12 meses',
    icon: <Heart size={24} className="text-amber-500" />,
    headerColor: 'bg-amber-500',
    bodyColor: 'bg-amber-50',
    altRowColor: 'bg-white',
    textColor: 'text-amber-600',
    vaccines: [
      {
        name: 'Refuerzo Triple Felina',
        when: 'A los 12 meses',
        frequency: 'Refuerzo anual',
        notes: 'Consolida la protección de la serie inicial',
        required: true,
      },
      {
        name: 'Refuerzo Antirrábica',
        when: 'A los 12 meses',
        frequency: 'Refuerzo anual',
        notes: 'Obligatorio por normativa nacional',
        required: true,
      },
      {
        name: 'Refuerzo Leucemia Felina',
        when: 'A los 12 meses',
        frequency: 'Refuerzo anual',
        notes: 'Para gatos con acceso al exterior o convivencia con otros felinos',
        required: false,
      },
    ],
  },
  {
    name: 'Adulto',
    ageRange: '1 – 10 años',
    icon: <ShieldCheck size={24} className="text-blue-600" />,
    headerColor: 'bg-primary',
    bodyColor: 'bg-primary/5',
    altRowColor: 'bg-white',
    textColor: 'text-primary',
    vaccines: [
      {
        name: 'Triple Felina',
        when: 'Cada año',
        frequency: 'Anual',
        notes: 'Mantiene la inmunidad contra las tres enfermedades virales principales',
        required: true,
      },
      {
        name: 'Antirrábica',
        when: 'Cada año',
        frequency: 'Anual',
        notes: 'Obligatoria por ley durante toda la vida del animal',
        required: true,
      },
      {
        name: 'Leucemia Felina',
        when: 'Cada año',
        frequency: 'Anual',
        notes: 'Para gatos con acceso al exterior o que conviven con otros felinos',
        required: false,
      },
    ],
  },
  {
    name: 'Senior',
    ageRange: '10+ años',
    icon: <AlertCircle size={24} className="text-purple-600" />,
    headerColor: 'bg-purple-600',
    bodyColor: 'bg-purple-50',
    altRowColor: 'bg-white',
    textColor: 'text-purple-600',
    vaccines: [
      {
        name: 'Chequeo Veterinario Geriátrico',
        when: 'Cada 6 a 12 meses',
        frequency: 'Semestral / Anual',
        notes: 'Control integral: análisis de sangre, riñón y tiroides',
        required: true,
      },
      {
        name: 'Triple Felina',
        when: 'Cada año',
        frequency: 'Anual',
        notes: 'Se mantiene salvo contraindicación veterinaria',
        required: true,
      },
      {
        name: 'Antirrábica',
        when: 'Cada año',
        frequency: 'Anual',
        notes: 'Continúa siendo obligatoria por ley',
        required: true,
      },
    ],
  },
]

interface VaccinationTableProps {
  showTitle?: boolean
  darkBg?: boolean
}

export default function VaccinationTable({ showTitle = true, darkBg = true }: VaccinationTableProps) {
  const [petType, setPetType] = useState<PetType>('perro')
  const phases = petType === 'perro' ? PERRO_PHASES : GATO_PHASES

  return (
    <div className="w-full">
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${darkBg ? 'text-white' : 'text-gray-900'}`}>
            Tabla de Vacunación
          </h2>
          <p className={`text-base md:text-lg max-w-2xl mx-auto ${darkBg ? 'text-white/80' : 'text-gray-600'}`}>
            Calendario completo de vacunas para mantener a tu mascota protegida en cada etapa de su vida
          </p>
        </div>
      )}

      {/* Pet Type Toggle */}
      <div className="flex justify-center mb-8">
        <div className={`rounded-2xl p-1.5 flex gap-1 ${darkBg ? 'bg-white/10 backdrop-blur-sm' : 'bg-gray-100'}`}>
          <button
            onClick={() => setPetType('perro')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all ${
              petType === 'perro'
                ? 'bg-white text-primary shadow-md'
                : darkBg
                ? 'text-white hover:bg-white/10'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="text-xl">🐕</span>
            Perro
          </button>
          <button
            onClick={() => setPetType('gato')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all ${
              petType === 'gato'
                ? 'bg-white text-primary shadow-md'
                : darkBg
                ? 'text-white hover:bg-white/10'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="text-xl">🐱</span>
            Gato
          </button>
        </div>
      </div>

      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-4">
        {phases.map((phase, phaseIdx) => (
          <div key={phaseIdx} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
            <div className={`${phase.headerColor} text-white px-4 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">{phase.name}</span>
              </div>
              <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">
                {phase.ageRange}
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {phase.vaccines.map((vaccine, vIdx) => (
                <div
                  key={vIdx}
                  className={`p-4 ${vIdx % 2 === 0 ? phase.bodyColor : phase.altRowColor}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-bold text-gray-900 text-sm">{vaccine.name}</p>
                    {vaccine.required ? (
                      <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-primary text-white">
                        Obligatoria
                      </span>
                    ) : (
                      <span className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                        Condicional
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5 text-sm">
                    <p className="text-gray-700">
                      <span className={`font-semibold ${phase.textColor}`}>Cuándo: </span>
                      {vaccine.when}
                    </p>
                    <p className="text-gray-700">
                      <span className={`font-semibold ${phase.textColor}`}>Frecuencia: </span>
                      {vaccine.frequency}
                    </p>
                    <p className="text-xs text-gray-500 italic pt-1">{vaccine.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="bg-white/10 rounded-xl px-4 py-3">
          <p className={`text-xs ${darkBg ? 'text-white/70' : 'text-gray-500'}`}>
            <strong className={darkBg ? 'text-white/90' : 'text-gray-700'}>⚠️ Importante:</strong> Este calendario es orientativo. Siempre consultá con un veterinario de El Yagua para un plan de vacunación mas personalizado.
          </p>
        </div>
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-200">
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-[28%]">
                Vacuna
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-[20%]">
                Cuándo
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-[20%]">
                Frecuencia
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-[32%]">
                Notas
              </th>
            </tr>
          </thead>
          <tbody>
            {phases.map((phase, phaseIdx) => (
              <Fragment key={phaseIdx}>
                <tr className={`${phase.headerColor} text-white`}>
                  <td colSpan={4} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-lg">{phase.name}</span>
                      </div>
                      <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                        {phase.ageRange}
                      </span>
                    </div>
                  </td>
                </tr>
                {phase.vaccines.map((vaccine, vIdx) => (
                  <tr
                    key={vIdx}
                    className={`border-b border-gray-100 last:border-b-0 ${
                      vIdx % 2 === 0 ? phase.bodyColor : phase.altRowColor
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-start gap-2">
                        <span className="font-semibold text-gray-900 text-sm leading-snug">
                          {vaccine.name}
                        </span>
                        {vaccine.required ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary text-white">
                            Obligatoria
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                            Condicional
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 align-top">{vaccine.when}</td>
                    <td className={`px-5 py-4 text-sm font-semibold align-top ${phase.textColor}`}>
                      {vaccine.frequency}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 italic align-top">{vaccine.notes}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
        <div className="bg-gray-50 border-t-2 border-gray-200 px-5 py-4">
          <p className="text-sm text-gray-600">
            <strong>⚠️ Importante:</strong> Este calendario es orientativo. Siempre consultá con un veterinario de El Yagua para un plan de vacunación mas personalizado.
          </p>
        </div>
      </div>
    </div>
  )
}
