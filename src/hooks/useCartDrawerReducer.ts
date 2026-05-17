import { useReducer } from 'react'
import { OrderFormData, DeliveryType, Cliente } from '@/types'

export type FormErrors = {
  nombre?: string
  telefono?: string
  direccion?: string
}

export type FormTouched = {
  nombre: boolean
  telefono: boolean
  direccion: boolean
}

export type DniState = 'idle' | 'loading' | 'found' | 'notfound'

export interface CartDrawerState {
  // Navigation
  step: 'cart' | 'checkout'

  // Form data
  formData: OrderFormData
  formErrors: FormErrors
  formTouched: FormTouched

  // DNI lookup
  dniState: DniState
  clienteActual: Cliente | undefined
  cupones: any[]
  milestones: any[]
  loadingCupones: boolean

  // Address
  addressSuggestions: string[]
  showAddressSuggestions: boolean
  loadingAddress: boolean

  // Stock validation
  checkingStock: boolean
  stockErrors: string[]

  // YaguaMillas confirmation
  showYaguamillasConfirm: boolean
  yaguamillasConfirmData: { cantidad: number; nombre: string; dni: string }
}

export type CartDrawerAction =
  | { type: 'SET_STEP'; payload: 'cart' | 'checkout' }
  | { type: 'UPDATE_FORM'; payload: Partial<OrderFormData> }
  | { type: 'SET_FORM_ERRORS'; payload: FormErrors }
  | { type: 'SET_TOUCHED'; payload: Partial<FormTouched> }
  | { type: 'SET_DNI_STATE'; payload: DniState }
  | { type: 'SET_CLIENT'; payload: { client: Cliente; cupones: any[]; milestones: any[] } }
  | { type: 'SET_LOADING_CUPONES'; payload: boolean }
  | { type: 'CLEAR_DNI' }
  | { type: 'SET_ADDRESS_SUGGESTIONS'; payload: string[] }
  | { type: 'SET_SHOW_ADDRESS_SUGGESTIONS'; payload: boolean }
  | { type: 'SET_LOADING_ADDRESS'; payload: boolean }
  | { type: 'CLEAR_ADDRESS' }
  | { type: 'SET_CHECKING_STOCK'; payload: boolean }
  | { type: 'SET_STOCK_ERRORS'; payload: string[] }
  | { type: 'SHOW_YAGUAMILLAS_CONFIRM'; payload: { cantidad: number; nombre: string; dni: string } }
  | { type: 'HIDE_YAGUAMILLAS_CONFIRM' }
  | { type: 'RESET' }

const initialState: CartDrawerState = {
  step: 'cart',
  formData: { nombre: '', telefono: '', deliveryType: 'retiro', dni: '', metodoPago: 'debito' },
  formErrors: {},
  formTouched: { nombre: false, telefono: false, direccion: false },
  dniState: 'idle',
  clienteActual: undefined,
  cupones: [],
  milestones: [],
  loadingCupones: false,
  addressSuggestions: [],
  showAddressSuggestions: false,
  loadingAddress: false,
  checkingStock: false,
  stockErrors: [],
  showYaguamillasConfirm: false,
  yaguamillasConfirmData: { cantidad: 0, nombre: '', dni: '' },
}

function cartDrawerReducer(state: CartDrawerState, action: CartDrawerAction): CartDrawerState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload }

    case 'UPDATE_FORM':
      return { ...state, formData: { ...state.formData, ...action.payload } }

    case 'SET_FORM_ERRORS':
      return { ...state, formErrors: action.payload }

    case 'SET_TOUCHED':
      return { ...state, formTouched: { ...state.formTouched, ...action.payload } }

    case 'SET_DNI_STATE':
      return { ...state, dniState: action.payload }

    case 'SET_CLIENT':
      return {
        ...state,
        dniState: 'found',
        clienteActual: action.payload.client,
        cupones: action.payload.cupones,
        milestones: action.payload.milestones,
        loadingCupones: false,
      }

    case 'SET_LOADING_CUPONES':
      return { ...state, loadingCupones: action.payload }

    case 'CLEAR_DNI':
      return {
        ...state,
        dniState: 'idle',
        clienteActual: undefined,
        cupones: [],
        milestones: [],
        loadingCupones: false,
      }

    case 'SET_ADDRESS_SUGGESTIONS':
      return { ...state, addressSuggestions: action.payload }

    case 'SET_SHOW_ADDRESS_SUGGESTIONS':
      return { ...state, showAddressSuggestions: action.payload }

    case 'SET_LOADING_ADDRESS':
      return { ...state, loadingAddress: action.payload }

    case 'CLEAR_ADDRESS':
      return { ...state, addressSuggestions: [], showAddressSuggestions: false, loadingAddress: false }

    case 'SET_CHECKING_STOCK':
      return { ...state, checkingStock: action.payload }

    case 'SET_STOCK_ERRORS':
      return { ...state, stockErrors: action.payload }

    case 'SHOW_YAGUAMILLAS_CONFIRM':
      return { ...state, showYaguamillasConfirm: true, yaguamillasConfirmData: action.payload }

    case 'HIDE_YAGUAMILLAS_CONFIRM':
      return { ...state, showYaguamillasConfirm: false }

    case 'RESET':
      return {
        ...initialState,
        formData: { nombre: '', telefono: '', deliveryType: 'retiro', dni: '', metodoPago: 'debito' },
      }

    default:
      return state
  }
}

export function useCartDrawerReducer() {
  const [state, dispatch] = useReducer(cartDrawerReducer, initialState)

  return { state, dispatch }
}
