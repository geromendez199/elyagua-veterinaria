import { useState } from 'react'

interface OrderFormData {
  nombreCompleto: string
  dni: string
  email: string
  telefono: string
  calle: string
  numero: string
  piso: string
  departamento: string
  localidad: string
  codigoPostal: string
  metodoPago: 'whatsapp' | 'efectivo'
}

interface ValidationErrors {
  [key: string]: string
}

export function useOrderValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateForm = (formData: Partial<OrderFormData>): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.nombreCompleto?.trim()) {
      newErrors.nombreCompleto = 'Nombre requerido'
    }

    if (!formData.dni?.trim() || formData.dni.length < 5) {
      newErrors.dni = 'DNI inválido'
    }

    if (!formData.email?.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.telefono?.trim() || formData.telefono.length < 7) {
      newErrors.telefono = 'Teléfono inválido'
    }

    if (!formData.calle?.trim()) {
      newErrors.calle = 'Calle requerida'
    }

    if (!formData.numero?.trim()) {
      newErrors.numero = 'Número requerido'
    }

    if (!formData.localidad?.trim()) {
      newErrors.localidad = 'Localidad requerida'
    }

    if (!formData.codigoPostal?.trim()) {
      newErrors.codigoPostal = 'Código postal requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const clearErrors = () => {
    setErrors({})
  }

  const getFieldError = (fieldName: string): string => {
    return errors[fieldName] || ''
  }

  return {
    errors,
    validateForm,
    clearErrors,
    getFieldError,
  }
}
