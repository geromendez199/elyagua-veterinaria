'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AppliedCoupon {
  codigo: string
  descuento_porcentaje: number
}

interface CouponContextType {
  appliedCoupon: AppliedCoupon | null
  applyCoupon: (codigo: string, descuento_porcentaje: number) => void
  removeCoupon: () => void
  discountPercentage: number
}

const CouponContext = createContext<CouponContextType | undefined>(undefined)

export function CouponProvider({ children }: { children: ReactNode }) {
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)

  const applyCoupon = (codigo: string, descuento_porcentaje: number) => {
    setAppliedCoupon({ codigo, descuento_porcentaje })
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
