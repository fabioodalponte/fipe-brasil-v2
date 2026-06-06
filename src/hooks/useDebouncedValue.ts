import { useEffect, useState } from 'react'

/**
 * Retorna `value` com atraso de `delay` ms. Cada nova mudanca reinicia o timer,
 * entao o valor so "assenta" apos o usuario parar de digitar.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
