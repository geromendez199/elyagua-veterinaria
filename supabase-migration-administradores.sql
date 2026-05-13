-- Crear tabla administradores
CREATE TABLE IF NOT EXISTS administradores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  telefono TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice en email para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_administradores_email ON administradores(email);

-- Habilitar RLS (Row Level Security)
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;

-- Política: Los administradores pueden ver su propio perfil
CREATE POLICY "Admins can view own profile"
  ON administradores
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

-- Política: Los administradores pueden actualizar su propio perfil
CREATE POLICY "Admins can update own profile"
  ON administradores
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = email)
  WITH CHECK (auth.jwt() ->> 'email' = email);

-- Política: Los administradores pueden insertar su propio perfil
CREATE POLICY "Admins can insert own profile"
  ON administradores
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = email);
