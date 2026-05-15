'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

const MIGRATION_SQL = `-- ===== EJECUTAR ESTE SQL EN SUPABASE SQL EDITOR =====
-- Copia y pega este código en https://app.supabase.com/project/[ID]/sql/new

CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  millas_requeridas INTEGER NOT NULL UNIQUE,
  descuento_porcentaje INTEGER NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_milestones_millas ON milestones(millas_requeridas);

INSERT INTO milestones (millas_requeridas, descuento_porcentaje, activo)
VALUES
  (25, 10, true),
  (50, 20, true),
  (75, 30, true)
ON CONFLICT DO NOTHING;

ALTER TABLE cupones ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES milestones(id);
ALTER TABLE cupones ADD COLUMN IF NOT EXISTS auto_generado BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_cupones_milestone ON cupones(milestone_id);
CREATE INDEX IF NOT EXISTS idx_cupones_auto_generado ON cupones(auto_generado);

CREATE OR REPLACE FUNCTION add_puntos_from_order(
  p_cliente_dni TEXT,
  p_pedido_id UUID,
  p_productos JSONB
) RETURNS JSON AS $$
DECLARE
  v_cliente_id UUID;
  v_total_puntos INTEGER := 0;
  v_producto JSONB;
  v_puntos_anteriores INTEGER;
  v_puntos_nuevos INTEGER;
  v_milestone RECORD;
  v_cupones_generados INTEGER := 0;
BEGIN
  SELECT id INTO v_cliente_id FROM clientes WHERE dni = p_cliente_dni LIMIT 1;

  IF v_cliente_id IS NULL THEN
    INSERT INTO clientes (dni, nombre, puntos_acumulados)
    VALUES (p_cliente_dni, 'Cliente ' || p_cliente_dni, 0)
    RETURNING id INTO v_cliente_id;
  END IF;

  SELECT puntos_acumulados INTO v_puntos_anteriores FROM clientes WHERE id = v_cliente_id;
  v_puntos_anteriores := COALESCE(v_puntos_anteriores, 0);

  FOR v_producto IN SELECT * FROM jsonb_array_elements(p_productos)
  LOOP
    v_total_puntos := v_total_puntos + (COALESCE((v_producto->>'puntos')::INTEGER, 0) * COALESCE((v_producto->>'cantidad')::INTEGER, 1));
  END LOOP;

  UPDATE clientes
  SET puntos_acumulados = puntos_acumulados + v_total_puntos,
      updated_at = now()
  WHERE id = v_cliente_id;

  SELECT puntos_acumulados INTO v_puntos_nuevos FROM clientes WHERE id = v_cliente_id;

  INSERT INTO historial_puntos (cliente_id, tipo, cantidad_puntos, referencia)
  VALUES (v_cliente_id, 'compra', v_total_puntos, p_pedido_id::TEXT);

  FOR v_milestone IN
    SELECT id, millas_requeridas, descuento_porcentaje
    FROM milestones
    WHERE activo = true
    AND millas_requeridas > v_puntos_anteriores
    AND millas_requeridas <= v_puntos_nuevos
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM cupones
      WHERE cliente_id = v_cliente_id
      AND milestone_id = v_milestone.id
      AND usado = false
    ) THEN
      INSERT INTO cupones (cliente_id, codigo, descuento_porcentaje, activo, milestone_id, auto_generado)
      VALUES (
        v_cliente_id,
        'AUTO-' || v_milestone.millas_requeridas || '-' || SUBSTRING(v_cliente_id::TEXT, 1, 8),
        v_milestone.descuento_porcentaje,
        true,
        v_milestone.id,
        true
      );
      v_cupones_generados := v_cupones_generados + 1;
    END IF;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'cliente_id', v_cliente_id,
    'puntos_sumados', v_total_puntos,
    'puntos_totales', v_puntos_nuevos,
    'cupones_generados', v_cupones_generados
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`

export default function SetupDBPage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(MIGRATION_SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurar Hitos de YaguaMillas</h1>
          <p className="text-gray-600 mb-6">
            Necesitas ejecutar el siguiente SQL en tu base de datos Supabase para activar el sistema de hitos automáticos.
          </p>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
            <p className="text-amber-800 text-sm">
              <strong>Pasos:</strong>
              <ol className="list-decimal ml-5 mt-2">
                <li>Copia el SQL a continuación</li>
                <li>Ve a <strong>Supabase Dashboard → SQL Editor</strong></li>
                <li>Crea una nueva query y pega el SQL</li>
                <li>Ejecuta la query</li>
                <li>Recarga la página</li>
              </ol>
            </p>
          </div>

          <div className="relative">
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
              {MIGRATION_SQL}
            </pre>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-900 mb-2">¿Necesitas ayuda?</h3>
            <p className="text-blue-800 text-sm">
              Después de ejecutar el SQL, los hitos estarán configurados con:
            </p>
            <ul className="text-blue-800 text-sm mt-2 ml-4">
              <li>• <strong>25 millas</strong> = 10% descuento</li>
              <li>• <strong>50 millas</strong> = 20% descuento</li>
              <li>• <strong>75 millas</strong> = 30% descuento</li>
            </ul>
            <p className="text-blue-800 text-sm mt-3">
              Una vez configurado, los cupones se generarán automáticamente cuando los clientes acumulen millas.
            </p>
          </div>

          <div className="mt-6">
            <a
              href="/admin/dashboard"
              className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              ← Volver al Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
