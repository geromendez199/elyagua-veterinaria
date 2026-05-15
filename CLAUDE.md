# Instrucciones para Claude Code

## ⚠️ REGLA PRINCIPAL
**NO modificar código existente que ya funciona a menos que sea explícitamente solicitado.**

Solo tocar:
- Lo que el usuario específicamente pide arreglado
- Lo que el usuario pide agregar
- Errores de compilación/TypeScript que rompen la build

## Ramas de desarrollo
- Trabajar SIEMPRE en: `claude/check-vaccination-plan-dqvaz`
- NO hacer cambios en `main`

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
