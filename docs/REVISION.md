# Revisión de la versión de aula

Fecha: 19 de octubre de 2026.

## Comprobado

- Nueve pruebas matemáticas correctas: balances, tasa efectiva, inflación, aportes y probabilidades.
- Prueba con DOM: movimientos, metas, simuladores, misiones, notas y exportación.
- Publicación de la app en GitHub Pages completada correctamente para el commit 3457682fe9b3f6fe0cb113d9f0b4b856ba06e507.
- Revisión visual en Chrome sobre el sitio publicado.
- Navegación entre las tres secciones comprobada en el navegador.
- Registro de un gasto ficticio de $2.500: gastos pasan de $18.500 a $21.000 y balance de $46.500 a $44.000. Eliminación posterior correcta.
- Ahorro a tasa 0%: $20.000 iniciales y 12 aportes de $10.000 producen $140.000 nominales.
- Control de moneda justa: ventaja 0% y expectativa 0 fichas, conservando variación observada.
- Nota de mejora guardada y archivo TXT descargado desde el navegador; la nota ficticia de QA fue eliminada.
- Test anterior conservado en archivo/test-jugador.html y en el historial Git.

## Uso con estudiantes

App: https://nespinozagonzalez-hub.github.io/app-rumbo/

Usar datos ficticios. Cada estudiante debe pulsar Enviar al profesor y esperar Recibida por el profesor. Ante un fallo, puede reintentar o descargar un respaldo. No se requiere registro.

## Límites de la revisión

No se probó en un iPhone físico ni en todos los navegadores móviles. La prueba en aula está destinada a recoger mejoras de uso y contenido. El guardado depende del almacenamiento local del navegador; las notas se exportan por separado de los movimientos financieros.

## Tutorial 1.2

Se agregó un recorrido interactivo de nueve pasos, invitación en la primera visita, acceso permanente para repetirlo, ayuda por sección y controles para practicar sobre los elementos de la app. El recorrido no añade ni modifica movimientos o metas automáticamente.

Pruebas con DOM correctas: inicio único, nueve pasos, visibilidad de cada objetivo, resaltado y práctica, retroceso, atajos por sección, cierre con Escape, repetición y conservación de datos financieros. Se volvió a comprobar el flujo de anotaciones y exportación tras integrar el tutorial.

También se habilitaron los botones de ayuda y respaldo en la navegación móvil. La revisión en un iPhone físico sigue pendiente.

## Recepción de mejoras 1.3

Se integró la URL proporcionada por el docente. La app guarda el comentario antes de enviarlo, confirma solo al recibir un mensaje válido de Apps Script y permite reintentar las notas pendientes. Se preservan y migran las notas anteriores. Los envíos no incluyen movimientos financieros ni metas.

Pasaron las pruebas de confirmación, origen e ID, bloqueo de doble clic, reintento con ID estable, rechazo del servidor, migración, envío secuencial, modo sin conexión, vencimiento de espera, almacenamiento bloqueado y escape de texto. Se volvieron a comprobar el tutorial, las funciones de aula y las nueve pruebas matemáticas.

La primera comprobación del endpoint sin sesión redirigió al acceso de Google. La implementación debe permitir Cualquier persona; la entrega real queda pendiente de confirmar en el enlace público con ese permiso.
