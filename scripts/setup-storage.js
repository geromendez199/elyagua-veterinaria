#!/usr/bin/env node

/**
 * Script para crear buckets de Storage en Supabase
 * Uso: node scripts/setup-storage.js
 *
 * Requiere en .env.local:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Faltan variables de entorno')
  console.error('Asegúrate de tener en .env.local:')
  console.error('  - SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const BUCKETS = [
  {
    name: 'consejos',
    description: 'Imágenes para consejos veterinarios personalizados',
    public: true,
  },
  {
    name: 'info',
    description: 'Imágenes para artículos veterinarios',
    public: true,
  },
  {
    name: 'productos',
    description: 'Imágenes de productos',
    public: true,
  },
]

async function setupStorage() {
  console.log('🚀 Iniciando setup de Storage...\n')

  for (const bucket of BUCKETS) {
    try {
      console.log(`📦 Creando bucket: ${bucket.name}`)

      // Crear bucket
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
      })

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ✅ El bucket "${bucket.name}" ya existe`)
        } else {
          console.error(`   ❌ Error: ${error.message}`)
        }
      } else {
        console.log(`   ✅ Bucket "${bucket.name}" creado exitosamente`)
      }

      // Configurar políticas si es público
      if (bucket.public) {
        // Política SELECT (lectura pública)
        const { error: selectError } = await supabase.auth.admin.createPolicy({
          bucket: bucket.name,
          role: 'authenticated',
          operation: 'SELECT',
          definition: 'true',
        }).catch(() => ({ error: null })) // Ignorar si la API no existe

        // Política INSERT (upload para usuarios autenticados)
        const { error: insertError } = await supabase.auth.admin.createPolicy({
          bucket: bucket.name,
          role: 'authenticated',
          operation: 'INSERT',
          definition: 'true',
        }).catch(() => ({ error: null }))

        console.log(`   🔒 Políticas configuradas para lectura pública`)
      }

      console.log('')
    } catch (error) {
      console.error(`❌ Error al procesar bucket "${bucket.name}":`, error.message)
    }
  }

  console.log('✅ Setup completado!\n')
  console.log('Ahora puedes subir imágenes a:')
  BUCKETS.forEach((b) => {
    console.log(`  • ${b.name}`)
  })
}

setupStorage().catch((error) => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
