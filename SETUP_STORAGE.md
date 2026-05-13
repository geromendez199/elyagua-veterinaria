# Setup de Storage en Supabase

Este script crea automáticamente los buckets necesarios para almacenar imágenes en tu proyecto Supabase.

## Pasos:

### 1. Obtén tu Service Role Key

1. Ve a **Supabase Dashboard** → tu proyecto
2. **Settings** → **API**
3. Copia la **Service Role** key (la que dice "secret" - ⚠️ NO la anon key)

### 2. Agrega las credenciales a `.env.local`

Abre `.env.local` y asegúrate de tener:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Ejecuta el script

```bash
node scripts/setup-storage.js
```

O si prefieres con npm:

```bash
npm run setup:storage
```

## ¿Qué hace el script?

✅ Crea 3 buckets de Storage:
- `consejos` - Para imágenes de consejos veterinarios
- `info` - Para imágenes de artículos
- `productos` - Para imágenes de productos

✅ Configura los buckets como públicos (para que las imágenes sean visibles)

✅ Configura políticas de acceso

## Después de ejecutar

Deberías ver algo como:

```
🚀 Iniciando setup de Storage...

📦 Creando bucket: consejos
   ✅ Bucket "consejos" creado exitosamente
   🔒 Políticas configuradas para lectura pública

📦 Creando bucket: info
   ✅ Bucket "info" creado exitosamente
   🔒 Políticas configuradas para lectura pública

📦 Creando bucket: productos
   ✅ Bucket "productos" creado exitosamente
   🔒 Políticas configuradas para lectura pública

✅ Setup completado!
```

Ahora puedes subir imágenes sin problemas! 🎉

## Troubleshooting

**Error: "Bucket not found"**
- Ejecuta este script de nuevo
- Verifica que tengas la Service Role Key correcta (no la anon key)

**Error: "ENOENT: no such file or directory, open '.env.local'"**
- Asegúrate de estar en la raíz del proyecto
- O crea el archivo `.env.local` primero con tus credenciales

**¿Cómo verifico que funcionó?**
- Ve a Supabase Dashboard → Storage
- Deberías ver los 3 buckets listados
