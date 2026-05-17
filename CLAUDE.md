# Instrucciones para Claude Code

## ⚠️ REGLA PRINCIPAL
**NO modificar código existente que ya funciona a menos que sea explícitamente solicitado.**

Solo tocar:
- Lo que el usuario específicamente pide arreglado
- Lo que el usuario pide agregar
- Errores de compilación/TypeScript que rompen la build

## Ramas de desarrollo
- Trabajar en: `main`
- Hacer merge de cambios completados a `main`
- Mantener `main` como rama actual (current)

## Commits
- Usar commits claros y descriptivos
- Incluir URL de sesión al final del mensaje
- Hacer push después de cada commit importante

## Cambios permitidos solo si:
1. El usuario lo pide explícitamente
2. Hay error de TypeScript/compilación
3. El código propuesto por el usuario tiene un bug obvio

## Cambios PROHIBIDOS sin permiso
- Agregar features nuevas
- Refactorizar código existente
- Reescribir componentes
- Cambiar estilos de cosas que funcionan
- Reorganizar archivos o estructura

## Arquitectura de datos - Contenido Educativo

### Tablas y su propósito
- **`articulos`** (tabla principal de contenido)
  - Admin: `/admin/info` - Crear/editar artículos
  - Público: `/consejos` - Ver artículos (usando `/api/articulos`)
  - Categorías: Nutrición, Salud, Prevención, Cuidados, General

- **`consejos`** (tabla legacy, no usada actualmente)
  - Admin: `/admin/consejos` - Para management futuro
  - Categorías: vacunacion, emergencias, alimentos_permitidos, prevencion, nutricion
  - NO se muestra en página pública

### Flujo actual
1. User crea artículo en `/admin/info`
2. Artículo se guarda en tabla `articulos` con `activo=true`
3. API endpoint `/api/articulos` trae artículos activos
4. Página `/consejos` muestra estos artículos

### APIs
- `/api/articulos` - Trae artículos activos (usa tabla `articulos`)
- `/api/consejos` - Disponible pero tabla vacía (para futuro)
- `/api/admin/*` - Endpoints protegidos con autenticación
