-- Add cupón_id column to pedidos table if it doesn't exist
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS cupón_id UUID REFERENCES cupones(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pedidos_cupón ON pedidos(cupón_id);
