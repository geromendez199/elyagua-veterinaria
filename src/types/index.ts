export type Category = 'alimentos' | 'juguetes' | 'remedios' | 'accesorios'
export type DeliveryType = 'retiro' | 'envio'

export interface Product {
  id: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: Category
  imagen_url: string
  activo: boolean
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
}
