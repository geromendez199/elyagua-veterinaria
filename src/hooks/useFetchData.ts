import { useEffect, useState } from 'react'

interface FetchState<T> {
  data: T[]
  loading: boolean
  error: string | null
}

export function useFetchData<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url)
        const result = await response.json()

        if (result.success) {
          setState({
            data: result.data || [],
            loading: false,
            error: null,
          })
        } else {
          setState({
            data: [],
            loading: false,
            error: result.error || 'Unknown error',
          })
        }
      } catch (err) {
        setState({
          data: [],
          loading: false,
          error: err instanceof Error ? err.message : 'Error fetching data',
        })
      }
    }

    fetchData()
  }, [url])

  return state
}
