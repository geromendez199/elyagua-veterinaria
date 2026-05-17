/**
 * Optimized Supabase queries with specific field selection
 * and parallel execution where possible
 */

import { supabase } from '@/lib/supabase'
import type { Cliente } from '@/types'

/**
 * Fetch cliente by DNI with loyalty program data
 * Optimized: selects only needed fields + parallel queries
 */
export async function fetchClienteWithLoyalty(dni: string) {
  const [clienteRes, cuponesRes, milestonesRes] = await Promise.all([
    supabase
      .from('clientes')
      .select('id, dni, nombre, telefono, puntos_acumulados')
      .eq('dni', dni)
      .single(),
    supabase
      .from('cupones')
      .select('id, porcentaje_descuento, usado')
      .eq('activo', true),
    supabase
      .from('milestones')
      .select('id, millas_requeridas, descuento_porcentaje')
      .eq('activo', true)
      .order('millas_requeridas', { ascending: true }),
  ])

  return {
    cliente: clienteRes.data,
    cupones: cuponesRes.data || [],
    milestones: milestonesRes.data || [],
    error: clienteRes.error || cuponesRes.error || milestonesRes.error,
  }
}

/**
 * Check product stock availability for multiple products
 * Optimized: batch query with IN clause
 */
export async function checkProductStock(productIds: string[]) {
  if (productIds.length === 0) return { data: [], error: null }

  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, stock')
    .in('id', productIds)

  return { data: data || [], error }
}

/**
 * Fetch active cupones and milestones
 * Used for display in checkout
 */
export async function fetchLoyaltyProgram() {
  const [cuponesRes, milestonesRes] = await Promise.all([
    supabase
      .from('cupones')
      .select('id, porcentaje_descuento')
      .eq('activo', true)
      .limit(1000),
    supabase
      .from('milestones')
      .select('id, millas_requeridas, descuento_porcentaje')
      .eq('activo', true)
      .order('millas_requeridas', { ascending: true }),
  ])

  return {
    cupones: cuponesRes.data || [],
    milestones: milestonesRes.data || [],
    error: cuponesRes.error || milestonesRes.error,
  }
}

/**
 * Fetch cliente points history (for dashboard/history view)
 * Optimized: specific fields + pagination
 */
export async function fetchPuntosHistorial(clienteId: string, limit = 50) {
  const { data, error } = await supabase
    .from('puntos_historial')
    .select('id, tipo, cantidad_puntos, referencia, created_at')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: data || [], error }
}
