'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import { Edit2, Trash2, LogOut, Plus } from 'lucide-react'
import Image from 'next/image'

export default function AdminProductosPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ precio: 0, stock: 0 })
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      router.push('/admin')
      return
    }
    setUser(data.session.user)
    fetchProducts()
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setEditValues({ precio: product.precio, stock: product.stock })
  }

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update({
          precio: editValues.precio,
          stock: editValues.stock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...editValues } : p
        )
      )
      setEditingId(null)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro?')) return

    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image
              src="/logo-blanco.png"
              alt="El Yagua"
              width={150}
              height={40}
              className="h-10 w-auto"
            />
            <h1 className="text-2xl font-bold">Panel Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-primary-dark hover:bg-primary-light px-4 py-2 rounded-lg transition"
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Gestión de Productos</h2>
          <button className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-primary-dark transition">
            <Plus size={20} />
            Nuevo producto
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-primary">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Categoría</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Precio</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Stock</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Activo</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{product.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{product.categoria}</td>
                  <td className="px-4 py-3 text-center">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        value={editValues.precio}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            precio: parseFloat(e.target.value),
                          })
                        }
                        className="w-24 border rounded px-2 py-1 text-center"
                        step="0.01"
                      />
                    ) : (
                      `$${product.precio.toFixed(2)}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        value={editValues.stock}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            stock: parseInt(e.target.value),
                          })
                        }
                        className="w-20 border rounded px-2 py-1 text-center"
                      />
                    ) : (
                      product.stock
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        product.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.activo ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingId === product.id ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleSave(product.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No hay productos.</p>
          </div>
        )}
      </div>
    </div>
  )
}
