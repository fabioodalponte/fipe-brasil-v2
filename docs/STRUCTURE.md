# Estrutura criada

```text
fipe-brasil-v2/
  src/
    pages/
      Home/
      Vehicle/
      Compare/
      Index/
    components/
      charts/
      cards/
      layout/
    data/
      mock/
    assets/
    styles/
  screenshots/
    home.png
    vehicle.png
    compare.png
    index.png
```

## Rotas

- `/`: Home com Hero Search, estatisticas de mercado, rankings e grafico IFB.
- `/vehicle/toyota-corolla-xei-2020`: pagina do veiculo com cabecalho, metricas, historico, insights e relacionados.
- `/compare`: comparacao lado a lado, grafico comparativo e tabela de metricas.
- `/index`: IFB Index com evolucao historica e segmentos.

## Dados

Os dados ficam em `src/data/mock/market.ts`. Eles cobrem veiculos, rankings, historico do IFB, historico por segmento e insights simulados.

## Limites desta versao

- Sem backend.
- Sem banco de dados.
- Sem forecast.
- Sem IA.
- Sem integracao com fonte FIPE real.
