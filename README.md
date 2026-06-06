# FIPE Brasil V2

Laboratorio de UX para a proxima versao do FIPE Brasil. O objetivo e validar navegacao, densidade visual e leitura de mercado com uma interface inspirada em TradingView, Yahoo Finance e Google Finance.

Esta versao nao possui backend, banco de dados, forecast ou IA. Todos os numeros, rankings, insights e series historicas sao mockados.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- Lucide Icons

## Como executar

```bash
npm install
npm run dev
```

## Estrutura

```text
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
```

## Telas

- Home: busca principal, estatisticas de mercado, rankings e grafico IFB.
- Vehicle: cabecalho do veiculo, metricas, historico, insights e comparacoes relacionadas.
- Compare: comparacao lado a lado, grafico comparativo e tabela de metricas.
- IFB Index: indice agregado, evolucao historica e segmentos SUV, Sedan, Hatch e Pickup.

## Proximas etapas

- Definir modelo real de dados FIPE e fontes de ingestao.
- Validar arquitetura de backend e cache.
- Trocar mocks por adaptadores de API.
- Criar filtros reais de marca, modelo, versao, ano e segmento.
- Definir regras para forecast e inteligencia automatica em uma fase posterior.

## Screenshots

Os screenshots de validacao ficam em:

```text
screenshots/
```

A estrutura criada tambem esta documentada em `docs/STRUCTURE.md`.
