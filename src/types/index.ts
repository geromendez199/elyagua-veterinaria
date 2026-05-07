export type Category = 'alimentos' | 'juguetes' | 'remedios' | 'accesorios'

export interface Product {
  id: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: Category
  imagen_url: string
  activo: boolean
}

export interface ContactInfo {
  direccion: string
  whatsapp: string
  horario_semana: string
  horario_sabado: string
  horario_domingo: string
}
