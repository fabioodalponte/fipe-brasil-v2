import corollaStudio from '../../assets/corolla-studio.png'

export type MarketPoint = {
  month: string
  ifb: number
  suv: number
  sedan: number
  hatch: number
  pickup: number
  corolla: number
  civic: number
}

export type Vehicle = {
  id: string
  name: string
  brand: string
  model: string
  version: string
  year: number
  segment: string
  fipeCode: string
  price: number
  monthlyChange: number
  yearlyChange: number
  liquidity: number
  volatility: number
  marketRank: number
  image?: string
}

export const marketStats = [
  { label: 'IFB Hoje', value: '109,10', change: '+1,2%', tone: 'positive' },
  { label: 'Veiculos monitorados', value: '12.480', change: '+312', tone: 'positive' },
  { label: 'Preco medio', value: 'R$ 83.420', change: '-0,4%', tone: 'negative' },
  { label: 'Liquidez media', value: '71/100', change: '+3 pts', tone: 'positive' },
]

export const marketHistory: MarketPoint[] = [
  { month: 'Jan', ifb: 99.8, suv: 101.2, sedan: 98.9, hatch: 99.4, pickup: 102.2, corolla: 92.5, civic: 91.1 },
  { month: 'Fev', ifb: 100.6, suv: 102.1, sedan: 99.4, hatch: 99.8, pickup: 103.1, corolla: 93.8, civic: 92.3 },
  { month: 'Mar', ifb: 101.1, suv: 103.8, sedan: 99.9, hatch: 100.2, pickup: 103.9, corolla: 94.6, civic: 93.1 },
  { month: 'Abr', ifb: 102.4, suv: 104.6, sedan: 100.7, hatch: 100.6, pickup: 105.0, corolla: 96.2, civic: 94.5 },
  { month: 'Mai', ifb: 103.7, suv: 106.0, sedan: 101.2, hatch: 101.0, pickup: 106.5, corolla: 97.8, civic: 95.2 },
  { month: 'Jun', ifb: 104.8, suv: 107.4, sedan: 102.0, hatch: 101.4, pickup: 107.8, corolla: 99.1, civic: 96.4 },
  { month: 'Jul', ifb: 104.2, suv: 108.1, sedan: 101.7, hatch: 100.8, pickup: 108.4, corolla: 99.7, civic: 97.0 },
  { month: 'Ago', ifb: 105.0, suv: 109.2, sedan: 102.6, hatch: 101.6, pickup: 109.6, corolla: 101.0, civic: 98.1 },
  { month: 'Set', ifb: 105.9, suv: 110.4, sedan: 103.3, hatch: 102.2, pickup: 110.8, corolla: 102.4, civic: 99.3 },
  { month: 'Out', ifb: 106.6, suv: 111.5, sedan: 103.9, hatch: 102.7, pickup: 111.1, corolla: 103.7, civic: 100.0 },
  { month: 'Nov', ifb: 107.8, suv: 112.7, sedan: 104.4, hatch: 103.1, pickup: 112.2, corolla: 105.1, civic: 101.2 },
  { month: 'Dez', ifb: 109.1, suv: 114.0, sedan: 105.2, hatch: 103.8, pickup: 113.7, corolla: 106.4, civic: 102.6 },
]

export const vehicles: Vehicle[] = [
  {
    id: 'toyota-corolla-xei-2020',
    name: 'Toyota Corolla XEi 2.0',
    brand: 'Toyota',
    model: 'Corolla',
    version: 'XEi 2.0 Flex',
    year: 2020,
    segment: 'Sedan',
    fipeCode: '002182-5',
    price: 128430,
    monthlyChange: 2.4,
    yearlyChange: 8.9,
    liquidity: 86,
    volatility: 4.2,
    marketRank: 14,
    image: corollaStudio,
  },
  {
    id: 'honda-civic-exl-2020',
    name: 'Honda Civic EXL 2.0',
    brand: 'Honda',
    model: 'Civic',
    version: 'EXL 2.0 Flex',
    year: 2020,
    segment: 'Sedan',
    fipeCode: '014083-2',
    price: 124900,
    monthlyChange: 1.8,
    yearlyChange: 7.1,
    liquidity: 81,
    volatility: 4.8,
    marketRank: 18,
  },
  {
    id: 'jeep-compass-longitude-2021',
    name: 'Jeep Compass Longitude',
    brand: 'Jeep',
    model: 'Compass',
    version: 'Longitude T270',
    year: 2021,
    segment: 'SUV',
    fipeCode: '017112-6',
    price: 151200,
    monthlyChange: 3.7,
    yearlyChange: 12.4,
    liquidity: 78,
    volatility: 6.1,
    marketRank: 9,
  },
  {
    id: 'hyundai-hb20-comfort-2022',
    name: 'Hyundai HB20 Comfort',
    brand: 'Hyundai',
    model: 'HB20',
    version: 'Comfort 1.0',
    year: 2022,
    segment: 'Hatch',
    fipeCode: '015201-6',
    price: 69780,
    monthlyChange: -1.9,
    yearlyChange: -5.8,
    liquidity: 74,
    volatility: 7.4,
    marketRank: 36,
  },
  {
    id: 'toyota-corolla-gli-2019',
    name: 'Toyota Corolla GLi 1.8',
    brand: 'Toyota',
    model: 'Corolla',
    version: 'GLi 1.8 Flex',
    year: 2019,
    segment: 'Sedan',
    fipeCode: '002180-9',
    price: 112400,
    monthlyChange: 1.6,
    yearlyChange: 6.2,
    liquidity: 83,
    volatility: 4.5,
    marketRank: 21,
  },
  {
    id: 'toyota-corolla-cross-xre-2021',
    name: 'Toyota Corolla Cross XRE',
    brand: 'Toyota',
    model: 'Corolla Cross',
    version: 'XRE 2.0 Flex',
    year: 2021,
    segment: 'SUV',
    fipeCode: '002320-8',
    price: 158900,
    monthlyChange: 2.9,
    yearlyChange: 10.7,
    liquidity: 80,
    volatility: 5.0,
    marketRank: 11,
  },
  {
    id: 'toyota-yaris-xls-2020',
    name: 'Toyota Yaris XLS',
    brand: 'Toyota',
    model: 'Yaris',
    version: 'XLS 1.5 Flex',
    year: 2020,
    segment: 'Hatch',
    fipeCode: '002301-1',
    price: 84600,
    monthlyChange: 0.7,
    yearlyChange: 3.9,
    liquidity: 77,
    volatility: 5.8,
    marketRank: 28,
  },
  {
    id: 'honda-hrv-exl-2021',
    name: 'Honda HR-V EXL',
    brand: 'Honda',
    model: 'HR-V',
    version: 'EXL 1.8 Flex',
    year: 2021,
    segment: 'SUV',
    fipeCode: '014210-0',
    price: 139700,
    monthlyChange: 2.2,
    yearlyChange: 9.1,
    liquidity: 79,
    volatility: 5.2,
    marketRank: 16,
  },
  {
    id: 'nissan-sentra-sv-2020',
    name: 'Nissan Sentra SV',
    brand: 'Nissan',
    model: 'Sentra',
    version: 'SV 2.0 CVT',
    year: 2020,
    segment: 'Sedan',
    fipeCode: '022045-3',
    price: 109800,
    monthlyChange: 1.1,
    yearlyChange: 5.4,
    liquidity: 72,
    volatility: 5.6,
    marketRank: 30,
  },
  {
    id: 'volkswagen-jetta-gli-2020',
    name: 'Volkswagen Jetta GLI',
    brand: 'Volkswagen',
    model: 'Jetta',
    version: 'GLI 350 TSI',
    year: 2020,
    segment: 'Sedan',
    fipeCode: '005320-1',
    price: 142300,
    monthlyChange: 1.9,
    yearlyChange: 7.8,
    liquidity: 75,
    volatility: 5.9,
    marketRank: 19,
  },
  {
    id: 'volkswagen-tcross-highline-2021',
    name: 'VW T-Cross Highline',
    brand: 'Volkswagen',
    model: 'T-Cross',
    version: 'Highline 1.4 TSI',
    year: 2021,
    segment: 'SUV',
    fipeCode: '005401-1',
    price: 134500,
    monthlyChange: 2.4,
    yearlyChange: 8.6,
    liquidity: 81,
    volatility: 4.9,
    marketRank: 13,
  },
  {
    id: 'chevrolet-onix-premier-2021',
    name: 'Chevrolet Onix Premier',
    brand: 'Chevrolet',
    model: 'Onix',
    version: 'Premier 1.0 Turbo',
    year: 2021,
    segment: 'Hatch',
    fipeCode: '004512-0',
    price: 78900,
    monthlyChange: -0.6,
    yearlyChange: 2.1,
    liquidity: 84,
    volatility: 6.3,
    marketRank: 33,
  },
  {
    id: 'jeep-renegade-longitude-2021',
    name: 'Jeep Renegade Longitude',
    brand: 'Jeep',
    model: 'Renegade',
    version: 'Longitude T270',
    year: 2021,
    segment: 'SUV',
    fipeCode: '017088-0',
    price: 129400,
    monthlyChange: 2.6,
    yearlyChange: 9.8,
    liquidity: 77,
    volatility: 6.0,
    marketRank: 17,
  },
]

export const appreciationRanking = [
  { name: 'Jeep Compass Longitude 2021', segment: 'SUV', price: 151200, change: 3.7 },
  { name: 'Toyota Corolla XEi 2020', segment: 'Sedan', price: 128430, change: 2.4 },
  { name: 'Chevrolet S10 LTZ 2020', segment: 'Pickup', price: 173600, change: 2.1 },
  { name: 'Honda Civic EXL 2020', segment: 'Sedan', price: 124900, change: 1.8 },
]

export const depreciationRanking = [
  { name: 'Hyundai HB20 Comfort 2022', segment: 'Hatch', price: 69780, change: -1.9 },
  { name: 'Renault Kwid Zen 2021', segment: 'Hatch', price: 43800, change: -1.6 },
  { name: 'Fiat Argo Drive 2020', segment: 'Hatch', price: 58720, change: -1.2 },
  { name: 'Nissan Kicks SV 2019', segment: 'SUV', price: 82100, change: -0.8 },
]

export const vehicleInsights = [
  'Corolla XEi 2020 performa acima da media de sedans em 6 dos ultimos 12 meses.',
  'Liquidez segue alta para faixa de R$ 120 mil a R$ 135 mil, com baixa dispersao regional.',
  'Volatilidade menor que a do Civic EXL no mesmo periodo, sugerindo precificacao mais estavel.',
]

export const segmentTable = [
  { segment: 'SUV', index: 114.0, month: 2.1, year: 13.6, liquidity: 76 },
  { segment: 'Sedan', index: 105.2, month: 1.4, year: 6.3, liquidity: 82 },
  { segment: 'Hatch', index: 103.8, month: 0.9, year: 4.4, liquidity: 73 },
  { segment: 'Pickup', index: 113.7, month: 1.8, year: 11.5, liquidity: 69 },
]
