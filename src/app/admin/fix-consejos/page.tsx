'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'

export default function FixConsejos() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleFix = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/fix-consejos')
      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Error desconocido')
      } else {
        setResult(data)
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Arreglar Consejos</h1>
          <p className="text-gray-600 mb-6">
            Esta herramienta actualiza los consejos "Prevencion" y "Nutricion" para que sean visibles en la web.
          </p>

          <button
            onClick={handleFix}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Check size={20} />
                Activar Consejos
              </>
            )}
          </button>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-semibold">Error:</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-semibold mb-2">✅ {result.message}</p>
              {result.updated && (
                <ul className="text-sm text-green-600 space-y-1">
                  {result.updated.map((item: any) => (
                    <li key={item.id}>
                      • {item.titulo} ({item.categoria})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Qué hace:</strong> Busca todos los consejos con categoría "Prevencion" o "Nutricion" y los marca como activos (activo=true) para que aparezcan en la página de Consejos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
