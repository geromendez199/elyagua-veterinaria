'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugDNI() {
  const [dni, setDni] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    const sanitized = dni.replace(/\D/g, '').slice(0, 8)

    try {
      const { data: allClientes } = await supabase
        .from('clientes')
        .select('id, dni, nombre, puntos_acumulados')

      const { data: found, error: err } = await supabase
        .from('clientes')
        .select('*')
        .eq('dni', sanitized)
        .single()

      setResults({
        searchedFor: sanitized,
        allClientes: allClientes || [],
        found: found,
        error: err?.message || 'No error',
      })
    } catch (err: any) {
      setResults({
        searchedFor: sanitized,
        error: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Debug DNI Search</h1>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ingresa DNI"
              className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 text-lg"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-primary text-white px-6 py-2 rounded-lg font-bold"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {results && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-bold text-blue-900">Buscaste por DNI: <code>{results.searchedFor}</code></p>
                {results.found ? (
                  <div className="mt-2 text-green-700">
                    ✅ <strong>ENCONTRADO:</strong>
                    <pre className="bg-white p-2 rounded mt-1 text-xs overflow-auto">
                      {JSON.stringify(results.found, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="mt-2 text-red-700">
                    ❌ <strong>NO ENCONTRADO</strong>
                    <p className="text-sm">Error: {results.error}</p>
                  </div>
                )}
              </div>

              {results.allClientes.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="font-bold mb-3">Todos los clientes en la BD ({results.allClientes.length}):</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {results.allClientes.map((c: any) => (
                      <div
                        key={c.id}
                        className={`p-2 rounded text-sm ${
                          c.dni === results.searchedFor ? 'bg-green-100 border-2 border-green-300' : 'bg-white border border-gray-200'
                        }`}
                      >
                        <strong>{c.nombre}</strong> - DNI: <code>{c.dni}</code> - {c.puntos_acumulados} puntos
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
