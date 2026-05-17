import { useState, useCallback } from 'react'

interface AddressSuggestion {
  calle: string
  numero: string
}

export function useAddressAutocomplete() {
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
  const [loadingAddress, setLoadingAddress] = useState(false)

  const searchAddress = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([])
      return
    }

    setLoadingAddress(true)

    try {
      const response = await fetch(
        `https://apis.datos.gob.ar/georef/api/calles?nombre=${query}&provincia=santa%20fe&localidad=santa%20fe&max=10`
      )
      const data = await response.json()

      if (data.calles) {
        setAddressSuggestions(
          data.calles.slice(0, 8).map((calle: any) => ({
            calle: calle.nombre,
            numero: '',
          }))
        )
      }
    } catch (err) {
      console.error('Address search error:', err)
      setAddressSuggestions([])
    } finally {
      setLoadingAddress(false)
    }
  }, [])

  const clearSuggestions = useCallback(() => {
    setAddressSuggestions([])
  }, [])

  return {
    addressSuggestions,
    loadingAddress,
    searchAddress,
    clearSuggestions,
  }
}
