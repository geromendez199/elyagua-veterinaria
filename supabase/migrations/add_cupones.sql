-- Create cupones table
CREATE TABLE IF NOT EXISTS cupones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  yaguamillas_requeridos INTEGER DEFAULT 100,
  porcentaje_descuento INTEGER DEFAULT 10,
  usado BOOLEAN DEFAULT false,
  usado_en_pedido UUID REFERENCES pedidos(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cupones_cliente ON cupones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cupones_usado ON cupones(usado);

-- Disable RLS
ALTER TABLE cupones DISABLE ROW LEVEL SECURITY;
