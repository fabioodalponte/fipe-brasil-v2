import { absoluteUrl } from '../config/site'
import type { Vehicle } from '../data/mock/market'

export { absoluteUrl }

export type Crumb = {
  name: string
  path: string
}

/** BreadcrumbList schema.org a partir de uma trilha de paginas. */
export function breadcrumbList(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  }
}

/**
 * Product+Vehicle com a oferta de preco FIPE atual. Sem disponibilidade, sem
 * rating e sem review (nao inventamos dados que nao temos).
 */
export function vehicleProduct(vehicle: Vehicle) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Product', 'Vehicle'],
    name: `${vehicle.name} ${vehicle.year}`,
    brand: { '@type': 'Brand', name: vehicle.brand },
    category: vehicle.segment,
    productionDate: String(vehicle.year),
    offers: {
      '@type': 'Offer',
      price: vehicle.price,
      priceCurrency: 'BRL',
      url: absoluteUrl(`/vehicle/${vehicle.id}`),
    },
  }
}

/**
 * Product+Vehicle a partir de dados reais (sem depender do tipo mock).
 * Só inclui a oferta quando há preço; usa o mês de referência como
 * priceValidUntil quando disponível.
 */
export function vehicleProductFromParts(opts: {
  name: string
  brand: string
  segment?: string | null
  year?: number | null
  price?: number | null
  path: string
  referenceMonth?: string | null
}) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Product', 'Vehicle'],
    name: opts.name,
    brand: { '@type': 'Brand', name: opts.brand },
  }
  if (opts.segment) data.category = opts.segment
  if (opts.year) data.productionDate = String(opts.year)
  if (opts.price != null) {
    data.offers = {
      '@type': 'Offer',
      price: opts.price,
      priceCurrency: 'BRL',
      url: absoluteUrl(opts.path),
      ...(opts.referenceMonth ? { priceValidUntil: opts.referenceMonth } : {}),
    }
  }
  return data
}

/** CollectionPage com uma ItemList dos veiculos (marca ou categoria). */
export function collectionPage(opts: { name: string; path: string; vehicles: Vehicle[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    url: absoluteUrl(opts.path),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: opts.vehicles.length,
      itemListElement: opts.vehicles.map((vehicle, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${vehicle.name} ${vehicle.year}`,
        url: absoluteUrl(`/vehicle/${vehicle.id}`),
      })),
    },
  }
}
