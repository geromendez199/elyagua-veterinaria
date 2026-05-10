-- ============================================================
-- Migration 2 — Ejecutar en Supabase → SQL Editor
-- ============================================================

-- 1. Habilitar Realtime en la tabla pedidos
--    (necesario para que los nuevos pedidos aparezcan en tiempo real
--    en el panel admin sin tener que hacer F5)
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;

-- 2. RLS para pedidos
--    SIN esto, el admin no puede actualizar ni eliminar pedidos
--    (las operaciones fallan silenciosamente y se revierten al recargar).
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Clientes anónimos pueden crear pedidos desde el checkout
CREATE POLICY "pedidos_anon_insert" ON pedidos
  FOR INSERT TO anon WITH CHECK (true);

-- El admin autenticado puede leer, actualizar y eliminar pedidos
CREATE POLICY "pedidos_auth_all" ON pedidos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- También permitir lectura anónima del propio pedido (opcional, para futuros usos)
-- CREATE POLICY "pedidos_anon_select" ON pedidos FOR SELECT TO anon USING (true);

-- 3. Función atómica para decrementar stock
--    Se llama desde el admin al CONFIRMAR un pedido.
--    Usa GREATEST(0, ...) para nunca dejar stock negativo.
CREATE OR REPLACE FUNCTION decrement_stock(p_id UUID, p_amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE productos
  SET stock      = GREATEST(0, stock - p_amount),
      updated_at = NOW()
  WHERE id = p_id;
END;
$$;

-- 4. RLS: permitir que usuarios autenticados (admin) llamen al RPC
GRANT EXECUTE ON FUNCTION decrement_stock(UUID, INT) TO authenticated;

-- ============================================================
-- Verificación rápida (opcional)
-- ============================================================
-- SELECT stock FROM productos WHERE id = '<uuid-de-prueba>';
-- SELECT decrement_stock('<uuid-de-prueba>', 1);
-- SELECT stock FROM productos WHERE id = '<uuid-de-prueba>';
