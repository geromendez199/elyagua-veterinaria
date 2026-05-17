# CartDrawer State Management

**Problema:** El CartDrawer tiene 13+ hooks de estado que son difíciles de trackear.

## Estado actual (fragmentado)

```tsx
// Pasos
const [step, setStep] = useState<'cart' | 'checkout'>('cart')

// Form data
const [formData, setFormData] = useState<OrderFormData>({...})
const [errors, setErrors] = useState<FormErrors>({})
const [touched, setTouched] = useState<FormTouched>({...})

// Coupons
const [clienteCupones, setClienteCupones] = useState<any[]>([])
const [loadingCupones, setLoadingCupones] = useState(false)
const [milestones, setMilestones] = useState<any[]>([])

// Stock validation
const [checkingStock, setCheckingStock] = useState(false)
const [stockErrors, setStockErrors] = useState<string[]>([])

// DNI lookup
const [dniLookup, setDniLookup] = useState<'idle' | 'loading' | 'found' | 'notfound'>('idle')
const [clienteActual, setClienteActual] = useState<Cliente | undefined>()

// Address autocomplete
const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
const [loadingAddress, setLoadingAddress] = useState(false)

// Payment
const [sending, setSending] = useState(false)

// YaguaMillas
const [yaguamillasConfirmData, setYaguamillasConfirmData] = useState({...})
const [showYaguamillasConfirm, setShowYaguamillasConfirm] = useState(false)
```

## Solución: useReducer

```tsx
interface CartDrawerState {
  step: 'cart' | 'checkout'
  formData: OrderFormData
  formErrors: FormErrors
  formTouched: FormTouched
  ui: {
    loading: 'idle' | 'stock' | 'dni' | 'address' | 'payment'
    errors: string[]
  }
  client: {
    data: Cliente | null
    coupons: Coupon[]
    milestones: Milestone[]
  }
  address: {
    suggestions: AddressSuggestion[]
  }
  yaguamillas: {
    show: boolean
    data: YaguaMillasData | null
  }
}

type CartDrawerAction = 
  | { type: 'SET_STEP'; payload: 'cart' | 'checkout' }
  | { type: 'UPDATE_FORM'; payload: Partial<OrderFormData> }
  | { type: 'SET_FORM_ERROR'; payload: FormErrors }
  | { type: 'SET_LOADING'; payload: 'idle' | 'stock' | 'dni' | 'address' | 'payment' }
  | { type: 'SET_CLIENT'; payload: { data: Cliente; coupons: Coupon[]; milestones: Milestone[] } }
  | { type: 'SHOW_YAGUAMILLAS'; payload: YaguaMillasData }
  | { type: 'CLEAR_CLIENT' }
  | { type: 'RESET' }
```

## Beneficio

- De 13 hooks → 1 reducer + context
- Flujo de state claro y predecible
- Transiciones de estado seguras
- Fácil debuggear qué pasó
- Reutilizable en otros componentes

## Implementación

**Prioridad:** BAJA
**Esfuerzo:** 4-6 horas
**Impacto:** Mantenibilidad++
