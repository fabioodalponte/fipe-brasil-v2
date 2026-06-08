# Relatório de qualidade dos matches Fenabrave x FIPE

Auditoria read-only sobre `fenabrave_fipe_match_candidates` em 2026-06-08. Nenhuma query de escrita, `REFRESH`, migration, `UPDATE`, API ou frontend foi executado nesta auditoria.

Escopo de cobertura por modelo: uma linha Fenabrave é representada por `candidate_rank = 1`. Escopo de cobertura por emplacamento: somente linhas com `registrations_accumulated IS NOT NULL`, para evitar misturar mês e acumulado no mesmo denominador.

## Resumo por status

| status | linhas |
| --- | --- |
| exact | 0 |
| fuzzy | 0 |
| ambiguous | 2.956 |
| no_match | 40 |

## Cobertura por modelos

- modelos Fenabrave totais: 362
- modelos com match: 322
- cobertura: 88.95%

| origem | tipo | modelos | com match | cobertura |
| --- | --- | --- | --- | --- |
| fenabrave_model_rankings | model_accumulated | 100 | 94 | 94.00% |
| fenabrave_model_rankings | model_month | 100 | 92 | 92.00% |
| fenabrave_segment_model_rankings | segment_model_accumulated | 162 | 136 | 83.95% |

## Cobertura por emplacamentos acumulados

- emplacamentos totais Fenabrave: 2.077.700
- emplacamentos cobertos por match: 2.018.641
- cobertura: 97.16%

| origem | tipo | emplacamentos | cobertos | cobertura |
| --- | --- | --- | --- | --- |
| fenabrave_model_rankings | model_accumulated | 1.025.434 | 998.363 | 97.36% |
| fenabrave_segment_model_rankings | segment_model_accumulated | 1.052.266 | 1.020.278 | 96.96% |

## Top 100 exact matches

Nenhuma linha retornou `match_status = exact` nesta execução. Isso é coerente com a regra atual: quando há múltiplas versões FIPE próximas, a linha é classificada como `ambiguous`, mesmo com score alto.

## Top 100 ambiguous

| # | origem | tipo | rank | Fenabrave | acum | mês | score | cand | candidatos FIPE | motivo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | fenabrave_segment_model_rankings | segment_model_accumulated | 11 | GWM/ORA 03 | 1.587 | 490 | 1.000000 | 11 | 1. GWM Ora 03  [1.000000]<br>2. GWM Ora 03  [1.000000] | candidate_count=11; múltiplas versões FIPE próximas da mesma família/modelo |
| 2 | fenabrave_segment_model_rankings | segment_model_accumulated | 1 | BMW/320I | 1.446 | 290 | 1.000000 | 61 | 1. BMW 320i [1.000000]<br>2. BMW 320i [1.000000] | candidate_count=61; múltiplas versões FIPE próximas da mesma família/modelo |
| 3 | fenabrave_model_rankings | model_accumulated | 33 | GM/SILVERADO | 382 |  | 1.000000 | 61 | 1. GM - Chevrolet Silverado [1.000000]<br>2. GM - Chevrolet Silverado [1.000000] | candidate_count=61; múltiplas versões FIPE próximas da mesma família/modelo |
| 4 | fenabrave_model_rankings | model_month | 43 | GM/SILVERADO |  | 31 | 1.000000 | 61 | 1. GM - Chevrolet Silverado [1.000000]<br>2. GM - Chevrolet Silverado [1.000000] | candidate_count=61; múltiplas versões FIPE próximas da mesma família/modelo |
| 5 | fenabrave_model_rankings | model_accumulated | 1 | FIAT/STRADA | 68.733 |  | 0.898400 | 277 | 1. Fiat Strada 1.4 mpi Fire Flex 8V CE [0.898400]<br>2. Fiat Strada 1.4 mpi Fire Flex 8V CE [0.898400] | candidate_count=277; múltiplas versões FIPE próximas da mesma família/modelo |
| 6 | fenabrave_segment_model_rankings | segment_model_accumulated | 1 | FIAT/STRADA | 68.730 | 15.395 | 0.898400 | 277 | 1. Fiat Strada 1.4 mpi Fire Flex 8V CE [0.898400]<br>2. Fiat Strada 1.4 mpi Fire Flex 8V CE [0.898400] | candidate_count=277; múltiplas versões FIPE próximas da mesma família/modelo |
| 7 | fenabrave_segment_model_rankings | segment_model_accumulated | 1 | VW/POLO | 43.153 | 10.523 | 0.898400 | 192 | 1. VW - VolksWagen Polo 1.0 TSI Flex 12V 5p [0.898400]<br>2. VW - VolksWagen Polo 1.0 TSI Flex 12V 5p [0.898400] | candidate_count=192; múltiplas versões FIPE próximas da mesma família/modelo |
| 8 | fenabrave_model_rankings | model_accumulated | 1 | VW/POLO | 43.153 |  | 0.898400 | 192 | 1. VW - VolksWagen Polo 1.0 TSI Flex 12V 5p [0.898400]<br>2. VW - VolksWagen Polo 1.0 TSI Flex 12V 5p [0.898400] | candidate_count=192; múltiplas versões FIPE próximas da mesma família/modelo |
| 9 | fenabrave_segment_model_rankings | segment_model_accumulated | 1 | VW/T CROSS | 36.295 | 9.455 | 0.898400 | 36 | 1. VW - VolksWagen T-Cross 200 TSI 1.0  Flex 12V 5p Aut. [0.898400]<br>2. VW - VolksWagen T-Cross 200 TSI 1.0  Flex 12V 5p Aut. [0.898400] | candidate_count=36; múltiplas versões FIPE próximas da mesma família/modelo |
| 10 | fenabrave_model_rankings | model_accumulated | 3 | VW/T CROSS | 36.295 |  | 0.898400 | 36 | 1. VW - VolksWagen T-Cross 200 TSI 1.0  Flex 12V 5p Aut. [0.898400]<br>2. VW - VolksWagen T-Cross 200 TSI 1.0  Flex 12V 5p Aut. [0.898400] | candidate_count=36; múltiplas versões FIPE próximas da mesma família/modelo |
| 11 | fenabrave_segment_model_rankings | segment_model_accumulated | 3 | FIAT/ARGO | 36.199 | 8.274 | 0.898400 | 158 | 1. Fiat ARGO 1.0 6V Flex [0.898400]<br>2. Fiat ARGO 1.0 6V Flex [0.898400] | candidate_count=158; múltiplas versões FIPE próximas da mesma família/modelo |
| 12 | fenabrave_model_rankings | model_accumulated | 4 | FIAT/ARGO | 36.199 |  | 0.898400 | 158 | 1. Fiat ARGO 1.0 6V Flex [0.898400]<br>2. Fiat ARGO 1.0 6V Flex [0.898400] | candidate_count=158; múltiplas versões FIPE próximas da mesma família/modelo |
| 13 | fenabrave_segment_model_rankings | segment_model_accumulated | 2 | VW/TERA | 32.131 | 7.574 | 0.898400 | 8 | 1. VW - VolksWagen Tera 1.0 170 TSI Flex 12V 5p Mec. [0.898400]<br>2. VW - VolksWagen Tera 1.0 170 TSI Flex 12V 5p Mec. [0.898400] | candidate_count=8; múltiplas versões FIPE próximas da mesma família/modelo |
| 14 | fenabrave_model_rankings | model_accumulated | 5 | VW/TERA | 32.131 |  | 0.898400 | 8 | 1. VW - VolksWagen Tera 1.0 170 TSI Flex 12V 5p Mec. [0.898400]<br>2. VW - VolksWagen Tera 1.0 170 TSI Flex 12V 5p Mec. [0.898400] | candidate_count=8; múltiplas versões FIPE próximas da mesma família/modelo |
| 15 | fenabrave_segment_model_rankings | segment_model_accumulated | 4 | HYUNDAI/HB20 | 32.021 | 8.357 | 0.898400 | 314 | 1. Hyundai HB20 1 Million 1.6 Flex 16V Aut. [0.898400]<br>2. Hyundai HB20 5 Anos 1.6 Flex 16V Aut. [0.898400] | candidate_count=314; múltiplas versões FIPE próximas da mesma família/modelo |
| 16 | fenabrave_model_rankings | model_accumulated | 6 | HYUNDAI/HB20 | 32.021 |  | 0.898400 | 314 | 1. Hyundai HB20 1 Million 1.6 Flex 16V Aut. [0.898400]<br>2. Hyundai HB20 5 Anos 1.6 Flex 16V Aut. [0.898400] | candidate_count=314; múltiplas versões FIPE próximas da mesma família/modelo |
| 17 | fenabrave_segment_model_rankings | segment_model_accumulated | 3 | HYUNDAI/CRETA | 30.392 | 6.599 | 0.898400 | 91 | 1. Hyundai Creta 1 Million 1.6 16V Flex Aut. [0.898400]<br>2. Hyundai Creta Attitude 1.6 16V Flex Aut. [0.898400] | candidate_count=91; múltiplas versões FIPE próximas da mesma família/modelo |
| 18 | fenabrave_model_rankings | model_accumulated | 7 | HYUNDAI/CRETA | 30.392 |  | 0.898400 | 91 | 1. Hyundai Creta 1 Million 1.6 16V Flex Aut. [0.898400]<br>2. Hyundai Creta Attitude 1.6 16V Flex Aut. [0.898400] | candidate_count=91; múltiplas versões FIPE próximas da mesma família/modelo |
| 19 | fenabrave_segment_model_rankings | segment_model_accumulated | 5 | BYD/DOLPHIN MINI | 29.215 | 7.577 | 0.898400 | 5 | 1. BYD Dolphin Mini (Elétrico) [0.898400]<br>2. BYD Dolphin Mini (Elétrico) [0.898400] | candidate_count=5; múltiplas versões FIPE próximas da mesma família/modelo |
| 20 | fenabrave_model_rankings | model_accumulated | 8 | BYD/DOLPHIN MINI | 29.215 |  | 0.898400 | 5 | 1. BYD Dolphin Mini (Elétrico) [0.898400]<br>2. BYD Dolphin Mini (Elétrico) [0.898400] | candidate_count=5; múltiplas versões FIPE próximas da mesma família/modelo |
| 21 | fenabrave_segment_model_rankings | segment_model_accumulated | 5 | GM/TRACKER | 24.733 | 5.099 | 0.898400 | 72 | 1. GM - Chevrolet TRACKER 100 Anos 1.2 Turbo 12V Aut.  [0.898400]<br>2. GM - Chevrolet TRACKER 100 Anos 1.2 Turbo 12V Aut.  [0.898400] | candidate_count=72; múltiplas versões FIPE próximas da mesma família/modelo |
| 22 | fenabrave_model_rankings | model_accumulated | 12 | GM/TRACKER | 24.733 |  | 0.898400 | 72 | 1. GM - Chevrolet TRACKER 100 Anos 1.2 Turbo 12V Aut.  [0.898400]<br>2. GM - Chevrolet TRACKER 100 Anos 1.2 Turbo 12V Aut.  [0.898400] | candidate_count=72; múltiplas versões FIPE próximas da mesma família/modelo |
| 23 | fenabrave_segment_model_rankings | segment_model_accumulated | 8 | FIAT/FASTBACK | 20.628 | 4.121 | 0.898400 | 29 | 1. Fiat Fastback 1.0 200 Turbo Flex Aut [0.898400]<br>2. Fiat Fastback 1.0 200 Turbo Flex Aut [0.898400] | candidate_count=29; múltiplas versões FIPE próximas da mesma família/modelo |
| 24 | fenabrave_model_rankings | model_accumulated | 15 | FIAT/FASTBACK | 20.628 |  | 0.898400 | 29 | 1. Fiat Fastback 1.0 200 Turbo Flex Aut [0.898400]<br>2. Fiat Fastback 1.0 200 Turbo Flex Aut [0.898400] | candidate_count=29; múltiplas versões FIPE próximas da mesma família/modelo |
| 25 | fenabrave_segment_model_rankings | segment_model_accumulated | 9 | FIAT/PULSE | 20.566 | 4.763 | 0.898400 | 40 | 1. Fiat PULSE 1.0 Turbo 200  Flex Aut. [0.898400]<br>2. Fiat PULSE 1.0 Turbo 200  Flex Aut. [0.898400] | candidate_count=40; múltiplas versões FIPE próximas da mesma família/modelo |
| 26 | fenabrave_model_rankings | model_accumulated | 16 | FIAT/PULSE | 20.566 |  | 0.898400 | 40 | 1. Fiat PULSE 1.0 Turbo 200  Flex Aut. [0.898400]<br>2. Fiat PULSE 1.0 Turbo 200  Flex Aut. [0.898400] | candidate_count=40; múltiplas versões FIPE próximas da mesma família/modelo |
| 27 | fenabrave_model_rankings | model_accumulated | 3 | VW/SAVEIRO | 20.118 |  | 0.898400 | 227 | 1. VW - VolksWagen Saveiro 1.6 Mi Total Flex 8V CE [0.898400]<br>2. VW - VolksWagen Saveiro 1.6 Mi/ 1.6 Mi Total Flex 8V [0.898400] | candidate_count=227; múltiplas versões FIPE próximas da mesma família/modelo |
| 28 | fenabrave_segment_model_rankings | segment_model_accumulated | 2 | VW/SAVEIRO | 20.117 | 3.098 | 0.898400 | 227 | 1. VW - VolksWagen Saveiro 1.6 Mi Total Flex 8V CE [0.898400]<br>2. VW - VolksWagen Saveiro 1.6 Mi/ 1.6 Mi Total Flex 8V [0.898400] | candidate_count=227; múltiplas versões FIPE próximas da mesma família/modelo |
| 29 | fenabrave_segment_model_rankings | segment_model_accumulated | 2 | TOYOTA/HILUX | 19.479 | 3.982 | 0.898400 | 423 | 1. Toyota Hilux 4x2 2.8 Diesel [0.898400]<br>2. Toyota Hilux 4x2 2.8 Diesel [0.898400] | candidate_count=423; múltiplas versões FIPE próximas da mesma família/modelo |
| 30 | fenabrave_model_rankings | model_accumulated | 4 | TOYOTA/HILUX | 19.479 |  | 0.898400 | 423 | 1. Toyota Hilux 4x2 2.8 Diesel [0.898400]<br>2. Toyota Hilux 4x2 2.8 Diesel [0.898400] | candidate_count=423; múltiplas versões FIPE próximas da mesma família/modelo |
| 31 | fenabrave_segment_model_rankings | segment_model_accumulated | 1 | HYUNDAI/HB20S | 17.349 | 5.205 | 0.898400 | 123 | 1. Hyundai HB20S 1 Million 1.6 Flex 16V Aut. 4p [0.898400]<br>2. Hyundai HB20S 5 Anos 1.6 Flex 16V Aut. [0.898400] | candidate_count=123; múltiplas versões FIPE próximas da mesma família/modelo |
| 32 | fenabrave_model_rankings | model_accumulated | 18 | HYUNDAI/HB20S | 17.349 |  | 0.898400 | 123 | 1. Hyundai HB20S 1 Million 1.6 Flex 16V Aut. 4p [0.898400]<br>2. Hyundai HB20S 5 Anos 1.6 Flex 16V Aut. [0.898400] | candidate_count=123; múltiplas versões FIPE próximas da mesma família/modelo |
| 33 | fenabrave_segment_model_rankings | segment_model_accumulated | 11 | JEEP/RENEGADE | 16.522 | 4.323 | 0.898400 | 104 | 1. Jeep Renegade 75 Anos 2.0 4X4 TB Diesel Aut. [0.898400]<br>2. Jeep Renegade 75 Anos 2.0 4X4 TB Diesel Aut. [0.898400] | candidate_count=104; múltiplas versões FIPE próximas da mesma família/modelo |
| 34 | fenabrave_model_rankings | model_accumulated | 19 | JEEP/RENEGADE | 16.522 |  | 0.898400 | 104 | 1. Jeep Renegade 75 Anos 2.0 4X4 TB Diesel Aut. [0.898400]<br>2. Jeep Renegade 75 Anos 2.0 4X4 TB Diesel Aut. [0.898400] | candidate_count=104; múltiplas versões FIPE próximas da mesma família/modelo |
| 35 | fenabrave_segment_model_rankings | segment_model_accumulated | 12 | GWM/HAVAL H6 | 16.196 | 4.328 | 0.898400 | 28 | 1. GWM Haval H6 35 1.5 AWD [0.898400]<br>2. GWM Haval H6 35 1.5 AWD [0.898400] | candidate_count=28; múltiplas versões FIPE próximas da mesma família/modelo |
| 36 | fenabrave_model_rankings | model_accumulated | 21 | GWM/HAVAL H6 | 16.196 |  | 0.898400 | 28 | 1. GWM Haval H6 35 1.5 AWD [0.898400]<br>2. GWM Haval H6 35 1.5 AWD [0.898400] | candidate_count=28; múltiplas versões FIPE próximas da mesma família/modelo |
| 37 | fenabrave_segment_model_rankings | segment_model_accumulated | 3 | FORD/RANGER | 14.022 | 3.530 | 0.898400 | 489 | 1. Ford Ranger 2.5 4x4 CD TB Diesel [0.898400]<br>2. Ford Ranger 2.5 4x4 CE TB Diesel [0.898400] | candidate_count=489; múltiplas versões FIPE próximas da mesma família/modelo |
| 38 | fenabrave_model_rankings | model_accumulated | 5 | FORD/RANGER | 14.022 |  | 0.898400 | 489 | 1. Ford Ranger 2.5 4x4 CD TB Diesel [0.898400]<br>2. Ford Ranger 2.5 4x4 CE TB Diesel [0.898400] | candidate_count=489; múltiplas versões FIPE próximas da mesma família/modelo |
| 39 | fenabrave_segment_model_rankings | segment_model_accumulated | 2 | VW/VIRTUS | 13.243 | 2.931 | 0.898400 | 54 | 1. VW - VolksWagen VIRTUS TSI 1.0 Flex 12V 4p Aut. [0.898400]<br>2. VW - VolksWagen VIRTUS TSI 1.0 Flex 12V 4p Mec. [0.898400] | candidate_count=54; múltiplas versões FIPE próximas da mesma família/modelo |
| 40 | fenabrave_model_rankings | model_accumulated | 25 | VW/VIRTUS | 13.243 |  | 0.898400 | 54 | 1. VW - VolksWagen VIRTUS TSI 1.0 Flex 12V 4p Aut. [0.898400]<br>2. VW - VolksWagen VIRTUS TSI 1.0 Flex 12V 4p Mec. [0.898400] | candidate_count=54; múltiplas versões FIPE próximas da mesma família/modelo |
| 41 | fenabrave_segment_model_rankings | segment_model_accumulated | 17 | CAOA CHERY/TIGGO 7 | 12.092 | 2.883 | 0.898400 | 63 | 1. Caoa Chery Tiggo 7 PRO 1.5 Turbo (Híbrido)   [0.898400]<br>2. Caoa Chery Tiggo 7 Pro Max Drive 1.5 TB (Hibrido) [0.898400] | candidate_count=63; múltiplas versões FIPE próximas da mesma família/modelo |
| 42 | fenabrave_model_rankings | model_accumulated | 28 | CAOA CHERY/TIGGO 7 | 12.092 |  | 0.898400 | 63 | 1. Caoa Chery Tiggo 7 PRO 1.5 Turbo (Híbrido)   [0.898400]<br>2. Caoa Chery Tiggo 7 Pro Max Drive 1.5 TB (Hibrido) [0.898400] | candidate_count=63; múltiplas versões FIPE próximas da mesma família/modelo |
| 43 | fenabrave_segment_model_rankings | segment_model_accumulated | 18 | CAOA CHERY/TIGGO 5X | 11.924 | 2.482 | 0.898400 | 63 | 1. Caoa Chery Tiggo 5X PRO Max Drive1.5 TB (Híbrido) [0.898400]<br>2. Caoa Chery Tiggo 5X PRO 1.5 Turbo (Híbrido) [0.898400] | candidate_count=63; múltiplas versões FIPE próximas da mesma família/modelo |
| 44 | fenabrave_model_rankings | model_accumulated | 29 | CAOA CHERY/TIGGO 5X | 11.924 |  | 0.898400 | 63 | 1. Caoa Chery Tiggo 5X PRO Max Drive1.5 TB (Híbrido) [0.898400]<br>2. Caoa Chery Tiggo 5X PRO 1.5 Turbo (Híbrido) [0.898400] | candidate_count=63; múltiplas versões FIPE próximas da mesma família/modelo |
| 45 | fenabrave_segment_model_rankings | segment_model_accumulated | 2 | FIAT/CRONOS | 9.665 | 2.734 | 0.898400 | 47 | 1. Fiat CRONOS 1.0 6V Flex [0.898400]<br>2. Fiat CRONOS 1.8 16V Flex Aut.  [0.898400] | candidate_count=47; múltiplas versões FIPE próximas da mesma família/modelo |
| 46 | fenabrave_model_rankings | model_accumulated | 33 | FIAT/CRONOS | 9.665 |  | 0.898400 | 47 | 1. Fiat CRONOS 1.0 6V Flex [0.898400]<br>2. Fiat CRONOS 1.8 16V Flex Aut.  [0.898400] | candidate_count=47; múltiplas versões FIPE próximas da mesma família/modelo |
| 47 | fenabrave_segment_model_rankings | segment_model_accumulated | 1 | GM/SPIN | 8.022 | 2.254 | 0.898400 | 106 | 1. GM - Chevrolet SPIN 1.8 8V Econo.Flex 5p Aut. [0.898400]<br>2. GM - Chevrolet SPIN 1.8 8V Econo.Flex 5p Aut. [0.898400] | candidate_count=106; múltiplas versões FIPE próximas da mesma família/modelo |
| 48 | fenabrave_model_rankings | model_accumulated | 34 | GM/SPIN | 8.022 |  | 0.898400 | 106 | 1. GM - Chevrolet SPIN 1.8 8V Econo.Flex 5p Aut. [0.898400]<br>2. GM - Chevrolet SPIN 1.8 8V Econo.Flex 5p Aut. [0.898400] | candidate_count=106; múltiplas versões FIPE próximas da mesma família/modelo |
| 49 | fenabrave_model_rankings | model_accumulated | 9 | GM/MONTANA | 6.766 |  | 0.898400 | 74 | 1. GM - Chevrolet MONTANA 1.2 Turbo Flex 12V 4p Mec. [0.898400]<br>2. GM - Chevrolet MONTANA 1.2 Turbo Flex 12V 4p Mec. [0.898400] | candidate_count=74; múltiplas versões FIPE próximas da mesma família/modelo |
| 50 | fenabrave_segment_model_rankings | segment_model_accumulated | 6 | GM/MONTANA | 6.759 | 1.542 | 0.898400 | 74 | 1. GM - Chevrolet MONTANA 1.2 Turbo Flex 12V 4p Mec. [0.898400]<br>2. GM - Chevrolet MONTANA 1.2 Turbo Flex 12V 4p Mec. [0.898400] | candidate_count=74; múltiplas versões FIPE próximas da mesma família/modelo |
| 51 | fenabrave_segment_model_rankings | segment_model_accumulated | 23 | RENAULT/KARDIAN | 6.270 | 1.266 | 0.898400 | 18 | 1. Renault Kardian Authentic 1.0 TB 12V 5p Aut. [0.898400]<br>2. Renault Kardian Authentic 1.0 TB 12V 5p Aut. [0.898400] | candidate_count=18; múltiplas versões FIPE próximas da mesma família/modelo |
| 52 | fenabrave_model_rankings | model_accumulated | 39 | RENAULT/KARDIAN | 6.270 |  | 0.898400 | 18 | 1. Renault Kardian Authentic 1.0 TB 12V 5p Aut. [0.898400]<br>2. Renault Kardian Authentic 1.0 TB 12V 5p Aut. [0.898400] | candidate_count=18; múltiplas versões FIPE próximas da mesma família/modelo |
| 53 | fenabrave_segment_model_rankings | segment_model_accumulated | 25 | CAOA CHERY/TIGGO 8 | 5.773 | 1.289 | 0.898400 | 63 | 1. Caoa Chery Tiggo 8 PRO 1.5 Turbo (Híbrido)  [0.898400]<br>2. Caoa Chery Tiggo 8 PRO 1.5 Turbo (Híbrido)  [0.898400] | candidate_count=63; múltiplas versões FIPE próximas da mesma família/modelo |
| 54 | fenabrave_model_rankings | model_accumulated | 42 | CAOA CHERY/TIGGO 8 | 5.773 |  | 0.898400 | 63 | 1. Caoa Chery Tiggo 8 PRO 1.5 Turbo (Híbrido)  [0.898400]<br>2. Caoa Chery Tiggo 8 PRO 1.5 Turbo (Híbrido)  [0.898400] | candidate_count=63; múltiplas versões FIPE próximas da mesma família/modelo |
| 55 | fenabrave_segment_model_rankings | segment_model_accumulated | 26 | TOYOTA/HILUX SW4 | 5.656 | 1.187 | 0.898400 | 112 | 1. Toyota Hilux SW4 4x4 3.0 8V TB Diesel [0.898400]<br>2. Toyota Hilux SW4 4x4 3.0 8V TB Diesel [0.898400] | candidate_count=112; múltiplas versões FIPE próximas da mesma família/modelo |
| 56 | fenabrave_model_rankings | model_accumulated | 43 | TOYOTA/HILUX SW4 | 5.656 |  | 0.898400 | 112 | 1. Toyota Hilux SW4 4x4 3.0 8V TB Diesel [0.898400]<br>2. Toyota Hilux SW4 4x4 3.0 8V TB Diesel [0.898400] | candidate_count=112; múltiplas versões FIPE próximas da mesma família/modelo |
| 57 | fenabrave_segment_model_rankings | segment_model_accumulated | 8 | CITROEN/C3 | 5.634 | 1.267 | 0.898400 | 194 | 1. Citroën C3 Attraction 1.6 Flex 16V 5p Aut. [0.898400]<br>2. Citroën C3 100 Anos 1.6 16V Flex Aut. [0.898400] | candidate_count=194; múltiplas versões FIPE próximas da mesma família/modelo |
| 58 | fenabrave_model_rankings | model_accumulated | 44 | CITROEN/C3 | 5.634 |  | 0.898400 | 194 | 1. Citroën C3 Attraction 1.6 Flex 16V 5p Aut. [0.898400]<br>2. Citroën C3 100 Anos 1.6 16V Flex Aut. [0.898400] | candidate_count=194; múltiplas versões FIPE próximas da mesma família/modelo |
| 59 | fenabrave_segment_model_rankings | segment_model_accumulated | 27 | RENAULT/DUSTER | 5.240 | 1.225 | 0.898400 | 162 | 1. Renault DUSTER Authent. 1.6 Flex 16V Aut. [0.898400]<br>2. Renault DUSTER Authent. 1.6 Flex 16V Aut. [0.898400] | candidate_count=162; múltiplas versões FIPE próximas da mesma família/modelo |
| 60 | fenabrave_model_rankings | model_accumulated | 45 | RENAULT/DUSTER | 5.240 |  | 0.898400 | 162 | 1. Renault DUSTER Authent. 1.6 Flex 16V Aut. [0.898400]<br>2. Renault DUSTER Authent. 1.6 Flex 16V Aut. [0.898400] | candidate_count=162; múltiplas versões FIPE próximas da mesma família/modelo |
| 61 | fenabrave_model_rankings | model_accumulated | 11 | RENAULT/MASTER | 4.481 |  | 0.898400 | 210 | 1. Renault Master 2.3 dCi Executive Longo 16L Dies [0.898400]<br>2. Renault Master 2.3 dCi Executive Longo 16L Dies [0.898400] | candidate_count=210; múltiplas versões FIPE próximas da mesma família/modelo |
| 62 | fenabrave_segment_model_rankings | segment_model_accumulated | 1 | RENAULT/MASTER | 4.475 | 839 | 0.898400 | 210 | 1. Renault Master 2.3 dCi Executive Longo 16L Dies [0.898400]<br>2. Renault Master 2.3 dCi Executive Longo 16L Dies [0.898400] | candidate_count=210; múltiplas versões FIPE próximas da mesma família/modelo |
| 63 | fenabrave_segment_model_rankings | segment_model_accumulated | 4 | NISSAN/VERSA | 3.110 | 357 | 0.898400 | 76 | 1. Nissan VERSA 1.0 12V FlexStart 4p Mec. [0.898400]<br>2. Nissan VERSA 1.0 12V FlexStart 4p Mec. [0.898400] | candidate_count=76; múltiplas versões FIPE próximas da mesma família/modelo |
| 64 | fenabrave_segment_model_rankings | segment_model_accumulated | 37 | GWM/TANK 300 | 2.415 | 365 | 0.898400 | 4 | 1. GWM Tank 300 2.0 16V AWD Aut.(Hibrido) [0.898400]<br>2. GWM Tank 300 2.0 16V AWD Aut.(Hibrido) [0.898400] | candidate_count=4; múltiplas versões FIPE próximas da mesma família/modelo |
| 65 | fenabrave_segment_model_rankings | segment_model_accumulated | 38 | LEAPMOTOR/C10 | 2.332 | 630 | 0.898400 | 4 | 1. Leapmotor C10 (Híbrido) [0.898400]<br>2. Leapmotor C10 (Elétrico) [0.898400] | candidate_count=4; múltiplas versões FIPE próximas da mesma família/modelo |
| 66 | fenabrave_model_rankings | model_accumulated | 20 | FIAT/DUCATO | 1.359 |  | 0.898400 | 205 | 1. Fiat Ducato-15 2.8 Furgão TB Diesel [0.898400]<br>2. Fiat Ducato-15 2.8 Furgão TB Diesel [0.898400] | candidate_count=205; múltiplas versões FIPE próximas da mesma família/modelo |
| 67 | fenabrave_segment_model_rankings | segment_model_accumulated | 4 | FIAT/DUCATO | 1.358 | 374 | 0.898400 | 205 | 1. Fiat Ducato-15 2.8 Furgão TB Diesel [0.898400]<br>2. Fiat Ducato-15 2.8 Furgão TB Diesel [0.898400] | candidate_count=205; múltiplas versões FIPE próximas da mesma família/modelo |
| 68 | fenabrave_segment_model_rankings | segment_model_accumulated | 2 | RENAULT/KANGOO | 1.328 | 371 | 0.898400 | 77 | 1. Renault Kangoo Authentique Hi-Flex 1.6 16V [0.898400]<br>2. Renault Kangoo Authentique Hi-Flex 1.6 16V [0.898400] | candidate_count=77; múltiplas versões FIPE próximas da mesma família/modelo |
| 69 | fenabrave_model_rankings | model_accumulated | 21 | RENAULT/KANGOO | 1.328 |  | 0.898400 | 77 | 1. Renault Kangoo Authentique Hi-Flex 1.6 16V [0.898400]<br>2. Renault Kangoo Authentique Hi-Flex 1.6 16V [0.898400] | candidate_count=77; múltiplas versões FIPE próximas da mesma família/modelo |
| 70 | fenabrave_segment_model_rankings | segment_model_accumulated | 7 | IVECO/DAILY | 1.094 | 400 | 0.898400 | 212 | 1. IVECO Daily 45-160 Vetrato 3.0 (Diesel) (E6) [0.898400]<br>2. IVECO Daily 50-180 Vetrato 3.0 (Diesel) (E6) [0.898400] | candidate_count=212; múltiplas versões FIPE próximas da mesma família/modelo |
| 71 | fenabrave_model_rankings | model_accumulated | 24 | IVECO/DAILY | 1.094 |  | 0.898400 | 212 | 1. IVECO Daily 45-160 Vetrato 3.0 (Diesel) (E6) [0.898400]<br>2. IVECO Daily 50-180 Vetrato 3.0 (Diesel) (E6) [0.898400] | candidate_count=212; múltiplas versões FIPE próximas da mesma família/modelo |
| 72 | fenabrave_model_rankings | model_accumulated | 28 | NISSAN/FRONTIER | 845 |  | 0.898400 | 149 | 1. Nissan Frontier ATTAC.CD 4x4 2.3 Bi-TB Die. Aut [0.898400]<br>2. Nissan Frontier ATTAC.CD 4x4 2.3 Bi-TB Die. Aut [0.898400] | candidate_count=149; múltiplas versões FIPE próximas da mesma família/modelo |
| 73 | fenabrave_segment_model_rankings | segment_model_accumulated | 3 | VW/JETTA | 716 | 148 | 0.898400 | 64 | 1. VW - VolksWagen JETTA 250 TSI 1.4 flex 16v Aut. [0.898400]<br>2. VW - VolksWagen JETTA 250 TSI 1.4 flex 16v Aut. [0.898400] | candidate_count=64; múltiplas versões FIPE próximas da mesma família/modelo |
| 74 | fenabrave_model_rankings | model_accumulated | 30 | CITROEN/JUMPY | 638 |  | 0.898400 | 34 | 1. Citroën Jumpy 2.2  Vitré Turbo [0.898400]<br>2. Citroën Jumpy 2.2  Cargo Turbo [0.898400] | candidate_count=34; múltiplas versões FIPE próximas da mesma família/modelo |
| 75 | fenabrave_segment_model_rankings | segment_model_accumulated | 4 | BYD/SEAL | 634 | 121 | 0.898400 | 4 | 1. BYD Seal (Elétrico) [0.898400]<br>2. BYD Seal (Elétrico) [0.898400] | candidate_count=4; múltiplas versões FIPE próximas da mesma família/modelo |
| 76 | fenabrave_segment_model_rankings | segment_model_accumulated | 1 | PORSCHE/911 | 576 | 111 | 0.898400 | 357 | 1. Porsche 911 Turbo S Cabriolet 3.6/3.8(991/992) [0.898400]<br>2. Porsche 911 Turbo S Coupe 3.6/3.8 24V (991/992) [0.898400] | candidate_count=357; múltiplas versões FIPE próximas da mesma família/modelo |
| 77 | fenabrave_model_rankings | model_accumulated | 32 | FOTON/AUMARK S 315 | 383 |  | 0.898400 | 13 | 1. FOTON AUMARK S 315 2.5 4x2 Longo Diesel (E6) AMT [0.898400]<br>2. FOTON AUMARK S 315 2.5 4x2 Longo Diesel (E6) [0.898400] | candidate_count=13; múltiplas versões FIPE próximas da mesma família/modelo |
| 78 | fenabrave_segment_model_rankings | segment_model_accumulated | 5 | AUDI/A5 | 354 | 51 | 0.898400 | 55 | 1. Audi A5 Attraction Sportb. 2.0 TFSI S tronic [0.898400]<br>2. Audi A5 3.2 FSI V6 24V 269cv Quattro Tiptroni [0.898400] | candidate_count=55; múltiplas versões FIPE próximas da mesma família/modelo |
| 79 | fenabrave_model_rankings | model_accumulated | 35 | M.BENZ/SPRINTER 317 | 337 |  | 0.898400 | 623 | 1. Mercedes-Benz Sprinter 317 Furgão Extra Lon. T. A. 2.0 Aut. (E6) [0.898400]<br>2. Mercedes-Benz Sprinter 317 Furgão Longo T.A. 2.0 Aut. (E6) [0.898400] | candidate_count=623; múltiplas versões FIPE próximas da mesma família/modelo |
| 80 | fenabrave_segment_model_rankings | segment_model_accumulated | 6 | NISSAN/SENTRA | 332 | 28 | 0.898400 | 90 | 1. Nissan Sentra 2.0/ 2.0 Flex Fuel 16V Aut. [0.898400]<br>2. Nissan Sentra 2.0/ 2.0 Flex Fuel 16V Aut. [0.898400] | candidate_count=90; múltiplas versões FIPE próximas da mesma família/modelo |
| 81 | fenabrave_model_rankings | model_accumulated | 36 | M.BENZ/SPRINTER 417 | 314 |  | 0.898400 | 623 | 1. Mercedes-Benz Sprinter 417 VAN Longo T. A. 2.0  16L Aut. (E6) [0.898400]<br>2. Mercedes-Benz Sprinter 417 VAN Longo T. A. 2.0  16L Aut. (E6) [0.898400] | candidate_count=623; múltiplas versões FIPE próximas da mesma família/modelo |
| 82 | fenabrave_model_rankings | model_accumulated | 38 | PEUGEOT/BOXER | 243 |  | 0.898400 | 89 | 1. Peugeot Boxer 2.3 LH Executive 15/16L TB Diesel [0.898400]<br>2. Peugeot Boxer 2.3 Minibus 15/16L TB Diesel. [0.898400] | candidate_count=89; múltiplas versões FIPE próximas da mesma família/modelo |
| 83 | fenabrave_segment_model_rankings | segment_model_accumulated | 1 | VW/GOLF | 220 | 195 | 0.898400 | 191 | 1. VW - VolksWagen Golf 1.6 Mi Total Flex 8V 4p [0.898400]<br>2. VW - VolksWagen Golf 2.0/ 2.0 Mi Flex Aut/Tiptronic. [0.898400] | candidate_count=191; múltiplas versões FIPE próximas da mesma família/modelo |
| 84 | fenabrave_segment_model_rankings | segment_model_accumulated | 2 | FORD/MUSTANG | 195 | 45 | 0.898400 | 48 | 1. Ford Mustang 3.8 V6 Conv. [0.898400]<br>2. Ford Mustang 3.8 V6 [0.898400] | candidate_count=48; múltiplas versões FIPE próximas da mesma família/modelo |
| 85 | fenabrave_model_rankings | model_accumulated | 40 | SHINERAY/TLUX | 194 |  | 0.898400 | 3 | 1. SHINERAY TLUX 1.6 16V Mec. [0.898400]<br>2. SHINERAY TLUX 1.6 16V Mec. [0.898400] | candidate_count=3; múltiplas versões FIPE próximas da mesma família/modelo |
| 86 | fenabrave_model_rankings | model_accumulated | 42 | CITROEN/JUMPER | 186 |  | 0.898400 | 72 | 1. Citroën Jumper 2.0 Minibus 16L Turbo Diesel [0.898400]<br>2. Citroën Jumper 2.0 FurgãoTurbo Diesel [0.898400] | candidate_count=72; múltiplas versões FIPE próximas da mesma família/modelo |
| 87 | fenabrave_model_rankings | model_accumulated | 44 | JAC/HUNTER | 159 |  | 0.898400 | 8 | 1. JAC HUNTER 4WORK 4X4 2.O CTI Diessel Aut. [0.898400]<br>2. JAC HUNTER 4WORK 4X4 2.O CTI Diessel Aut. [0.898400] | candidate_count=8; múltiplas versões FIPE próximas da mesma família/modelo |
| 88 | fenabrave_segment_model_rankings | segment_model_accumulated | 3 | PORSCHE/PANAMERA | 128 | 24 | 0.898400 | 97 | 1. Porsche Panamera Turbo S 4.0 (Híbrido) [0.898400]<br>2. Porsche Panamera Turbo 4.0 (Híbrido) [0.898400] | candidate_count=97; múltiplas versões FIPE próximas da mesma família/modelo |
| 89 | fenabrave_segment_model_rankings | segment_model_accumulated | 3 | BMW/M3 | 116 | 17 | 0.898400 | 61 | 1. BMW M3 3.2 24V [0.898400]<br>2. BMW M3 3.2 24V [0.898400] | candidate_count=61; múltiplas versões FIPE próximas da mesma família/modelo |
| 90 | fenabrave_segment_model_rankings | segment_model_accumulated | 8 | AUDI/A3 SEDAN | 94 | 23 | 0.898400 | 25 | 1. Audi A3 Sedan 1.4 TFSI Flex Tiptronic 4p [0.898400]<br>2. Audi A3 Sedan 1.4 TFSI Flex Tiptronic 4p [0.898400] | candidate_count=25; múltiplas versões FIPE próximas da mesma família/modelo |
| 91 | fenabrave_segment_model_rankings | segment_model_accumulated | 5 | GM/CORVETTE | 92 | 26 | 0.898400 | 34 | 1. GM - Chevrolet Corvette 5.7/ 6.0, 6.2 Conv./Stingray [0.898400]<br>2. GM - Chevrolet Corvette 5.7/ 6.0, 6.2 Targa/Stingray [0.898400] | candidate_count=34; múltiplas versões FIPE próximas da mesma família/modelo |
| 92 | fenabrave_model_rankings | model_accumulated | 46 | MITSUBISHI/L200 | 80 |  | 0.898400 | 253 | 1. Mitsubishi L200 2.5 4x4 CD Turbo Diesel [0.898400]<br>2. Mitsubishi L200 2.5 4x4 CD Turbo Diesel [0.898400] | candidate_count=253; múltiplas versões FIPE próximas da mesma família/modelo |
| 93 | fenabrave_segment_model_rankings | segment_model_accumulated | 3 | AUDI/A3 | 75 | 9 | 0.898400 | 208 | 1. Audi A3 1.8 Turbo 180cv 5p Aut./ Tip. [0.898400]<br>2. Audi A3 1.6 8V 102cv 3p [0.898400] | candidate_count=208; múltiplas versões FIPE próximas da mesma família/modelo |
| 94 | fenabrave_model_rankings | model_accumulated | 48 | HYUNDAI/HR | 75 |  | 0.898400 | 21 | 1. Hyundai HR 2.5 4WD Diesel  [0.898400]<br>2. Hyundai HR 2.5 4WD Diesel  [0.898400] | candidate_count=21; múltiplas versões FIPE próximas da mesma família/modelo |
| 95 | fenabrave_segment_model_rankings | segment_model_accumulated | 9 | CAOA CHERY/ARRIZO 6 | 67 | 5 | 0.898400 | 8 | 1. Caoa Chery ARRIZO 6 PRO Max Drive 1.5 Turbo (Híb.) [0.898400]<br>2. Caoa Chery ARRIZO 6 PRO 1.5 Turbo (Híbrido) [0.898400] | candidate_count=8; múltiplas versões FIPE próximas da mesma família/modelo |
| 96 | fenabrave_segment_model_rankings | segment_model_accumulated | 7 | PORSCHE/BOXSTER | 49 | 12 | 0.898400 | 104 | 1. Porsche Boxster 2.7 265cv [0.898400]<br>2. Porsche Boxster 2.7 265cv [0.898400] | candidate_count=104; múltiplas versões FIPE próximas da mesma família/modelo |
| 97 | fenabrave_segment_model_rankings | segment_model_accumulated | 9 | PORSCHE/CAYMAN | 27 | 6 | 0.898400 | 62 | 1. Porsche Cayman 2.7/ 2.9 [0.898400]<br>2. Porsche Cayman 2.7/ 2.9 [0.898400] | candidate_count=62; múltiplas versões FIPE próximas da mesma família/modelo |
| 98 | fenabrave_segment_model_rankings | segment_model_accumulated | 4 | FIAT/UNO | 10 | 2 | 0.898400 | 314 | 1. Fiat UNO ATTRACTIVE 1.0 Fire Flex 8V 5p [0.898400]<br>2. Fiat UNO ATTRACTIVE 1.0 Fire Flex 8V 5p [0.898400] | candidate_count=314; múltiplas versões FIPE próximas da mesma família/modelo |
| 99 | fenabrave_segment_model_rankings | segment_model_accumulated | 5 | HONDA/CIVIC TYPE-R | 10 | 1 | 0.898400 | 4 | 1. Honda Civic Type-R 2.0 Turbo 16V [0.898400]<br>2. Honda Civic Type-R 2.0 Turbo 16V [0.898400] | candidate_count=4; múltiplas versões FIPE próximas da mesma família/modelo |
| 100 | fenabrave_segment_model_rankings | segment_model_accumulated | 5 | VW/GOL | 7 | 0 | 0.898400 | 691 | 1. VW - VolksWagen Gol 1.0 Flex 12V 5p [0.898400]<br>2. VW - VolksWagen Gol 1.6 MSI Flex 16V 5p Aut. [0.898400] | candidate_count=691; múltiplas versões FIPE próximas da mesma família/modelo |

## Top 100 no_match

| # | origem | tipo | rank | Fenabrave | acum | mês | escopo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | fenabrave_segment_model_rankings | segment_model_accumulated | 1 | GM/ONIX PLUS | 16.446 | 3.806 | Sedans Compactos |
| 2 | fenabrave_model_rankings | model_accumulated | 20 | GM/ONIX PLUS | 16.446 |  | AUTOMÓVEIS |
| 3 | fenabrave_segment_model_rankings | segment_model_accumulated | 20 | OMODA JAECOO/OMODA 5 | 7.258 | 1.562 | Suv's |
| 4 | fenabrave_model_rankings | model_accumulated | 35 | OMODA JAECOO/OMODA 5 | 7.258 |  | AUTOMÓVEIS |
| 5 | fenabrave_segment_model_rankings | segment_model_accumulated | 32 | OMODA JAECOO/JAECOO 7 | 3.693 | 1.391 | Suv's |
| 6 | fenabrave_segment_model_rankings | segment_model_accumulated | 2 | KIA/K2500 | 1.711 | 368 | Furgões |
| 7 | fenabrave_model_rankings | model_accumulated | 16 | KIA/K2500 | 1.711 |  | COMERCIAIS LEVES |
| 8 | fenabrave_segment_model_rankings | segment_model_accumulated | 5 | VW TRUCK E BUS/EXPRESS | 1.111 | 337 | Furgões |
| 9 | fenabrave_model_rankings | model_accumulated | 22 | VW TRUCK E BUS/EXPRESS | 1.111 |  | COMERCIAIS LEVES |
| 10 | fenabrave_segment_model_rankings | segment_model_accumulated | 12 | MG/MG4 | 561 | 157 | Hatch Pequenos |
| 11 | fenabrave_model_rankings | model_accumulated | 31 | FORD/F150 | 494 |  | COMERCIAIS LEVES |
| 12 | fenabrave_segment_model_rankings | segment_model_accumulated | 2 | M.BENZ/CLASSE C | 479 | 84 | Sedans Grandes |
| 13 | fenabrave_segment_model_rankings | segment_model_accumulated | 3 | RENAULT/E-KWID | 217 | 2 | Veículos de Entrada |
| 14 | fenabrave_segment_model_rankings | segment_model_accumulated | 2 | KIA/CARNIVAL | 109 | 34 | Grandcab |
| 15 | fenabrave_segment_model_rankings | segment_model_accumulated | 2 | TOYOTA/GR YARIS | 85 | 71 | Hatch Médios |
| 16 | fenabrave_segment_model_rankings | segment_model_accumulated | 4 | BMW/M135I | 61 | 11 | Hatch Médios |
| 17 | fenabrave_segment_model_rankings | segment_model_accumulated | 13 | M.BENZ/CLA200 | 53 | 2 | Sedans médios |
| 18 | fenabrave_model_rankings | model_accumulated | 49 | KIA/UK2500 | 51 |  | COMERCIAIS LEVES |
| 19 | fenabrave_segment_model_rankings | segment_model_accumulated | 5 | M.BENZ/CLASSE E | 50 | 6 | Sedans Grandes |
| 20 | fenabrave_segment_model_rankings | segment_model_accumulated | 8 | DODGE/CHALLENGER | 37 | 14 | Sports |
| 21 | fenabrave_segment_model_rankings | segment_model_accumulated | 1 | AUDI/RS6 AVANT | 25 | 5 | Sw Grandes |
| 22 | fenabrave_segment_model_rankings | segment_model_accumulated | 10 | M.BENZ/AMG GT63S | 21 | 1 | Sedans Grandes |
| 23 | fenabrave_segment_model_rankings | segment_model_accumulated | 15 | M.BENZ/CLA45 | 20 | 2 | Sedans médios |
| 24 | fenabrave_segment_model_rankings | segment_model_accumulated | 16 | M.BENZ/CLA35 | 17 | 1 | Sedans médios |
| 25 | fenabrave_segment_model_rankings | segment_model_accumulated | 3 | VW/ID.BUZZ | 12 | 7 | Grandcab |
| 26 | fenabrave_segment_model_rankings | segment_model_accumulated | 12 | M.BENZ/S63 | 9 | 2 | Sedans Grandes |
| 27 | fenabrave_segment_model_rankings | segment_model_accumulated | 18 | GM/CRUZE SEDAN | 4 | 1 | Sedans médios |
| 28 | fenabrave_segment_model_rankings | segment_model_accumulated | 4 | TOYOTA/SIENNA | 3 | 0 | Grandcab |
| 29 | fenabrave_segment_model_rankings | segment_model_accumulated | 5 | TOYOTA/YARIS SEDAN | 2 | 0 | Sedans Compactos |
| 30 | fenabrave_segment_model_rankings | segment_model_accumulated | 19 | M.BENZ/AMG C63S | 2 | 0 | Sedans médios |
| 31 | fenabrave_segment_model_rankings | segment_model_accumulated | 4 | FORD/RANCHERO | 1 | 0 | Pick-up's Pequenas |
| 32 | fenabrave_segment_model_rankings | segment_model_accumulated | 9 | TOYOTA/ETIOS SEDAN | 1 | 0 | Sedans Pequenos |
| 33 | fenabrave_model_rankings | model_month | 23 | GM/ONIX PLUS |  | 3.806 | AUTOMÓVEIS |
| 34 | fenabrave_model_rankings | model_month | 39 | OMODA JAECOO/OMODA 5 |  | 1.562 | AUTOMÓVEIS |
| 35 | fenabrave_model_rankings | model_month | 42 | OMODA JAECOO/JAECOO 7 |  | 1.391 | AUTOMÓVEIS |
| 36 | fenabrave_model_rankings | model_month | 21 | KIA/K2500 |  | 368 | COMERCIAIS LEVES |
| 37 | fenabrave_model_rankings | model_month | 23 | VW TRUCK E BUS/EXPRESS |  | 337 | COMERCIAIS LEVES |
| 38 | fenabrave_model_rankings | model_month | 31 | FORD/F150 |  | 129 | COMERCIAIS LEVES |
| 39 | fenabrave_model_rankings | model_month | 40 | RIDDARA/RD6 |  | 42 | COMERCIAIS LEVES |
| 40 | fenabrave_model_rankings | model_month | 47 | JAC/EJV5.5 |  | 15 | COMERCIAIS LEVES |

## Aliases sugeridos

Os aliases abaixo são confirmados por presença de marcas FIPE equivalentes e já estão refletidos na normalização atual de staging. Por isso, a simulação de reaplicar estes aliases não aumenta a cobertura neste estado.

| Fenabrave | FIPE sugerido | marcas FIPE | linhas FIPE | evidência |
| --- | --- | --- | --- | --- |
| CAOA CHERY | Caoa Chery | 1 | 74 | presente nas linhas Fenabrave |
| GM | GM - Chevrolet | 1 | 2.642 | presente nas linhas Fenabrave |
| M.BENZ | Mercedes-Benz | 1 | 2.277 | presente nas linhas Fenabrave |
| VW | VW - VolksWagen | 1 | 2.719 | presente nas linhas Fenabrave |

## Estimativa de ganho de cobertura por aliases

| cenário | modelos | com match | cobertura modelos | emplacamentos | emplacamentos cobertos | cobertura volume |
| --- | --- | --- | --- | --- | --- | --- |
| atual | 362 | 322 | 88.95% | 2.077.700 | 2.018.641 | 97.16% |
| após aliases conhecidos | 362 | 322 | 88.95% | 2.077.700 | 2.018.641 | 97.16% |

## Ranking de impacto: top 50 sem match

| # | origem | tipo | rank | Fenabrave | impacto | acum | mês | escopo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | fenabrave_model_rankings | model_accumulated | 20 | GM/ONIX PLUS | 16.446 | 16.446 |  | AUTOMÓVEIS |
| 2 | fenabrave_segment_model_rankings | segment_model_accumulated | 1 | GM/ONIX PLUS | 16.446 | 16.446 | 3.806 | Sedans Compactos |
| 3 | fenabrave_segment_model_rankings | segment_model_accumulated | 20 | OMODA JAECOO/OMODA 5 | 7.258 | 7.258 | 1.562 | Suv's |
| 4 | fenabrave_model_rankings | model_accumulated | 35 | OMODA JAECOO/OMODA 5 | 7.258 | 7.258 |  | AUTOMÓVEIS |
| 5 | fenabrave_model_rankings | model_month | 23 | GM/ONIX PLUS | 3.806 |  | 3.806 | AUTOMÓVEIS |
| 6 | fenabrave_segment_model_rankings | segment_model_accumulated | 32 | OMODA JAECOO/JAECOO 7 | 3.693 | 3.693 | 1.391 | Suv's |
| 7 | fenabrave_model_rankings | model_accumulated | 16 | KIA/K2500 | 1.711 | 1.711 |  | COMERCIAIS LEVES |
| 8 | fenabrave_segment_model_rankings | segment_model_accumulated | 2 | KIA/K2500 | 1.711 | 1.711 | 368 | Furgões |
| 9 | fenabrave_model_rankings | model_month | 39 | OMODA JAECOO/OMODA 5 | 1.562 |  | 1.562 | AUTOMÓVEIS |
| 10 | fenabrave_model_rankings | model_month | 42 | OMODA JAECOO/JAECOO 7 | 1.391 |  | 1.391 | AUTOMÓVEIS |
| 11 | fenabrave_segment_model_rankings | segment_model_accumulated | 5 | VW TRUCK E BUS/EXPRESS | 1.111 | 1.111 | 337 | Furgões |
| 12 | fenabrave_model_rankings | model_accumulated | 22 | VW TRUCK E BUS/EXPRESS | 1.111 | 1.111 |  | COMERCIAIS LEVES |
| 13 | fenabrave_segment_model_rankings | segment_model_accumulated | 12 | MG/MG4 | 561 | 561 | 157 | Hatch Pequenos |
| 14 | fenabrave_model_rankings | model_accumulated | 31 | FORD/F150 | 494 | 494 |  | COMERCIAIS LEVES |
| 15 | fenabrave_segment_model_rankings | segment_model_accumulated | 2 | M.BENZ/CLASSE C | 479 | 479 | 84 | Sedans Grandes |
| 16 | fenabrave_model_rankings | model_month | 21 | KIA/K2500 | 368 |  | 368 | COMERCIAIS LEVES |
| 17 | fenabrave_model_rankings | model_month | 23 | VW TRUCK E BUS/EXPRESS | 337 |  | 337 | COMERCIAIS LEVES |
| 18 | fenabrave_segment_model_rankings | segment_model_accumulated | 3 | RENAULT/E-KWID | 217 | 217 | 2 | Veículos de Entrada |
| 19 | fenabrave_model_rankings | model_month | 31 | FORD/F150 | 129 |  | 129 | COMERCIAIS LEVES |
| 20 | fenabrave_segment_model_rankings | segment_model_accumulated | 2 | KIA/CARNIVAL | 109 | 109 | 34 | Grandcab |
| 21 | fenabrave_segment_model_rankings | segment_model_accumulated | 2 | TOYOTA/GR YARIS | 85 | 85 | 71 | Hatch Médios |
| 22 | fenabrave_segment_model_rankings | segment_model_accumulated | 4 | BMW/M135I | 61 | 61 | 11 | Hatch Médios |
| 23 | fenabrave_segment_model_rankings | segment_model_accumulated | 13 | M.BENZ/CLA200 | 53 | 53 | 2 | Sedans médios |
| 24 | fenabrave_model_rankings | model_accumulated | 49 | KIA/UK2500 | 51 | 51 |  | COMERCIAIS LEVES |
| 25 | fenabrave_segment_model_rankings | segment_model_accumulated | 5 | M.BENZ/CLASSE E | 50 | 50 | 6 | Sedans Grandes |
| 26 | fenabrave_model_rankings | model_month | 40 | RIDDARA/RD6 | 42 |  | 42 | COMERCIAIS LEVES |
| 27 | fenabrave_segment_model_rankings | segment_model_accumulated | 8 | DODGE/CHALLENGER | 37 | 37 | 14 | Sports |
| 28 | fenabrave_segment_model_rankings | segment_model_accumulated | 1 | AUDI/RS6 AVANT | 25 | 25 | 5 | Sw Grandes |
| 29 | fenabrave_segment_model_rankings | segment_model_accumulated | 10 | M.BENZ/AMG GT63S | 21 | 21 | 1 | Sedans Grandes |
| 30 | fenabrave_segment_model_rankings | segment_model_accumulated | 15 | M.BENZ/CLA45 | 20 | 20 | 2 | Sedans médios |
| 31 | fenabrave_segment_model_rankings | segment_model_accumulated | 16 | M.BENZ/CLA35 | 17 | 17 | 1 | Sedans médios |
| 32 | fenabrave_model_rankings | model_month | 47 | JAC/EJV5.5 | 15 |  | 15 | COMERCIAIS LEVES |
| 33 | fenabrave_segment_model_rankings | segment_model_accumulated | 3 | VW/ID.BUZZ | 12 | 12 | 7 | Grandcab |
| 34 | fenabrave_segment_model_rankings | segment_model_accumulated | 12 | M.BENZ/S63 | 9 | 9 | 2 | Sedans Grandes |
| 35 | fenabrave_segment_model_rankings | segment_model_accumulated | 18 | GM/CRUZE SEDAN | 4 | 4 | 1 | Sedans médios |
| 36 | fenabrave_segment_model_rankings | segment_model_accumulated | 4 | TOYOTA/SIENNA | 3 | 3 | 0 | Grandcab |
| 37 | fenabrave_segment_model_rankings | segment_model_accumulated | 19 | M.BENZ/AMG C63S | 2 | 2 | 0 | Sedans médios |
| 38 | fenabrave_segment_model_rankings | segment_model_accumulated | 5 | TOYOTA/YARIS SEDAN | 2 | 2 | 0 | Sedans Compactos |
| 39 | fenabrave_segment_model_rankings | segment_model_accumulated | 4 | FORD/RANCHERO | 1 | 1 | 0 | Pick-up's Pequenas |
| 40 | fenabrave_segment_model_rankings | segment_model_accumulated | 9 | TOYOTA/ETIOS SEDAN | 1 | 1 | 0 | Sedans Pequenos |

## Leitura de qualidade

- Não há `exact` nem `fuzzy`: a regra atual favorece `ambiguous` sempre que há múltiplas versões FIPE próximas, o que é adequado para evitar escolha automática de versão.
- A cobertura por volume acumulado é alta, mas os maiores buracos são concentrados em poucos nomes: `GM/ONIX PLUS`, `OMODA JAECOO/OMODA 5`, `OMODA JAECOO/JAECOO 7`, `KIA/K2500` e `VW TRUCK E BUS/EXPRESS`.
- Parte importante da ambiguidade vem da granularidade FIPE por versão, ano, motor e acabamento, enquanto Fenabrave trabalha por família/modelo comercial.
- A próxima correção com maior retorno deve priorizar aliases de modelo/família para `ONIX PLUS`, Omoda/Jaecoo, utilitários KIA e `VW TRUCK E BUS/EXPRESS`, ainda sem escrever em tabelas principais.

## Validação read-only e integridade

- A auditoria executou as consultas dentro de transação `BEGIN READ ONLY`.
- Não houve `UPDATE`, `INSERT`, `DELETE`, `REFRESH MATERIALIZED VIEW`, migration ou criação de script.
- Os fingerprints abaixo foram capturados antes e depois da auditoria no mesmo comando.

### Tabelas principais

| tabela | linhas antes | fingerprint antes | linhas depois | fingerprint depois | intacta |
| --- | --- | --- | --- | --- | --- |
| vehicles | 30.556 | 5d2cd7f1e526d86754e7d9b58ea941c3 | 30.556 | 5d2cd7f1e526d86754e7d9b58ea941c3 | sim |
| vehicle_latest_prices | 30.556 | 544d539d5640acecb52d12036ee1efaa | 30.556 | 544d539d5640acecb52d12036ee1efaa | sim |
| vehicle_price_snapshots | 638.194 | 32667321b365f93eab285701e8f99fcf | 638.194 | 32667321b365f93eab285701e8f99fcf | sim |

### Staging Fenabrave

| tabela | linhas antes | fingerprint antes | linhas depois | fingerprint depois | intacta |
| --- | --- | --- | --- | --- | --- |
| fenabrave_model_rankings | 200 | 2aba6aef904c1e7e00cea0132272d031 | 200 | 2aba6aef904c1e7e00cea0132272d031 | sim |
| fenabrave_brand_rankings | 126 | dca5a62821b14edfeb4d9896b91c39a5 | 126 | dca5a62821b14edfeb4d9896b91c39a5 | sim |
| fenabrave_segment_model_rankings | 162 | 36a517670780d88cc577e7b267de961c | 162 | 36a517670780d88cc577e7b267de961c | sim |
| fenabrave_fipe_match_candidates | 2.996 | 3d45cc6a130f933c099f31c288750317 | 2.996 | 3d45cc6a130f933c099f31c288750317 | sim |

