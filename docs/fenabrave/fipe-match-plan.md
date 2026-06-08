# Plano de cruzamento Fenabrave x FIPE

## Objetivo

Preparar um fluxo auditável para cruzar rankings Fenabrave de emplacamentos com a base FIPE sem alterar tabelas principais como `vehicles`, `vehicle_latest_prices` ou snapshots de preço.

Esta etapa cria somente staging:

- `fenabrave_model_rankings`
- `fenabrave_brand_rankings`
- `fenabrave_segment_model_rankings`
- `fenabrave_fipe_match_candidates`

Nenhum match é aplicado automaticamente nas tabelas principais.

## Entradas

Arquivos versionados em `data/fenabrave/`:

- `ranking_emplacamentos_maio_2026.csv`
- `ranking_emplacamentos_acumulado_2026.csv`
- `ranking_marca_maio_2026.csv`
- `ranking_marca_acumulado_2026.csv`
- `ranking_segmentos_modelos_2026.csv`

Base FIPE consultada somente para candidatos:

- `vehicle_latest_prices`

## Carga staging

O script `scripts/load_fenabrave_staging.ts`:

- executa `server/sql/fenabrave_staging.sql`;
- carrega os cinco CSVs;
- grava `report_month = 2026-05-01`;
- preserva `brand_original` e `model_original`;
- grava versões normalizadas em `brand_normalized` e `model_normalized`;
- é idempotente por `report_month`, `source_file` e `ranking_type`;
- não toca em tabelas principais.

Comando de carga real para staging Fenabrave:

```bash
npx tsx scripts/load_fenabrave_staging.ts
```

Resultado validado em 2026-06-08:

| Arquivo | Tabela | Linhas |
| --- | --- | ---: |
| `ranking_emplacamentos_maio_2026.csv` | `fenabrave_model_rankings` | 100 |
| `ranking_emplacamentos_acumulado_2026.csv` | `fenabrave_model_rankings` | 100 |
| `ranking_marca_maio_2026.csv` | `fenabrave_brand_rankings` | 63 |
| `ranking_marca_acumulado_2026.csv` | `fenabrave_brand_rankings` | 63 |
| `ranking_segmentos_modelos_2026.csv` | `fenabrave_segment_model_rankings` | 162 |

## Estratégia de normalização

Normalização textual:

- remover acentos;
- converter para minúsculas;
- substituir pontuação por espaço;
- reduzir múltiplos separadores;
- preservar o texto original em colunas separadas.

Aliases iniciais de marca:

- `GM` -> `Chevrolet`
- `VW` -> `VW - VolksWagen`
- `M.BENZ` -> `Mercedes-Benz`
- `CAOA CHERY` -> `Caoa Chery`

No staging, os aliases são aplicados na forma normalizada:

- `GM` -> `chevrolet`
- `VW` -> `vw volkswagen`
- `M.BENZ` -> `mercedes benz`
- `CAOA CHERY` -> `caoa chery`

## Estratégia de candidatos

A view `fenabrave_fipe_match_candidates` une linhas Fenabrave por modelo a candidatos FIPE usando:

- compatibilidade de marca normalizada;
- família de modelo normalizada;
- prefixo ou substring do modelo FIPE;
- similaridade textual via `pg_trgm` quando disponível;
- fallback determinístico quando `pg_trgm` não estiver disponível.

A view retorna até 10 candidatos por linha Fenabrave, com:

- `fenabrave_row_id`
- marca/modelo Fenabrave
- `fipe_vehicle_id`
- marca/modelo FIPE
- `slug`
- `segment`
- `latest_price`
- `similarity_score`
- `match_status`

Status:

- `exact`: candidato forte com score alto;
- `fuzzy`: candidato possível, exige revisão;
- `ambiguous`: mais de um candidato próximo;
- `no_match`: nenhum candidato mínimo encontrado.

## Top 50 candidatos

O arquivo `data/fenabrave/fipe_match_candidates_top50.csv` foi gerado a partir da materialized view, usando apenas o melhor candidato (`candidate_rank = 1`) por linha Fenabrave e ordenando por maior volume.

Consulta equivalente:

```sql
SELECT source_table,
       source_file,
       ranking_type,
       category,
       fenabrave_segment,
       rank,
       fenabrave_brand,
       fenabrave_model,
       registrations_month,
       registrations_accumulated,
       fipe_vehicle_id,
       fipe_brand,
       fipe_model,
       slug,
       segment,
       latest_price,
       similarity_score,
       match_status,
       candidate_rank,
       candidate_count
  FROM fenabrave_fipe_match_candidates
 WHERE candidate_rank = 1
 ORDER BY coalesce(registrations_month, registrations_accumulated) DESC NULLS LAST,
          similarity_score DESC,
          fenabrave_brand,
          fenabrave_model
 LIMIT 50;
```

Resumo validado da view:

- `fenabrave_fipe_match_candidates`: 2.996 linhas
- linhas Fenabrave consultáveis via `candidate_rank = 1`: 362
- candidatos encontrados: 2.956
- linhas sem candidato mínimo: 40

## Validações obrigatórias

Consultas de controle:

```sql
SELECT registrations_month
  FROM fenabrave_model_rankings
 WHERE report_month = '2026-05-01'
   AND ranking_type = 'model_month'
   AND brand_original = 'VW'
   AND model_original = 'POLO';
```

Resultado: `10523`.

```sql
SELECT registrations_month
  FROM fenabrave_model_rankings
 WHERE report_month = '2026-05-01'
   AND ranking_type = 'model_month'
   AND brand_original = 'FIAT'
   AND model_original = 'STRADA';
```

Resultado: `15395`.

```sql
SELECT registrations_accumulated
  FROM fenabrave_brand_rankings
 WHERE report_month = '2026-05-01'
   AND ranking_type = 'brand_accumulated'
   AND category = 'AUTOMÓVEIS + COMERCIAIS LEVES'
   AND brand_original = 'FIAT';
```

Resultado: `221872`.

Observação: não somar todas as linhas de `FIAT` em `ranking_marca_acumulado_2026.csv`, porque o arquivo inclui as categorias separadas e a linha agregada `AUTOMÓVEIS + COMERCIAIS LEVES`.

## Integridade das tabelas principais

Controle antes/depois da carga real:

| Tabela | Linhas antes | Fingerprint antes | Linhas depois | Fingerprint depois |
| --- | ---: | --- | ---: | --- |
| `vehicles` | 30556 | `5d2cd7f1e526d86754e7d9b58ea941c3` | 30556 | `5d2cd7f1e526d86754e7d9b58ea941c3` |
| `vehicle_latest_prices` | 30556 | `544d539d5640acecb52d12036ee1efaa` | 30556 | `544d539d5640acecb52d12036ee1efaa` |
| `vehicle_price_snapshots` | 638194 | `32667321b365f93eab285701e8f99fcf` | 638194 | `32667321b365f93eab285701e8f99fcf` |

Conclusão: as tabelas principais permaneceram intactas.

## Exemplos de match fácil

- `VW/POLO` tende a encontrar versões FIPE de Polo com marca `VW - VolksWagen`.
- `FIAT/STRADA` tende a encontrar versões FIPE de Strada com marca `Fiat`.
- `TOYOTA/HILUX` tende a encontrar versões FIPE de Hilux com marca `Toyota`.
- `JEEP/COMPASS` tende a encontrar versões FIPE de Compass com marca `Jeep`.

## Exemplos difíceis

- `VW/T CROSS`: no PDF aparece como `T CROSS`; na FIPE pode aparecer como `T-Cross` com versão, motor e acabamento.
- `GM/ONIX`: Fenabrave usa `GM`, enquanto FIPE usa `GM - Chevrolet` ou Chevrolet conforme origem.
- `M.BENZ/SPRINTER 317`: o número pode ser parte essencial da família, mas também aparece junto de versão/variante.
- `CAOA CHERY/TIGGO 7`: há várias famílias Tiggo e versões próximas.
- `BYD/SONG`: pode representar variantes diferentes da família Song.
- `GM/MONTANA`: aparece em rankings de comerciais leves e também pode haver versões antigas/atuais na FIPE.

## Riscos de matching

- Um modelo Fenabrave pode corresponder a várias versões FIPE por ano, motor e acabamento.
- O ranking Fenabrave é por família/modelo comercial; FIPE é granular por versão.
- Segmentos Fenabrave e segmentos FIPE não têm taxonomia idêntica.
- Modelos com números no nome podem ser confundidos com cilindrada, versão ou ano.
- Marcas com nomes abreviados exigem alias explícito.
- Importados e veículos elétricos podem ter nomes comerciais diferentes entre bases.

## Próxima etapa recomendada

1. Revisar top candidatos por volume de emplacamento.
2. Criar tabela manual de aliases adicionais de marca/modelo, ainda fora das tabelas principais.
3. Definir regra de escolha por família FIPE, não por versão específica, antes de qualquer agregação.
4. Só depois criar uma tabela de relacionamento revisada manualmente.

Nenhuma atualização automática deve ser aplicada em `vehicles`, `vehicle_latest_prices` ou qualquer tabela principal sem revisão humana dos matches.
