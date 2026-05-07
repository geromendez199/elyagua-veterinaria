-- Crear tabla productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  categoria TEXT NOT NULL CHECK (categoria IN ('alimentos', 'juguetes', 'remedios', 'accesorios')),
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);

-- Crear tabla contact_info
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  direccion TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  horario_semana TEXT NOT NULL,
  horario_sabado TEXT NOT NULL,
  horario_domingo TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar datos de ejemplo en productos
INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen_url, activo)
VALUES
  ('Alimento Premium para Perros', 'Alimento balanceado de alta calidad para perros adultos', 45.99, 50, 'alimentos', NULL, true),
  ('Alimento para Gatos Adultos', 'Fórmula especial para mantener la salud felina', 38.50, 35, 'alimentos', NULL, true),
  ('Juguete Pelota de Tenis', 'Pelota resistente para perros', 5.99, 100, 'juguetes', NULL, true),
  ('Juguete Interactivo Kong', 'Juguete robusto para masticar', 24.99, 20, 'juguetes', NULL, true),
  ('Antiparasitario Interno', 'Desparasitante para perros y gatos', 15.99, 45, 'remedios', NULL, true),
  ('Vitaminas para Mascotas', 'Complejo vitamínico para mejorar la salud', 19.99, 30, 'remedios', NULL, true),
  ('Collar Ajustable', 'Collar cómodo y duradero', 12.99, 60, 'accesorios', NULL, true),
  ('Correa Extensible', 'Correa de 5 metros para paseos', 22.99, 25, 'accesorios', NULL, true),
  ('Cama Ortopédica', 'Cama cómoda con apoyo especial', 89.99, 10, 'accesorios', NULL, true);

-- Insertar datos de contacto (solo un registro)
INSERT INTO contact_info (direccion, whatsapp, horario_semana, horario_sabado, horario_domingo)
VALUES
  ('Calle Principal 123, Ciudad', '+54 9 1234 567890', 'Lun-Vie: 9:00 AM - 7:00 PM', 'Sábado: 10:00 AM - 6:00 PM', 'Domingo: 10:00 AM - 5:00 PM');

-- Habilitar Row Level Security (opcional pero recomendado)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;

-- Crear políticas públicas de lectura
CREATE POLICY "Productos públicos" ON productos FOR SELECT USING (true);
CREATE POLICY "Contacto público" ON contact_info FOR SELECT USING (true);
