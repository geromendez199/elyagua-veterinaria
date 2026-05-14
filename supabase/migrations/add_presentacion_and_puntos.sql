-- Add presentacion field to productos if it doesn't exist
ALTER TABLE productos ADD COLUMN IF NOT EXISTS presentacion TEXT;

-- Add puntos field to productos for loyalty system
ALTER TABLE productos ADD COLUMN IF NOT EXISTS puntos INTEGER DEFAULT 0;

-- Add puntos_acumulados field to clientes for loyalty system
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS puntos_acumulados INTEGER DEFAULT 0;

-- Create historial_puntos table for tracking point transactions
CREATE TABLE IF NOT EXISTS historial_puntos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('compra', 'ajuste_admin', 'canje')),
  cantidad_puntos INTEGER NOT NULL,
  referencia TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_historial_puntos_cliente ON historial_puntos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_historial_puntos_fecha ON historial_puntos(created_at);

-- Create RPC function to add points from order
CREATE OR REPLACE FUNCTION add_puntos_from_order(
  p_cliente_dni TEXT,
  p_pedido_id UUID,
  p_productos JSONB
) RETURNS JSON AS $$
DECLARE
  v_cliente_id UUID;
  v_total_puntos INTEGER := 0;
  v_product JSONB;
BEGIN
  -- Find or create cliente by DNI
  SELECT id INTO v_cliente_id FROM clientes WHERE dni = p_cliente_dni LIMIT 1;

  IF v_cliente_id IS NULL THEN
    INSERT INTO clientes (dni, nombre, puntos_acumulados)
    VALUES (p_cliente_dni, 'Cliente ' || p_cliente_dni, 0)
    RETURNING id INTO v_cliente_id;
  END IF;

  -- Calculate total points from products
  FOR v_product IN SELECT * FROM jsonb_array_elements(p_productos)
  LOOP
    v_total_puntos := v_total_puntos + (COALESCE((v_product->>'puntos')::INTEGER, 0) * COALESCE((v_product->>'cantidad')::INTEGER, 1));
  END LOOP;

  -- Update cliente puntos_acumulados
  UPDATE clientes
  SET puntos_acumulados = puntos_acumulados + v_total_puntos,
      updated_at = now()
  WHERE id = v_cliente_id;

  -- Insert into historial_puntos
  INSERT INTO historial_puntos (cliente_id, tipo, cantidad_puntos, referencia)
  VALUES (v_cliente_id, 'compra', v_total_puntos, p_pedido_id::TEXT);

  RETURN json_build_object(
    'success', true,
    'cliente_id', v_cliente_id,
    'puntos_sumados', v_total_puntos,
    'puntos_totales', (SELECT puntos_acumulados FROM clientes WHERE id = v_cliente_id)
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function to adjust points manually (admin only)
CREATE OR REPLACE FUNCTION adjust_puntos_manual(
  p_cliente_id UUID,
  p_cantidad INTEGER,
  p_motivo TEXT
) RETURNS JSON AS $$
BEGIN
  -- Update cliente puntos_acumulados
  UPDATE clientes
  SET puntos_acumulados = GREATEST(0, puntos_acumulados + p_cantidad),
      updated_at = now()
  WHERE id = p_cliente_id;

  -- Insert into historial_puntos
  INSERT INTO historial_puntos (cliente_id, tipo, cantidad_puntos, referencia)
  VALUES (p_cliente_id, 'ajuste_admin', p_cantidad, p_motivo);

  RETURN json_build_object(
    'success', true,
    'cliente_id', p_cliente_id,
    'puntos_nuevos', (SELECT puntos_acumulados FROM clientes WHERE id = p_cliente_id)
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on historial_puntos (optional - for future audit trail feature)
ALTER TABLE historial_puntos ENABLE ROW LEVEL SECURITY;

-- Create policy for clientes to view their own history (optional - future)
-- CREATE POLICY "clientes_can_view_own_historial" ON historial_puntos
-- FOR SELECT USING (cliente_id = (SELECT id FROM clientes WHERE dni = current_user_id()));
