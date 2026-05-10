-- Migración 3: agrega columna metodo_pago a pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago TEXT;
