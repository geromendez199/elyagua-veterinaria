# 🔍 AUDITORÍA DE BACKEND - Pre-Lanzamiento Público

**Fecha**: 12 Mayo 2026  
**Estado**: ⚠️ CRÍTICO - Requiere correcciones antes del lanzamiento

---

## 🚨 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. **[CRÍTICO] Endpoint `/api/export-orders` - SIN AUTENTICACIÓN**
- **Ruta**: `src/app/api/export-orders/route.ts`
- **Severidad**: 🔴 CRÍTICA
- **Problema**: Cualquier persona puede acceder a todos los datos sensibles:
  - Nombres completos de clientes
  - Teléfonos
  - DNIs
  - Direcciones domiciliarias
  - Montos de pedidos
  - Estados de órdenes
  - Métodos de pago utilizados
- **Líneas afectadas**: 4-45
- **Acción requerida**: ✅ IMPLEMENTAR INMEDIATAMENTE
  - Añadir verificación de autenticación Supabase
  - Verificar que el usuario es admin
  - Solo permitir a usuarios autenticados

---

## ⚠️ PROBLEMAS DE RIESGO MEDIO

### 2. **Mercado Pago Webhook - Incompleto/Sin Verificación**
- **Ruta**: `src/app/api/mercado-pago/webhook/route.ts`
- **Severidad**: 🟡 MEDIA (Actual: No implementado)
- **Problema**: Si se implementa, necesita:
  - Verificación de firma del webhook (MP_WEBHOOK_SECRET)
  - Validación de datos antes de actualizar BD
  - No procesa pagos aún (todos los TODOs)
- **Acción requerida**: ✅ Completar antes de habilitar pagos

### 3. **Validaciones de Input - Búsqueda**
- **Ruta**: `src/app/api/search/route.ts`
- **Severidad**: 🟢 BAJO (Mitigado por Supabase)
- **Problema**: Validación mínima de búsqueda
- **Estado**: ✅ MITIGADO - Supabase maneja parametrización segura
- **Nota**: Rate limiting está activo (60 req/min)

---

## ✅ CONTROLES BIEN IMPLEMENTADOS

### Autenticación Admin
- ✅ Login requiere email/contraseña (Supabase Auth)
- ✅ Todas las páginas admin (`/admin/*`) usan `supabase.auth.getUser()`
- ✅ Redirect a `/admin` si no autenticado

### Rate Limiting
- ✅ `/api/search` - 60 req/min por IP
- ✅ `/api/validate-address` - 30 req/min por IP
- ✅ Middleware custom en `src/lib/rate-limit.ts`

### Seguridad de Datos
- ✅ CSV export usa quoted strings para evitar CSV injection
- ✅ Direcciones geocodificadas con API Argentina oficial
- ✅ Audit logging en `src/lib/audit-log.ts`

### Validaciones
- ✅ Dirección: mínimo 5 caracteres
- ✅ Búsqueda: mínimo 2 caracteres
- ✅ Stock: uso de función atómica `decrement_stock()`

---

## 🗄️ ESTADO DE SUPABASE RLS

### Tablas verificadas:
- ✅ **clientes**: RLS habilitado, anon puede insertar/actualizar (para checkout)
- ✅ **pedidos**: RLS habilitado, anon puede insertar, auth puede leer/actualizar/eliminar
- ✅ **productos**: Sin RLS explícito (datos públicos)
- ⚠️ **cupones**: RLS recientemente añadido (migration-4.sql) - Verificar en producción
- ✅ **audit_logs**: Creada, registro de cambios activo

---

## 📋 CHECKLIST PRE-LANZAMIENTO

- [ ] **URGENTE**: Arreglar autenticación en `/api/export-orders`
- [ ] Verificar variables de entorno están configuradas (.env.local en Vercel)
- [ ] Probar RLS policies en Supabase (especialmente cupones después migration)
- [ ] Verificar rate limiting funciona en producción
- [ ] Test: Intentar acceder a `/api/export-orders` sin autenticación (debe fallar)
- [ ] Test: Verificar que cupones se guardan correctamente después migration
- [ ] Test: Completar flujo checkout completo (carrito → cupón → pedido)
- [ ] Revisar logs de Vercel para errores 500
- [ ] Verificar caché de búsqueda no expone datos sensibles
- [ ] Confirmar que NEXT_PUBLIC_* vars no contienen secrets

---

## 🔐 RECOMENDACIONES ADICIONALES

1. **Implementar logging de intentos de acceso no autorizado**
2. **Considerar agregar 2FA para admin después del lanzamiento**
3. **Hacer audit mensual de audit_logs para anomalías**
4. **Implementar webhook de Mercado Pago correctamente cuando esté listo**
5. **Considerar agregar CORS headers si hay integración con terceros**

---

## 📊 RESUMEN

| Aspecto | Estado | Prioridad |
|---------|--------|-----------|
| Autenticación Admin | ✅ OK | Normal |
| API Export | 🔴 CRÍTICO | ALTA |
| Rate Limiting | ✅ OK | Normal |
| Validaciones | ✅ OK | Normal |
| RLS Supabase | ✅ OK | Normal |
| Cupones | ⚠️ Necesita test | ALTA |

**Conclusión**: No lanzar hasta arreglar `/api/export-orders`
