export type Category = 'alimentos' | 'juguetes' | 'medicamentos' | 'accesorios'
export type DeliveryType = 'retiro' | 'envio'

export interface Product {
  id: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: Category
  imagen_url?: string | null
  activo: boolean
  presentacion?: string
  laboratorio?: string
  puntos?: number
  created_at?: string
  updated_at?: string
}

export interface ContactInfo {
  direccion: string
  whatsapp: string
  horario_semana: string
  horario_sabado: string
  horario_domingo: string
}

export interface OrderFormData {
  nombre: string
  telefono: string
  deliveryType: DeliveryType
  direccion?: string
  dni?: string
  metodoPago?: 'efectivo' | 'debito' | 'credito' | 'transferencia'
}

export interface Cliente {
  id: string
  dni: string
  nombre: string
  telefono: string | null
  notas: string | null
  puntos_acumulados?: number
  created_at: string
  updated_at: string
}

// Loyalty Points System
export type PuntosHistorialTipo = 'compra' | 'ajuste_admin' | 'canje'

export interface PuntosHistorial {
  id: string
  cliente_id: string
  tipo: PuntosHistorialTipo
  cantidad_puntos: number
  referencia: string | null
  created_at: string
}

export type ArticuloCategoria = 'Nutrición' | 'Salud' | 'Prevención' | 'Cuidados' | 'General'

export interface Articulo {
  id: string
  titulo: string
  slug: string
  resumen: string
  contenido: string
  imagen_url: string | null
  autor: string
  categoria: ArticuloCategoria
  activo: boolean
  created_at: string
  updated_at: string
}

// Consejos (veterinary advice system)
export type ConsejoTipoMascota = 'perro' | 'gato' | 'ambos'
export type ConsejoCategoria =
  | 'vacunacion'
  | 'castracion'
  | 'alimentos_prohibidos'
  | 'alimentos_permitidos'
  | 'emergencias'
  | 'comportamiento'
  | 'higiene'

export interface Consejo {
  id: string
  titulo: string
  contenido: string
  imagen_url: string | null
  tipo_mascota: ConsejoTipoMascota
  edad_minima: number
  edad_maxima: number | null
  categoria: ConsejoCategoria
  orden: number
  activo: boolean
  created_at: string
  updated_at: string
}

// Category metadata for UI
export const CONSEJO_CATEGORIES = {
  vacunacion: { label: 'Calendario de Vacunación', icon: '💉', color: 'blue' },
  castracion: { label: 'Castración', icon: '✂️', color: 'rose' },
  alimentos_prohibidos: { label: 'Alimentos ❌', icon: '🚫', color: 'red' },
  alimentos_permitidos: { label: 'Alimentos ✅', icon: '✅', color: 'green' },
  emergencias: { label: 'Emergencias', icon: '🆘', color: 'orange' },
  comportamiento: { label: 'Comportamiento', icon: '🐾', color: 'purple' },
  higiene: { label: 'Higiene', icon: '🛁', color: 'cyan' },
} as const