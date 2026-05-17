# CartDrawer Refactoring Plan

**Archivo:** `src/components/CartDrawer.tsx`
**Líneas actuales:** 1026
**Objetivo:** Reducir a ~600 líneas mediante extracción de hooks

## Lógica a extraer

### 1. DNI Lookup Logic (líneas ~95-200)
**Responsabilidad:** Buscar cliente por DNI, cargar cupones, cargary milestones

**Reemplazar con:** `useDniLookup()` hook

**Cambios:**
```tsx
// ANTES
const [dniLookup, setDniLookup] = useState<'idle' | 'loading' | 'found' | 'notfound'>('idle')
const [clienteActual, setClienteActual] = useState<Cliente | undefined>()
const handleDniChange = async (value: string) => { /* 100+ líneas */ }

// DESPUÉS
const { dniData, cupones, loadingDni, dniError, lookupDni, clearDni } = useDniLookup()

const handleDniChange = (value: string) => {
  const sanitized = value.replace(/\D/g, '').slice(0, 8)
  setFormData(prev => ({ ...prev, dni: sanitized }))
  if (sanitized.length === 8) lookupDni(sanitized)
  else clearDni()
}
```

### 2. Address Autocomplete (líneas ~250-350)
**Responsabilidad:** Buscar direcciones, sugerir calles

**Reemplazar con:** `useAddressAutocomplete()` hook

**Cambios:**
```tsx
// ANTES
const [addressSuggestions, setAddressSuggestions] = useState([])
const [loadingAddress, setLoadingAddress] = useState(false)
const handleAddressChange = async (value: string) => { /* 50+ líneas */ }

// DESPUÉS
const { addressSuggestions, loadingAddress, searchAddress } = useAddressAutocomplete()

const handleAddressChange = (value: string) => {
  setFormData(prev => ({ ...prev, calle: value }))
  searchAddress(value)
}
```

### 3. Form Validation (líneas ~700-750)
**Responsabilidad:** Validar campos del formulario

**Reemplazar con:** `useOrderValidation()` hook

**Cambios:**
```tsx
// ANTES
const validateForm = () => {
  const newErrors: FormErrors = {}
  if (!formData.nombre.trim()) newErrors.nombre = 'Nombre requerido'
  // ... 20+ validaciones
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

// DESPUÉS
const { errors, validateForm, getFieldError } = useOrderValidation()

// Ya maneja todas las validaciones
const isValid = validateForm(formData)
```

## Líneas de código a eliminar

| Sección | Líneas | Reemplazo |
|---------|--------|-----------|
| DNI Lookup | ~100 | `useDniLookup()` |
| Address Autocomplete | ~50 | `useAddressAutocomplete()` |
| Form Validation | ~50 | `useOrderValidation()` |
| **Total** | **~200** | **3 hooks** |

## Resultado esperado

- **Antes:** 1026 líneas (1 archivo)
- **Después:** ~826 líneas (1 archivo + 3 hooks reusables)
- **Reducción:** ~200 líneas (19%)
- **Ganancia:** Hooks reutilizables en otros componentes

## Implementación

Cambios necesarios en CartDrawer:
1. Import los 3 hooks al inicio
2. Reemplazar los 200+ líneas de lógica con llamadas a hooks
3. Ajustar el manejo de state para integrar los hooks
4. Mantener la lógica de WhatsApp y cupones (específica de CartDrawer)

## Prioridad

**BAJA** - No es crítico, CartDrawer funciona bien. Es una mejora de mantenibilidad.
