# Rumbo · Tu dinero, tus decisiones

Versión de aula 1.2 · 19 de octubre de 2026. Repositorio: `nespinozagonzalez-hub/test-tipo-jugadorV2`.

La página principal aloja Rumbo. La copia del test previo está en `archivo/test-jugador.html`. El historial de Git conserva la versión anterior.

## Aprender a usar Rumbo

El botón **Aprender a usar Rumbo** abre un tutorial de nueve pasos. Se ofrece en la primera visita y se puede repetir en cualquier momento. Cada paso explica una función y permite usar **Ver en la app** para practicar con el elemento resaltado. Un panel inferior permite volver a la explicación o continuar. También hay una ayuda desplegable en cada sección y accesos al paso correspondiente.

El recorrido no crea movimientos ni cambia metas automáticamente. Se puede abandonar sin perder el avance financiero. Su estado local usa la clave `rumbo.tutorial.v1`.

## Prueba con estudiantes

El botón **Anotar una mejora** permite guardar observaciones sin identificación y descargarlas en un archivo TXT para compartir con el docente. No se envían automáticamente. Las notas quedan separadas de los movimientos financieros y se guardan localmente. El recorrido sugerido aparece al inicio.


App educativa para adolescentes, creada para enseñar organización del dinero, ahorro e inversión, y los riesgos matemáticos de las apuestas. Interfaz en español, montos de ejemplo en pesos chilenos y diseño adaptable a celulares.

## Tres secciones funcionales

1. **Mi dinero:** registro de ingresos/gastos por mes, eliminación de movimientos, balance mensual, reparto flexible del presupuesto, meta y una misión de costo acumulado.
2. **Mi futuro:** fichas de cuenta de ahorro, depósito a plazo, fondos mutuos y acciones; simulador con tasa anual efectiva e inflación, incluidas tasas negativas; misión sobre liquidez.
3. **Sin trampas:** laboratorio de 300 sesiones, ruleta idealizada, moneda con pago reducido y control justo; comparación de una sesión, promedio observado y expectativa; explicación de independencia y señales para pedir apoyo.

Los ejemplos no implican recomendaciones ni tasas comerciales. Una apuesta puede ganar; con ventaja de la casa el resultado esperado de repetir apuestas es negativo. El simulador no fuerza pérdidas.

## Ejecutar

- Abre `index.html` junto a la carpeta `assets`, o abre `Rumbo.html` (copia autocontenida) directamente en un navegador moderno.
- No requiere instalación, API, cuentas de usuario ni backend.
- Para servir el repositorio localmente: `python3 -m http.server 8080`, luego abre `http://localhost:8080`.
- Si editas archivos, regenera la copia autocontenida con `python3 tools/bundle.py`.

## Publicación en GitHub Pages

Esta entrega usa el repositorio existente `test-tipo-jugadorV2`, que ya sirve una página pública desde `main`. Se conserva su configuración de alojamiento y se reemplaza la página de entrada por Rumbo.

Dirección de la app: `https://nespinozagonzalez-hub.github.io/test-tipo-jugadorV2/`.

Las rutas de recursos son relativas y funcionan bajo ese subdirectorio. No se necesitan claves, backend ni workflows propios. `.nojekyll` evita procesamiento adicional.

## Datos y privacidad

El guardado es local en `localStorage`, con la clave `rumbo.finanzas.v1`. Las notas de la prueba usan `rumbo.feedback.v1` y se descargan por separado. Movimientos, meta y progreso no se envían a GitHub ni a GamiAula. No se guardan nombres, RUT, cuentas bancarias o correos. La app usa datos ficticios al iniciar; se puede comenzar desde cero, exportar/importar JSON o borrar datos. Los porcentajes del reparto y los escenarios del laboratorio se restablecen al recargar: solo se conservan movimientos, meta y misiones.

Los archivos del respaldo contienen lo que el estudiante escribió. En equipos compartidos conviene usar datos ficticios. Borrar el almacenamiento del navegador elimina el progreso. GitHub Pages puede registrar solicitudes al sitio como proveedor del alojamiento, pero no recibe los movimientos que permanecen en el navegador. No hay analítica, publicidad ni recursos externos. Los enlaces a fuentes sí abren sus sitios externos.

## Cálculos y controles

`node --test tests/finance.test.cjs`

Ver [el modelo matemático](docs/MODELO_Y_FUENTES.md) y [la propuesta de uso en aula](docs/GUIA_DOCENTE.md). La revisión automatizada cubre balances, tasa efectiva, aportes al final del mes, inflación, tasas negativas, expectativa, convergencia y respaldos. No se debe interpretar una simulación de 300 sesiones como garantía de un resultado.

## Estructura

| Archivo | Propósito |
| --- | --- |
| `index.html` | Interfaz y contenido de las tres secciones |
| `assets/styles.css` | Diseño y adaptación responsive |
| `assets/app.js` | Navegación, formularios, gráficos y guardado |
| `assets/finance.js` | Cálculos financieros y simulaciones |
| `assets/icon.svg` | Ícono original de la app |
| `Rumbo.html` | App completa en un único archivo |
| `tests/finance.test.cjs` | Comprobaciones matemáticas |
| `docs/` | Modelo y guía docente |

## Próximas decisiones de diseño

Esta primera versión permite evaluar el contenido y la interacción. No incorpora identificación de estudiantes, datos del curso, notas, pagos ni integración bancaria. Si se añade una evaluación docente o sincronización, deben definirse qué datos son necesarios y cómo se protegen antes de implementar un backend.

Código y materiales originales de esta entrega; no se añadió una licencia pública por defecto. Define la licencia de distribución antes de invitar contribuciones externas.
