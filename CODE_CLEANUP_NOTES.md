# Code Cleanup Notes

## Spanish vs English Naming

### Nomenclatura (ACTUAL)
- Archivos: Español (e.g., `/consejos`, `/articulos`)
- Variables de negocio: Español (e.g., `cliente_dni`, `puntos_acumulados`)
- Variables técnicas: Mezcla de español e inglés
- Comentarios: Español

### Estándar propuesto para FUTURO
- **Archivos/URLs:** Español (para SEO y UX local)
- **Variables de negocio:** Español (contexto argentino)
- **Variables técnicas:** Inglés (JavaScript convention)
- **Comentarios:** Inglés (mejor para colaboración internacional)
- **Tipos/Interfaces:** Inglés (TypeScript convention)

### No Cambiar Ahora
Renaming masivo es riesgoso. Mejor hacerlo en:
- Nuevos archivos: seguir estándar
- Refactoring completo de sección: standarizar en el PR
- Generación de documentación: normalizar en docs

## Unused Imports Scan

### Resultados
✅ Todos los imports están siendo usados
- Supabase imports: usados en queries
- React imports: usados en hooks
- Lucide icons: usados en renders
- Utilities: usados en lógica

**No hay limpieza de imports necesaria**

## Comments Inconsistency

### Patrones
- `//` single line comments (OK)
- `/* */` multi-line (OK)
- `// ── Sección (visual separator) (OK)
- Algunos con emojis (INCONSISTENT)

### Recomendación
- Mantener actual (funciona bien)
- Estandarizar solo en refactoring masivo

## File Organization

### Actual (GOOD)
```
src/
├── app/             # Next.js app routes
├── components/      # React components
├── context/         # State management
├── hooks/           # Custom hooks
├── lib/             # Utilities
│   ├── api/        # API helpers
│   ├── validation/ # Zod schemas
│   └── ...
└── types.ts        # TypeScript types
```

**No changes needed. Structure is clean.**

## TODO Items Found

Searched for TODOs in code:
- `TODO: Re-enable after investigating dynamic component issues` (middleware.ts)
- `TODO: Implement live payment processing` (mercado-pago webhook) - OK to leave
- `TODO: Implement when ready` (helper function comments) - OK to leave

## Recommendations

**Priority:** LOW - Code is already quite clean

### Nice to have (if touching code):
1. Remove commented-out code blocks (e.g., old payment logic)
2. Consolidate similar utility functions
3. Document edge cases (e.g., why `.catch()` in middleware)

### Not worth doing:
1. Rename variables to English
2. Reformat comments
3. Reorganize file structure (too risky)

## Summary

✅ Code organization: GOOD
✅ Naming consistency: ACCEPTABLE
✅ Import cleanliness: CLEAN
✅ Comments quality: GOOD
⚠️ Spanish/English mix: ACCEPTABLE (domain vs tech layer)

**Overall:** Code is clean and maintainable. No urgent cleanup needed.
