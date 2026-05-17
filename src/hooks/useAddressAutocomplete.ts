import { useState, useRef } from 'react'

export function useAddressAutocomplete() {
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [loadingAddress, setLoadingAddress] = useState(false)
  const addressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchAddressSuggestions = async (query: string) => {
    if (query.trim().length < 3) {
      setAddressSuggestions([])
      return
    }

    setLoadingAddress(true)

    try {
      const res = await fetch(
        `https://apis.datos.gob.ar/georef/api/direcciones?direccion=${encodeURIComponent(query)}&provincia=santa+fe&max=6`
      )
      const data = await res.json()
      const items = (data.direcciones || [])
        .map((d: { nomenclatura?: string }) => d.nomenclatura as string)
        .filter(Boolean)
      setAddressSuggestions(items)
    } catch {
      setAddressSuggestions([])
    } finally {
      setLoadingAddress(false)
    }
  }

  const handleAddressChange = (value: string) => {
    setShowAddressSuggestions(true)
    if (addressTimerRef.current) clearTimeout(addressTimerRef.current)
    addressTimerRef.current = setTimeout(() => fetchAddressSuggestions(value), 350)
  }

  const handleAddressSelect = (suggestion: string) => {
    setShowAddressSuggestions(false)
    setAddressSuggestions([])
    return suggestion
  }

  const clearSuggestions = () => {
    setAddressSuggestions([])
    setShowAddressSuggestions(false)
    if (addressTimerRef.current) clearTimeout(addressTimerRef.current)
  }

  return {
    addressSuggestions,
    showAddressSuggestions,
    loadingAddress,
    handleAddressChange,
    handleAddressSelect,
    clearSuggestions,
    setShowAddressSuggestions,
  }
}
