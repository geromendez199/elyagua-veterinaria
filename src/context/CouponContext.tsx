'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AppliedCoupon {
  id: string
  descuento_porcentaje: number
  milestone_millas?: number
}

interface CouponContextType {
  appliedCoupon: AppliedCoupon | null
  applyCoupon: (id: string, descuento_porcentaje: number, milestone_millas?: number) => void
  removeCoupon: () => void
  discountPercentage: number
}

const CouponContext = createContext<CouponContextType | undefined>(undefined)

export function CouponProvider({ children }: { children: ReactNode }) {
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)

  const applyCoupon = (id: string, descuento_porcentaje: number, milestone_millas?: number) => {
    setAppliedCoupon({ id, descuento_porcentaje, milestone_millas })
  }

  const removeCoupon = () => setAppliedCoupon(null)

  return (
    <CouponContext.Provider value={{ appliedCoupon, applyCoupon, removeCoupon, discountPercentage: appliedCoupon?.descuento_porcentaje || 0 }}>
      {children}
    </CouponContext.Provider>
  )
}

export function useCoupon() {
  const context = useContext(CouponContext)
  if (context === undefined) throw new Error('useCoupon debe usarse dentro de CouponProvider')
  return context
}
