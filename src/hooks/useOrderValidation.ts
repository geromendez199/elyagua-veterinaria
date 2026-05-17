import { useState } from 'react'

type FormErrors = {
  nombre?: string
  telefono?: string
  direccion?: string
}

type FormTouched = {
  nombre: boolean
  telefono: boolean
  direccion: boolean
}

export function useOrderValidation() {
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<FormTouched>({
    nombre: false,
    telefono: false,
    direccion: false,
  })

  const validateField = (field: string, value: string): string => {
    if (field === 'nombre') return value.trim() ? '' : 'El nombre es requerido'
    if (field === 'telefono') return value.length >= 10 ? '' : 'Ingresá los 10 dígitos sin 0 ni 15'
    if (field === 'direccion') return value.trim() ? '' : 'Ingresá tu dirección'
    return ''
  }

  const handleBlur = (field: keyof FormTouched, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
  }

  const handleChange = (field: keyof FormErrors, value: string) => {
    if (touched[field as keyof FormTouched]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
    }
  }

  const validateForm = (nombre: string, telefono: string, direccion: string, requiresAddress: boolean): boolean => {
    const newErrors: FormErrors = {
      nombre: validateField('nombre', nombre),
      telefono: validateField('telefono', telefono),
    }
    if (requiresAddress) {
      newErrors.direccion = validateField('direccion', direccion)
    }
    setErrors(newErrors)
    setTouched({ nombre: true, telefono: true, direccion: true })
    return Object.values(newErrors).every((e) => !e)
  }

  const clearErrors = () => {
    setErrors({})
    setTouched({ nombre: false, telefono: false, direccion: false })
  }

  return {
    errors,
    touched,
    validateField,
    handleBlur,
    handleChange,
    validateForm,
    clearErrors,
  }
}
