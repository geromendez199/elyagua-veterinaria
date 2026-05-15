'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

const FIX_SQL = `-- Deshabilitar RLS en tabla milestones
ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;

-- Si necesitas volver a habilitarlo, ejecuta:
-- ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;`

export default function FixRLSPage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(FIX_SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Arreglar Error de RLS</h1>
          <p className="text-gray-600 mb-6">
            La tabla de milestones tiene Row Level Security (RLS) habilitado. Necesitas deshabilitar RLS para que funcione correctamente.
          </p>

          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-800">
              <strong>Error:</strong> "new row violates row-level security policy for table 'milestones'"
            </p>
          </div>

          <div className="relative mb-6">
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
            >
              {copied ? (
                <>
                  <Check size={16} /> Copiado
                </>
              ) : (
                <>
                  <Copy size={16} /> Copiar SQL
                </>
              )}
            </button>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-xs leading-relaxed pt-12">
              {FIX_SQL}
            </pre>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-blue-900 mb-2">Pasos:</h3>
            <ol className="text-blue-800 text-sm list-decimal ml-5">
              <li>Copia el SQL (botón azul arriba)</li>
              <li>Ve a <strong>Supabase → SQL Editor</strong></li>
              <li>Pega y ejecuta el SQL</li>
              <li>Vuelve al Centro de Control YaguaMillas</li>
              <li>Intenta guardar el hito de nuevo</li>
            </ol>
          </div>

          <div>
            <a
              href="/admin/yaguamillas-control"
              className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              ← Volver al Centro de Control
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
