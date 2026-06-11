import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import pg from 'pg'

/**
 * Carga do consumo Inmetro (PBE Veicular) e matching com os veículos FIPE.
 *
 * 1. Aplica o DDL (server/sql/inmetro_pbev.sql) e recarrega inmetro_pbev a
 *    partir de data/pbev/pbev_consumption.csv (gerado pelo extractor Python).
 * 2. Para cada veículo FIPE com ano-modelo coberto pelas tabelas PBEV (ou 0km),
 *    procura a linha PBEV da mesma marca/ano cujo modelo+motor batem, usando os
 *    tokens da versão para desempatar; grava em vehicle_inmetro_pbev.
 *
 * Uso: npx tsx scripts/load_pbev.ts
 */

type CsvRow = Record<string, string>

const CSV_PATH = resolve('data/pbev/pbev_consumption.csv')
const SQL_PATH = resolve('server/sql/inmetro_pbev.sql')

function loadLocalEnv(): void {
  if (!existsSync('.env.local')) return
  const lines = readFileSync('.env.local', 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key]) continue
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '')
  }
}

function parseCsv(content: string): CsvRow[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== '')
  const [headerLine, ...dataLines] = lines
  const headers = headerLine.split(',')
  return dataLines.map((line) => {
    const values = line.split(',')
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  })
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, ' ')
    .trim()
}

function tokens(value: string | null | undefined): string[] {
  return normalizeText(value).split(' ').filter(Boolean)
}

/** Cilindrada "1.0"/"2.0" extraída de "1.0-6V", "MOBI ... 1.0 Flex" etc. */
function displacement(value: string | null | undefined): string | null {
  const match = /(\d\.\d)/.exec(value ?? '')
  return match ? match[1] : null
}

function normalizeBrand(value: string): string {
  const norm = normalizeText(value).replace(/\./g, '')
  const words = norm.split(' ').filter(Boolean)
  // FIPE usa prefixos tipo "vw volkswagen", "gm chevrolet"; PBEV usa o nome puro.
  const drop = new Set(['vw', 'gm'])
  return words.filter((w) => !drop.has(w)).join(' ')
}

type PbevRow = {
  id: number
  table_year: number
  marca: string
  modelo: string
  versao: string | null
  motor: string | null
  propulsao: string | null
  combustivel: string | null
}

type VehicleRow = {
  id: number
  brand: string
  model: string
  model_year: number | null
  is_zero_km: boolean
  fuel: string
}

function fuelCompatible(fipeFuel: string, pbevCombustivel: string | null, pbevPropulsao: string | null): boolean {
  const fuel = normalizeText(fipeFuel)
  const comb = normalizeText(pbevCombustivel)
  const prop = normalizeText(pbevPropulsao)
  if (fuel === 'diesel') return comb === 'd'
  if (fuel === 'eletrico') return comb === 'e' || prop === 'eletrico'
  if (fuel === 'flex') return comb === 'f'
  if (fuel === 'gasolina') return comb === 'g' || comb === 'f'
  if (fuel === 'hibrido') return prop.includes('hibrido') || prop.includes('plug')
  return true
}

function matchVehicle(vehicle: VehicleRow, candidates: PbevRow[]): { pbevId: number; score: number } | null {
  const fipeTokens = new Set(tokens(vehicle.model))
  const fipeDisp = displacement(vehicle.model)
  let best: { pbevId: number; score: number } | null = null

  for (const row of candidates) {
    if (!fuelCompatible(vehicle.fuel, row.combustivel, row.propulsao)) continue

    // Todos os tokens do modelo PBEV precisam aparecer no nome FIPE. Tokens de
    // 1 letra (ex.: o "E" de "E-KWID") são ruído de hifenização — ignorados.
    const modelTokens = tokens(row.modelo).filter((t) => t.length > 1)
    if (modelTokens.length === 0 || !modelTokens.every((t) => fipeTokens.has(t))) continue

    // Cilindrada precisa bater quando ambos os lados a declaram.
    const pbevDisp = displacement(row.motor) ?? displacement(row.versao)
    if (fipeDisp && pbevDisp && fipeDisp !== pbevDisp) continue

    const versionTokens = tokens(row.versao).filter((t) => !modelTokens.includes(t))
    const hits = versionTokens.filter((t) => fipeTokens.has(t)).length
    const score =
      modelTokens.length +
      (fipeDisp && pbevDisp ? 1 : 0) +
      (versionTokens.length > 0 ? hits / versionTokens.length : 0)

    if (!best || score > best.score) best = { pbevId: row.id, score }
  }

  return best
}

async function main(): Promise<void> {
  loadLocalEnv()
  const databaseUrl = process.env.FIPE_DATABASE_URL
  if (!databaseUrl) throw new Error('FIPE_DATABASE_URL ausente (defina em .env.local)')
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 4 })

  try {
    await pool.query(readFileSync(SQL_PATH, 'utf8'))

    // PBEV_SKIP_LOAD=1 refaz apenas o matching, sem recarregar o CSV.
    if (process.env.PBEV_SKIP_LOAD !== '1') {
      const rows = parseCsv(readFileSync(CSV_PATH, 'utf8'))
      console.log(`[pbev] ${rows.length} linhas no CSV`)

      await pool.query('TRUNCATE vehicle_inmetro_pbev, inmetro_pbev RESTART IDENTITY')

    const numeric = (value: string) => (value === '' ? null : Number(value))
    const text = (value: string) => (value === '' ? null : value)
    for (const row of rows) {
      await pool.query(
        `INSERT INTO inmetro_pbev (
           table_year, categoria, marca, modelo, versao, motor, propulsao,
           transmissao, combustivel, kml_etanol_cidade, kml_etanol_estrada,
           kml_gasolina_cidade, kml_gasolina_estrada, kml_eletrico_cidade,
           kml_eletrico_estrada, consumo_mj_km, autonomia_eletrica_km,
           classificacao_pbe, classificacao_geral, selo_conpet
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
        [
          Number(row.table_year), text(row.categoria), row.marca, row.modelo,
          text(row.versao), text(row.motor), text(row.propulsao),
          text(row.transmissao), text(row.combustivel),
          numeric(row.kml_etanol_cidade), numeric(row.kml_etanol_estrada),
          numeric(row.kml_gasolina_cidade), numeric(row.kml_gasolina_estrada),
          numeric(row.kml_eletrico_cidade), numeric(row.kml_eletrico_estrada),
          numeric(row.consumo_mj_km), numeric(row.autonomia_eletrica_km),
          text(row.classificacao_pbe), text(row.classificacao_geral), text(row.selo_conpet),
        ],
        )
      }
    } else {
      await pool.query('TRUNCATE vehicle_inmetro_pbev')
    }

    const pbev = await pool.query<PbevRow>(
      'SELECT id, table_year, marca, modelo, versao, motor, propulsao, combustivel FROM inmetro_pbev',
    )
    const yearsResult = await pool.query<{ min: number; max: number }>(
      'SELECT MIN(table_year) AS min, MAX(table_year) AS max FROM inmetro_pbev',
    )
    const { min: minYear, max: maxYear } = yearsResult.rows[0]

    // Índice marca normalizada + ano -> linhas PBEV.
    const byBrandYear = new Map<string, PbevRow[]>()
    for (const row of pbev.rows) {
      const key = `${normalizeBrand(row.marca)}|${row.table_year}`
      const list = byBrandYear.get(key)
      if (list) list.push(row)
      else byBrandYear.set(key, [row])
    }

    const vehicles = await pool.query<VehicleRow>(
      `SELECT id, brand, model, model_year, is_zero_km, fuel
         FROM vehicles
        WHERE (model_year BETWEEN $1 AND $2) OR (is_zero_km AND model_year IS NULL)`,
      [minYear, maxYear],
    )
    console.log(`[pbev] ${vehicles.rows.length} veículos FIPE candidatos (${minYear}-${maxYear} + 0km)`)

    let matched = 0
    for (const vehicle of vehicles.rows) {
      const year = vehicle.model_year ?? maxYear
      const brandKey = normalizeBrand(vehicle.brand)
      // Modelos atravessam ciclos da tabela: tenta o ano-modelo exato e cai
      // para os ciclos vizinhos quando o veículo não aparece naquele ano.
      let match: { pbevId: number; score: number } | null = null
      for (const tryYear of [year, year - 1, year + 1, year - 2]) {
        if (tryYear < minYear || tryYear > maxYear) continue
        const candidates = byBrandYear.get(`${brandKey}|${tryYear}`)
        if (!candidates) continue
        match = matchVehicle(vehicle, candidates)
        if (match) break
      }
      if (!match) continue
      await pool.query(
        `INSERT INTO vehicle_inmetro_pbev (vehicle_id, pbev_id, match_score)
         VALUES ($1, $2, $3)
         ON CONFLICT (vehicle_id) DO UPDATE SET pbev_id = $2, match_score = $3, matched_at = now()`,
        [vehicle.id, match.pbevId, match.score],
      )
      matched += 1
    }

    const pct = ((matched / vehicles.rows.length) * 100).toFixed(1)
    console.log(`[pbev] matching: ${matched}/${vehicles.rows.length} veículos (${pct}%)`)
  } finally {
    await pool.end()
  }
}

await main()
