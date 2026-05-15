-- ============================================
-- VERIFICAR QUE LA MIGRACION SE EJECUTO CORRECTAMENTE
-- ============================================

-- 1. Verificar que existen las columnas en la tabla clientes
SELECT 'Columnas en clientes' as verificacion;
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'clientes'
AND column_name IN ('puntos_acumulados')
ORDER BY column_name;

-- 2. Verificar que existe la tabla historial_puntos
SELECT 'Tabla historial_puntos' as verificacion;
SELECT table_name FROM information_schema.tables
WHERE table_name = 'historial_puntos';

-- 3. Verificar que existe la columna puntos en productos
SELECT 'Columnas en productos' as verificacion;
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'productos'
AND column_name IN ('puntos', 'presentacion')
ORDER BY column_name;

-- 4. Verificar que existe la función RPC adjust_puntos_manual
SELECT 'Función RPC adjust_puntos_manual' as verificacion;
SELECT routine_name, routine_type FROM information_schema.routines
WHERE routine_name = 'adjust_puntos_manual';

-- 5. Verificar que existe la función RPC add_puntos_from_order
SELECT 'Función RPC add_puntos_from_order' as verificacion;
SELECT routine_name, routine_type FROM information_schema.routines
WHERE routine_name = 'add_puntos_from_order';

-- 6. Probar la función RPC manualmente (opcional)
-- Descomenta la siguiente línea solo si quieres probar la función
-- SELECT * FROM adjust_puntos_manual('TU_UUID_AQUI'::uuid, 10, 'Prueba');
