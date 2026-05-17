import { useState } from 'react'

interface ClientData {
  id: string
  nombre: string
  puntos_acumulados: number
  cliente_encontrado: boolean
}

interface CouponData {
  id: string
  descuento_porcentaje: number
  milestone_millas?: number
}

export function useDniLookup() {
  const [dniData, setDniData] = useState<ClientData | null>(null)
  const [cupones, setCupones] = useState<CouponData[]>([])
  const [loadingDni, setLoadingDni] = useState(false)
  const [dniError, setDniError] = useState('')

  const lookupDni = async (dni: string) => {
    if (!dni || dni.length < 5) {
      setDniError('DNI inválido')
      setDniData(null)
      setCupones([])
      return
    }

    setLoadingDni(true)
    setDniError('')

    try {
      const pointsRes = await fetch(`/api/clientes/puntos?dni=${dni}`)
      const pointsData = await pointsRes.json()

      if (pointsData.success) {
        setDniData({
          id: pointsData.cliente_id || '',
          nombre: pointsData.nombre || 'Cliente',
          puntos_acumulados: pointsData.puntos_acumulados || 0,
          cliente_encontrado: pointsData.cliente_encontrado,
        })

        // Fetch coupons for this client
        if (pointsData.cliente_encontrado && pointsData.cliente_id) {
          const couponRes = await fetch(`/api/admin/cupones?cliente_id=${pointsData.cliente_id}`)
          const couponData = await couponRes.json()

          if (couponData.success && couponData.cupones) {
            setCupones(
              couponData.cupones.map((c: any) => ({
                id: c.id,
                descuento_porcentaje: c.porcentaje_descuento || c.descuento_porcentaje,
                milestone_millas: c.yaguamillas_requeridos,
              }))
            )
          }
        } else {
          setCupones([])
        }
      } else {
        setDniError(pointsData.error || 'Error al buscar cliente')
        setDniData(null)
        setCupones([])
      }
    } catch (err) {
      setDniError('Error buscando cliente')
      setDniData(null)
      setCupones([])
    } finally {
      setLoadingDni(false)
    }
  }

  const clearDni = () => {
    setDniData(null)
    setCupones([])
    setDniError('')
  }

  return {
    dniData,
    cupones,
    loadingDni,
    dniError,
    lookupDni,
    clearDni,
  }
}
