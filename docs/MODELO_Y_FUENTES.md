# Modelo matemático y fuentes

Revisión: 13 de octubre de 2026.

## Presupuesto

Balance mensual = ingresos registrados en ese mes − gastos registrados en ese mes.
No equivale a un saldo de cuenta, ya que omite ahorros iniciales y movimientos no registrados. La meta representa dinero reservado que el estudiante declara por separado. No se descuenta automáticamente del balance. El reparto de necesidades/gustos/ahorro aplica a los ingresos del mes elegido y es una planificación hipotética, no un movimiento contable.

## Ahorro

Para una tasa anual efectiva `a`, la tasa mensual equivalente es `r = (1 + a/100)^(1/12) − 1`.
Cada mes: `B_m = B_(m−1) × (1+r) + aporte_mensual`.
El aporte se realiza al final del mes. Aportes acumulados: capital inicial + aporte mensual × meses.
Valor real al final en pesos de hoy: `B_m / (1 + inflación/100)^(m/12)`.
Interés o variación = total nominal final − aportes. No se incluyen impuestos, comisiones, fluctuaciones de mercado ni cambios de tasas. El producto real no tiene por qué capitalizar mensualmente; esto es un escenario didáctico.

## Probabilidades

Si la probabilidad de acertar es `p`, el pago total por unidad acertada es `k` y la apuesta fija es `b`, entonces:

`E(resultado neto por ronda) = b × (p×k − 1)`.

Pago total incluye la devolución de la unidad apostada. Ventaja de la casa = `1 − p×k`.

| Modelo | p | Pago total k | Ventaja | Interpretación |
| --- | --- | --- | --- | --- |
| Ruleta europea idealizada, color | 18/37 | 2 | 1/37 = 2,7027% | El cero rompe el equilibrio entre aciertos y pérdidas |
| Moneda con pago reducido | 1/2 | 1,9 | 5% | Se paga menos que en un modelo justo |
| Moneda justa | 1/2 | 2 | 0% | Expectativa cero, pero riesgo y variación persisten |

Cada sesión completa el número de rondas indicado, sin límite de capital, con tamaño fijo, resultados independientes y sin estrategias de escalamiento. Se usa `Math.random()` para una simulación educativa; no es un sistema de apuestas ni un generador criptográfico. El gráfico muestra la primera sesión generada, el promedio acumulado de 300 sesiones y la expectativa por ronda. Las sesiones ganadoras se muestran sin eliminarlas. No se modela una billetera ni insolvencia; un valor negativo significa resultado neto acumulado negativo. Las fichas no son dinero real y no hay premios por sus resultados.

La ventaja es un ingreso bruto esperado sobre el volumen apostado, antes de gastos del operador. La aproximación de promedios a la expectativa no garantiza ganancias del operador en una muestra particular ni asegura que cada persona pierda cada sesión.

## Fuentes primarias

- [CMF Educa: tipos de instrumentos de ahorro](https://www.cmfchile.cl/educa/621/w3-article-27432.html).
- [CMF Educa: fondos mutuos](https://www.cmfchile.cl/educa/621/w3-propertyvalue-988.html).
- [CMF Educa: instrumentos del mercado de valores](https://www.cmfchile.cl/educa/621/w3-article-518.html).
- [Gambling Commission: retorno al jugador e independencia](https://www.gamblingcommission.gov.uk/public-and-players/guide/return-to-player-how-much-gaming-machines-payout).

Las explicaciones y ejemplos de la app están redactados originalmente. No se reproducen textos completos de las fuentes. Los productos se presentan conceptualmente; no se comparan tasas comerciales ni se ofrecen recomendaciones personalizadas.
