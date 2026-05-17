import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Cliente } from '@/types'

interface CouponData {
  id: string
  descuento_porcentaje: number
  milestone_millas?: number
  activo: boolean
  [key: string]: any
}

export function useDniLookup() {
  const [dniState, setDniState] = useState<'idle' | 'loading' | 'found' | 'notfound'>('idle')
  const [clienteActual, setClienteActual] = useState<Cliente | undefined>()
  const [cupones, setCupones] = useState<CouponData[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [loadingCupones, setLoadingCupones] = useState(false)

  const handleDniChange = async (value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 8)

    if (sanitized.length < 8) {
      setDniState('idle')
      setClienteActual(undefined)
      setCupones([])
      setMilestones([])
      return
    }

    setDniState('loading')
    setLoadingCupones(true)

    try {
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('*')
        .eq('dni', sanitized)
        .limit(1)

      const found = clienteData?.[0] as Cliente | undefined

      if (found) {
        setDniState('found')
        setClienteActual(found)

        const [cuponesRes, milestonesRes] = await Promise.all([
          supabase.from('cupones').select('*').eq('activo', true),
          supabase.from('milestones').select('*').eq('activo', true).order('millas_requeridas', { ascending: true }),
        ])

        const cuponesActuales = (cuponesRes.data || []).map((c: any) => ({
          ...c,
          descuento_porcentaje: c.descuento_porcentaje || c.porcentaje_descuento,
        }))

        setCupones(cuponesActuales)
        setMilestones(milestonesRes.data || [])
      } else {
        setDniState('notfound')
        setClienteActual(undefined)
        setCupones([])
        setMilestones([])
      }
    } catch {
      setDniState('idle')
      setClienteActual(undefined)
      setCupones([])
      setMilestones([])
    } finally {
      setLoadingCupones(false)
    }
  }

  const clearDni = () => {
    setDniState('idle')
    setClienteActual(undefined)
    setCupones([])
    setMilestones([])
  }

  return {
    dniState,
    clienteActual,
    cupones,
    milestones,
    loadingCupones,
    handleDniChange,
    clearDni,
  }
}
