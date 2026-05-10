-- ============================================================
-- Migration 2 — Ejecutar en Supabase → SQL Editor
-- ============================================================

-- 1. Habilitar Realtime en la tabla pedidos
--    (necesario para que los nuevos pedidos aparezcan en tiempo real
--    en el panel admin sin tener que hacer F5)
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;

-- 2. Función atómica para decrementar stock
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

-- 3. RLS: permitir que usuarios autenticados (admin) llamen al RPC
GRANT EXECUTE ON FUNCTION decrement_stock(UUID, INT) TO authenticated;

-- ============================================================
-- Verificación rápida (opcional)
-- ============================================================
-- SELECT stock FROM productos WHERE id = '<uuid-de-prueba>';
-- SELECT decrement_stock('<uuid-de-prueba>', 1);
-- SELECT stock FROM productos WHERE id = '<uuid-de-prueba>';
