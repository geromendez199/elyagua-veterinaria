import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchLoyaltyProgram } from '@/lib/supabase-queries'
import { Cliente } from '@/types'

interface CouponData {
  id: string
  porcentaje_descuento: number
  milestone_millas?: number
}

interface Milestone {
  id: string
  millas_requeridas: number
  descuento_porcentaje: number
}

export function useDniLookup() {
  const [dniState, setDniState] = useState<'idle' | 'loading' | 'found' | 'notfound'>('idle')
  const [clienteActual, setClienteActual] = useState<Cliente | undefined>()
  const [cupones, setCupones] = useState<CouponData[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
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
      // Optimized: fetch cliente with specific fields
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('id, dni, nombre, telefono, notas, puntos_acumulados, created_at, updated_at')
        .eq('dni', sanitized)
        .single()

      if (clienteData) {
        setDniState('found')
        setClienteActual(clienteData as Cliente)

        // Fetch loyalty program data (optimized with utility function)
        const { cupones: cuponesData, milestones: milestonesData } = await fetchLoyaltyProgram()
        setCupones(cuponesData as CouponData[])
        setMilestones(milestonesData as Milestone[])
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
