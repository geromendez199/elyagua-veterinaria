-- Create milestones table for automatic coupon generation
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  millas_requeridas INTEGER NOT NULL UNIQUE,
  descuento_porcentaje INTEGER NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_milestones_millas ON milestones(millas_requeridas);

-- Insert default milestones
INSERT INTO milestones (millas_requeridas, descuento_porcentaje, activo)
VALUES
  (25, 10, true),
  (50, 20, true),
  (75, 30, true)
ON CONFLICT DO NOTHING;

-- Add milestone_id column to cupones to track auto-generated coupons
ALTER TABLE cupones ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES milestones(id);
ALTER TABLE cupones ADD COLUMN IF NOT EXISTS auto_generado BOOLEAN DEFAULT false;

-- Create index for milestone tracking
CREATE INDEX IF NOT EXISTS idx_cupones_milestone ON cupones(milestone_id);
CREATE INDEX IF NOT EXISTS idx_cupones_auto_generado ON cupones(auto_generado);

-- Updated RPC function to handle milestone-based coupon generation
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
  -- Find or create cliente by DNI
  SELECT id INTO v_cliente_id FROM clientes WHERE dni = p_cliente_dni LIMIT 1;

  IF v_cliente_id IS NULL THEN
    INSERT INTO clientes (dni, nombre, puntos_acumulados)
    VALUES (p_cliente_dni, 'Cliente ' || p_cliente_dni, 0)
    RETURNING id INTO v_cliente_id;
  END IF;

  -- Get previous points
  SELECT puntos_acumulados INTO v_puntos_anteriores FROM clientes WHERE id = v_cliente_id;
  v_puntos_anteriores := COALESCE(v_puntos_anteriores, 0);

  -- Calculate total points from products
  FOR v_producto IN SELECT * FROM jsonb_array_elements(p_productos)
  LOOP
    v_total_puntos := v_total_puntos + (COALESCE((v_producto->>'puntos')::INTEGER, 0) * COALESCE((v_producto->>'cantidad')::INTEGER, 1));
  END LOOP;

  -- Update cliente puntos_acumulados
  UPDATE clientes
  SET puntos_acumulados = puntos_acumulados + v_total_puntos,
      updated_at = now()
  WHERE id = v_cliente_id;

  -- Get new total points
  SELECT puntos_acumulados INTO v_puntos_nuevos FROM clientes WHERE id = v_cliente_id;

  -- Insert into historial_puntos
  INSERT INTO historial_puntos (cliente_id, tipo, cantidad_puntos, referencia)
  VALUES (v_cliente_id, 'compra', v_total_puntos, p_pedido_id::TEXT);

  -- Check for milestones reached
  FOR v_milestone IN
    SELECT id, millas_requeridas, descuento_porcentaje
    FROM milestones
    WHERE activo = true
    AND millas_requeridas > v_puntos_anteriores
    AND millas_requeridas <= v_puntos_nuevos
  LOOP
    -- Check if coupon for this milestone already exists and is unused
    IF NOT EXISTS (
      SELECT 1 FROM cupones
      WHERE cliente_id = v_cliente_id
      AND milestone_id = v_milestone.id
      AND usado = false
    ) THEN
      -- Generate coupon for this milestone
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
