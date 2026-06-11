import { Car, Search } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVehicleSearch } from '../../hooks/useVehicleSearch'
import type { VehicleSearchResult } from '../../services/vehicleSearch'
import { formatCurrency } from '../../utils/formatters'
import { categoryLabel } from '../../services/categoryPages'

type SearchAutocompleteProps = {
  placeholder?: string
  autoFocus?: boolean
  className?: string
  selectedLabel?: string
  onSelect?: (vehicle: VehicleSearchResult) => void
}

export function SearchAutocomplete({
  placeholder = 'Buscar marca, modelo ou codigo FIPE',
  autoFocus = false,
  className = '',
  selectedLabel,
  onSelect,
}: SearchAutocompleteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  const { results, status } = useVehicleSearch(query)
  const showDropdown = open && query.trim().length > 0
  // Indice destacado, ignorado quando a lista encolheu abaixo dele.
  const highlighted = activeIndex < results.length ? activeIndex : -1

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!showDropdown) return
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [showDropdown])

  function select(index: number) {
    const vehicle = results[index]
    if (!vehicle) return
    setQuery('')
    setOpen(false)
    setActiveIndex(-1)
    if (onSelect) {
      onSelect(vehicle)
      return
    }
    navigate(`/carro/${vehicle.id}`)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) return
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((prev) => (prev + 1) % Math.max(results.length, 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1))
        break
      case 'Enter':
        event.preventDefault()
        select(highlighted >= 0 ? highlighted : 0)
        break
      case 'Escape':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={containerRef} className={`relative min-w-0 ${className}`}>
      <label className="flex min-h-12 min-w-0 items-center rounded bg-white px-3 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-slate-900">
        <Search size={18} className="mr-2 shrink-0 text-slate-400" />
        <input
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoFocus={autoFocus}
          value={query || selectedLabel || ''}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(-1)
            setOpen(true)
          }}
          onFocus={(event) => {
            setOpen(true)
            if (selectedLabel && !query) event.currentTarget.select()
          }}
          onKeyDown={onKeyDown}
          className="min-w-0 w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
        />
      </label>

      {showDropdown ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-auto rounded border border-slate-200 bg-white py-1 shadow-lg"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-slate-500">
              {status === 'loading' ? 'Buscando...' : 'Nenhum veiculo encontrado'}
            </li>
          ) : (
            results.map((vehicle, index) => (
              <li
                key={vehicle.id}
                role="option"
                aria-selected={index === highlighted}
                onPointerDown={(event) => {
                  event.preventDefault()
                  select(index)
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${
                  index === highlighted ? 'bg-slate-100' : ''
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-700">
                  <Car size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-950">{vehicle.name}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {vehicle.brand} | {categoryLabel(vehicle.segment)} | FIPE {vehicle.fipeCode}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-sm font-bold text-slate-700">
                  {formatCurrency(vehicle.price)}
                </span>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}
