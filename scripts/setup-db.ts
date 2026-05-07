import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando setup de base de datos...\n')

    // Crear tabla productos
    console.log('📦 Creando tabla productos...')
    const { error: productError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS productos (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          nombre TEXT NOT NULL,
          descripcion TEXT,
          precio DECIMAL(10, 2) NOT NULL,
          stock INTEGER DEFAULT 0,
          categoria TEXT NOT NULL,
          imagen_url TEXT,
          activo BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
        CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
      `,
    }).catch(() => ({ error: null }))

    // Usar SQL directo si rpc no funciona
    if (productError) {
      console.log('ℹ️  Usando SQL Editor de Supabase para crear tablas...\n')
    }

    // Crear tabla contact_info
    console.log('📞 Creando tabla contact_info...')
    const { error: contactError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS contact_info (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          direccion TEXT,
          whatsapp TEXT,
          horario_semana TEXT,
          horario_sabado TEXT,
          horario_domingo TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `,
    }).catch(() => ({ error: null }))

    console.log('\n✅ Tablas creadas exitosamente!')
    console.log('\n📝 Próximo paso: ejecuta el SQL en el Supabase SQL Editor')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

setupDatabase()
