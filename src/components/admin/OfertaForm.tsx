'use client'

import { useState, useEffect } from 'react'
import { Oferta, Product } from '@/types'

interface OfertaFormProps {
  oferta?: Oferta
  onSuccess: () => void
  onCancel: () => void
}

export default function OfertaForm({ oferta, onSuccess, onCancel }: OfertaFormProps) {
  const [tipo, setTipo] = useState<'porcentaje' | 'combo'>(oferta?.tipo || 'porcentaje')
  const [titulo, setTitulo] = useState(oferta?.titulo || '')
  const [descripcion, setDescripcion] = useState(oferta?.descripcion || '')
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(
    oferta?.descuento_porcentaje || 0
  )
  const [precioEspecial, setPrecioEspecial] = useState(oferta?.precio_especial || 0)
  const [fechaInicio, setFechaInicio] = useState(
    oferta?.fecha_inicio ? new Date(oferta.fecha_inicio).toISOString().slice(0, 16) : ''
  )
  const [fechaFin, setFechaFin] = useState(
    oferta?.fecha_fin ? new Date(oferta.fecha_fin).toISOString().slice(0, 16) : ''
  )
  const [cantidadMaximaUsos, setCantidadMaximaUsos] = useState(
    oferta?.cantidad_maxima_usos || ''
  )
  const [productos, setProductos] = useState<Array<{ producto_id: string; cantidad?: number }>>(
    oferta?.productos || []
  )
  const [productoSearch, setProductoSearch] = useState('')
  const [disponibles, setDisponibles] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showProductoDropdown, setShowProductoDropdown] = useState(false)

  useEffect(() => {
    fetchProductos()
  }, [])

  async function fetchProductos() {
    try {
      const response = await fetch('/api/productos')
      if (!response.ok) throw new Error('Error fetching productos')
      const { data } = await response.json()
      setDisponibles(data || [])
    } catch (error) {
      console.error('Error fetching productos:', error)
    }
  }

  function addProducto(productoId: string) {
    if (!productos.find((p) => p.producto_id === productoId)) {
      setProductos([
        ...productos,
        { producto_id: productoId, cantidad: tipo === 'combo' ? 1 : undefined },
      ])
    }
    setProductoSearch('')
  }

  function removeProducto(productoId: string) {
    setProductos(productos.filter((p) => p.producto_id !== productoId))
  }

  function updateProductoCantidad(productoId: string, cantidad: number) {
    setProductos(
      productos.map((p) => (p.producto_id === productoId ? { ...p, cantidad } : p))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (productos.length === 0) {
      setError('Debe agregar al menos un producto')
      return
    }

    if (!titulo.trim()) {
      setError('El título es requerido')
      return
    }

    if (!fechaInicio || !fechaFin) {
      setError('Las fechas son requeridas')
      return
    }

    if (new Date(fechaInicio) >= new Date(fechaFin)) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin')
      return
    }

    if (tipo === 'porcentaje' && (!descuentoPorcentaje || descuentoPorcentaje <= 0)) {
      setError('Debe especificar un descuento porcentual válido')
      return
    }

    if (tipo === 'combo' && (!precioEspecial || precioEspecial <= 0)) {
      setError('Debe especificar un precio especial válido para el combo')
      return
    }

    try {
      setLoading(true)
      const payload = {
        tipo,
        titulo,
        descripcion: descripcion || null,
        descuento_porcentaje: tipo === 'porcentaje' ? descuentoPorcentaje : null,
        precio_especial: tipo === 'combo' ? precioEspecial : null,
        fecha_inicio: new Date(fechaInicio).toISOString(),
        fecha_fin: new Date(fechaFin).toISOString(),
        cantidad_maxima_usos: cantidadMaximaUsos ? Number(cantidadMaximaUsos) : null,
        productos,
      }

      const response = await fetch(
        oferta ? `/api/admin/ofertas?id=${oferta.id}` : '/api/admin/ofertas',
        {
          method: oferta ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error saving oferta')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const selectedProductosData = productos
    .map((p) => disponibles.find((prod) => prod.id === p.producto_id))
    .filter(Boolean) as Product[]

  const filteredProductos = disponibles.filter(
    (p) =>
      p.activo &&
      !productos.find((sp) => sp.producto_id === p.id) &&
      (productoSearch ? p.nombre.toLowerCase().includes(productoSearch.toLowerCase()) : true)
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}

      {/* Tipo de Oferta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Oferta
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="porcentaje"
              checked={tipo === 'porcentaje'}
              onChange={(e) => setTipo(e.target.value as 'porcentaje')}
              className="w-4 h-4"
            />
            Descuento por Porcentaje
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="combo"
              checked={tipo === 'combo'}
              onChange={(e) => setTipo(e.target.value as 'combo')}
              className="w-4 h-4"
            />
            Combo (Precio Especial)
          </label>
        </div>
      </div>

      {/* Título y Descripción */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Ej: Gran descuento en medicinas"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Descripción breve de la oferta"
          />
        </div>
      </div>

      {/* Descuento o Precio Especial */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tipo === 'porcentaje' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descuento (%) *
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={descuentoPorcentaje}
              onChange={(e) => setDescuentoPorcentaje(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="10"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio del Combo ($) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={precioEspecial}
              onChange={(e) => setPrecioEspecial(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="5000"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Límite de Usos
          </label>
          <input
            type="number"
            min="0"
            value={cantidadMaximaUsos}
            onChange={(e) => setCantidadMaximaUsos(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Dejar vacío para ilimitado"
          />
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha Inicio *
          </label>
          <input
            type="datetime-local"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha Fin *
          </label>
          <input
            type="datetime-local"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Productos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Productos ({productos.length}) *
        </label>

        {/* Buscar producto */}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Buscar producto para agregar..."
            value={productoSearch}
            onChange={(e) => setProductoSearch(e.target.value)}
            onFocus={() => setShowProductoDropdown(true)}
            onBlur={() => setTimeout(() => setShowProductoDropdown(false), 150)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          {showProductoDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 rounded-lg bg-white shadow-lg z-10 max-h-48 overflow-y-auto">
              {filteredProductos.length > 0 ? (
                filteredProductos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      addProducto(p.id)
                      setShowProductoDropdown(false)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="font-medium">{p.nombre}</div>
                    <div className="text-sm text-gray-500">${p.precio.toLocaleString('es-AR')}</div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500 text-sm">
                  {disponibles.length === 0 ? 'No hay productos disponibles' :
                   productoSearch ? 'No se encontraron productos con ese nombre' :
                   'Todos los productos ya están agregados'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Productos seleccionados */}
        <div className="space-y-2 bg-gray-50 rounded-lg p-3">
          {selectedProductosData.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay productos seleccionados</p>
          ) : (
            selectedProductosData.map((p) => {
              const productoData = productos.find((sp) => sp.producto_id === p.id)
              return (
                <div key={p.id} className="flex justify-between items-center bg-white p-2 rounded gap-2">
                  <div>
                    <p className="font-medium">{p.nombre}</p>
                    <p className="text-sm text-gray-600">${p.precio.toLocaleString('es-AR')}</p>
                  </div>
                  {tipo === 'combo' && (
                    <input
                      type="number"
                      min="1"
                      value={productoData?.cantidad || 1}
                      onChange={(e) =>
                        updateProductoCantidad(p.id, Number(e.target.value))
                      }
                      className="w-12 px-2 py-1 border border-gray-300 rounded text-center"
                      placeholder="Cant."
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeProducto(p.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                  >
                    Quitar
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : oferta ? 'Actualizar' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
