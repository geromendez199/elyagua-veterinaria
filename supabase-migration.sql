-- ============================================================
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- 1. Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  dni        TEXT        UNIQUE NOT NULL,
  nombre     TEXT        NOT NULL,
  telefono   TEXT,
  notas      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Columna en pedidos para vincular al cliente
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cliente_dni TEXT;

-- 3. RLS: insertar/actualizar desde el checkout (anónimo)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clientes_anon_insert" ON clientes
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "clientes_anon_update" ON clientes
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 4. Acceso completo para el admin autenticado
CREATE POLICY "clientes_auth_all" ON clientes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
