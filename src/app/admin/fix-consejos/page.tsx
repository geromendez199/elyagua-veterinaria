'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, Check, AlertCircle, ArrowRight, Eye } from 'lucide-react'

export default function FixConsejos() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [updated, setUpdated] = useState<any[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [allConsejos, setAllConsejos] = useState<any[]>([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadAllConsejos()
  }, [])

  const loadAllConsejos = async () => {
    try {
      const { data, error: err } = await supabase
        .from('consejos')
        .select('id, titulo, categoria, activo')
        .order('categoria')

      if (err) throw err
      setAllConsejos(data || [])
    } catch (err: any) {
      console.error('Error loading consejos:', err)
    }
  }

  const handleFix = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    setUpdated([])

    try {
      const { data: consejos, error: fetchError } = await supabase
        .from('consejos')
        .select('id, titulo, categoria, activo')

      if (fetchError) throw fetchError

      const inactiveConsejos = consejos?.filter(c => !c.activo) || []

      if (inactiveConsejos.length === 0) {
        setMessage('✅ Todos los consejos ya están activos')
        setUpdated(consejos || [])
        setSuccess(true)
        setTimeout(() => router.push('/consejos'), 2000)
        return
      }

      for (const consejo of inactiveConsejos) {
        const { error: updateError } = await supabase
          .from('consejos')
          .update({ activo: true })
          .eq('id', consejo.id)

        if (updateError) throw updateError
      }

      setMessage(`✅ ${inactiveConsejos.length} consejo(s) activado(s)`)
      setUpdated(inactiveConsejos)
      setSuccess(true)
      await loadAllConsejos()
      setTimeout(() => router.push('/consejos'), 2000)
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activar Consejos</h1>
          <p className="text-gray-600 mb-8">
            Actualiza los consejos "Prevencion" y "Nutricion" para que sean visibles en la web.
          </p>

          <button
            onClick={handleFix}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 mb-6"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Check size={20} />
                Activar Ahora
              </>
            )}
          </button>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 font-bold">Error:</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <p className="text-green-700 font-bold">{message}</p>
              {updated.length > 0 && (
                <ul className="mt-3 text-sm text-green-600 space-y-2">
                  {updated.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <Check size={16} />
                      <span>
                        <strong>{item.titulo}</strong> ({item.categoria})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {success && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm text-green-600 mb-3">Redirigiendo a /consejos en 2 segundos...</p>
                  <Link
                    href="/consejos"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition"
                  >
                    Ir a Consejos Ahora
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800 mb-6">
            <p className="font-bold mb-2">Información:</p>
            <ul className="space-y-1 text-xs">
              <li>• Busca todos los consejos inactivos</li>
              <li>• Los marca como activos (activo=true)</li>
              <li>• Aparecerán automáticamente en /consejos</li>
            </ul>
          </div>

          {/* Debug: Show all consejos */}
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 py-2 px-4 border border-gray-300 rounded-lg transition text-sm"
          >
            <Eye size={16} />
            {showAll ? 'Ocultar' : 'Ver'} todos los consejos en la BD
          </button>

          {showAll && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-300 max-h-96 overflow-y-auto">
              <p className="font-bold text-gray-900 mb-3">Total: {allConsejos.length} consejos</p>
              {allConsejos.length === 0 ? (
                <p className="text-gray-600 text-sm">No hay consejos en la BD</p>
              ) : (
                <ul className="space-y-2">
                  {allConsejos.map((c) => (
                    <li key={c.id} className="text-xs bg-white p-2 rounded border border-gray-200">
                      <div className="font-semibold text-gray-900">{c.titulo}</div>
                      <div className="text-gray-600 flex items-center gap-2">
                        <span>Categoría: <strong>{c.categoria}</strong></span>
                        <span>•</span>
                        <span className={c.activo ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                          {c.activo ? '✓ Activo' : '✗ Inactivo'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
