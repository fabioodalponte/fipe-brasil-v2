import type { Vehicle } from '../data/mock/market'

const SITE_NAME = 'FIPE Brasil'

/** Resolve um caminho para URL absoluta usando a origem atual. */
export function absoluteUrl(path: string): string {
  if (typeof window === 'undefined') return path
  return `${window.location.origin}${path}`
}

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
 * WebSite + SearchAction. O alvo aponta para uma rota de busca futura (/busca);
 * por ser apenas dado estruturado, nao quebra enquanto a rota nao existir.
 */
export function websiteSearch() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl('/busca')}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
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
