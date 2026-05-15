-- Create mascotas table
CREATE TABLE IF NOT EXISTS mascotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  especie TEXT NOT NULL, -- 'perro', 'gato', 'otro'
  raza TEXT,
  edad TEXT,
  color TEXT,
  peso TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_mascotas_cliente ON mascotas(cliente_id);
