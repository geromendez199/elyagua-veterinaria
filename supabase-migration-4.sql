-- Migration 4: Renombra columna descuento a descuento_porcentaje en cupones
ALTER TABLE cupones RENAME COLUMN descuento TO descuento_porcentaje;

-- Habilitar RLS en cupones si no está habilitado
ALTER TABLE cupones ENABLE ROW LEVEL SECURITY;

-- Permitir que usuarios anónimos (clientes) puedan leer cupones activos
CREATE POLICY "cupones_anon_select" ON cupones
  FOR SELECT TO anon USING (activo = true);

-- Permitir que usuarios autenticados (admin) puedan hacer todo
CREATE POLICY "cupones_auth_all" ON cupones
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
