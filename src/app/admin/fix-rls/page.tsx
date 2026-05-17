'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

const FIX_SQL = `-- Políticas RLS para tabla consejos
-- Permite que el público lea consejos activos
-- Permite que usuarios autenticados hagan CRUD completo

-- Primero, deshabilita las policies existentes si las hay:
DROP POLICY IF EXISTS "Allow public read active consejos" ON consejos;
DROP POLICY IF EXISTS "Allow authenticated read all consejos" ON consejos;
DROP POLICY IF EXISTS "Allow authenticated insert consejos" ON consejos;
DROP POLICY IF EXISTS "Allow authenticated update consejos" ON consejos;
DROP POLICY IF EXISTS "Allow authenticated delete consejos" ON consejos;

-- Habilita RLS
ALTER TABLE consejos ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read of active consejos
CREATE POLICY "Allow public read active consejos"
ON consejos
FOR SELECT
TO public
USING (activo = true);

-- Policy 2: Allow authenticated users to read all consejos (for admin)
CREATE POLICY "Allow authenticated read all consejos"
ON consejos
FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Allow authenticated users to insert consejos
CREATE POLICY "Allow authenticated insert consejos"
ON consejos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 4: Allow authenticated users to update consejos
CREATE POLICY "Allow authenticated update consejos"
ON consejos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 5: Allow authenticated users to delete consejos
CREATE POLICY "Allow authenticated delete consejos"
ON consejos
FOR DELETE
TO authenticated
USING (true);`

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurar RLS para Consejos</h1>
          <p className="text-gray-600 mb-6">
            La tabla de consejos tiene Row Level Security (RLS) habilitado. Necesitas ejecutar estas políticas para que los consejos sean visibles en la web pública y editables en admin.
          </p>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
            <p className="text-amber-800">
              <strong>Problema:</strong> Los consejos no aparecen en /consejos pero sí en /admin. Las políticas RLS bloquean el acceso público.
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
              <li>Ve a <strong>Supabase Dashboard → SQL Editor</strong></li>
              <li>Abre una nueva consulta</li>
              <li>Pega el SQL</li>
              <li>Haz clic en "Ejecutar" (botón azul)</li>
              <li>Espera a que se complete</li>
              <li>Vuelve a la página de Consejos y verifica que aparezcan</li>
            </ol>
          </div>

          <div>
            <a
              href="/consejos"
              className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              → Ver Consejos Públicos
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
