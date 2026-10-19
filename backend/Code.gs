/**
 * RUMBO · RECEPCIÓN DE MEJORAS · v1.0 · 19-10-2026
 * Pegar TODO este archivo en Código.gs, desde Extensiones > Apps Script
 * de una planilla nueva. Guardar y ejecutar configurarRumbo una vez.
 * Publicar: Aplicación web · Ejecutar como Yo · Acceso Cualquier persona.
 * No solicita nombres, correos ni datos financieros del alumnado.
 * La URL pública admite envíos; nunca devuelve las observaciones guardadas.
 */
const RUMBO = Object.freeze({
  VERSION: '1.0',
  SHEET: 'Mejoras',
  PROPERTY: 'RUMBO_MEJORAS_SPREADSHEET_ID',
  ORIGIN: 'https://nespinozagonzalez-hub.github.io',
  HEADERS: [
    'Fecha y hora', 'ID de envío', 'Curso (opcional)', 'Sección',
    'Tipo de comentario', 'Qué intentaba hacer', 'Qué ocurrió',
    'Qué propone', 'Estado', 'Notas del docente'
  ]
});

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Rumbo')
    .addItem('Preparar recepción', 'configurarRumbo')
    .addItem('Enviar una prueba', 'pruebaRumbo')
    .addToUi();
}

/** Ejecutar desde el editor, no desde la URL pública. No borra filas. */
function configurarRumbo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Abre Apps Script desde Extensiones de la planilla.');
  let sheet = ss.getSheetByName(RUMBO.SHEET);
  if (!sheet) sheet = ss.insertSheet(RUMBO.SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, RUMBO.HEADERS.length).setValues([RUMBO.HEADERS]);
  }
  comprobarCabeceras_(sheet);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, RUMBO.HEADERS.length)
    .setBackground('#273852').setFontColor('#ffffff').setFontWeight('bold')
    .setWrap(true);
  sheet.setRowHeight(1, 46);
  sheet.setColumnWidth(1, 165);
  sheet.setColumnWidth(2, 270);
  sheet.setColumnWidths(3, 3, 160);
  sheet.setColumnWidths(6, 3, 300);
  sheet.setColumnWidth(9, 135);
  sheet.setColumnWidth(10, 260);
  if (!sheet.getFilter()) {
    sheet.getRange(1, 1, sheet.getMaxRows(), RUMBO.HEADERS.length).createFilter();
  }
  ss.setSpreadsheetTimeZone('America/Santiago');
  PropertiesService.getScriptProperties().setProperty(RUMBO.PROPERTY, ss.getId());
  ss.toast('Recepción preparada. Ahora ejecuta pruebaRumbo.', 'Rumbo', 8);
  console.log('Configuración terminada. Ejecuta pruebaRumbo y revisa la pestaña Mejoras.');
}

/** Inserta una fila marcada PRUEBA. Puedes borrarla desde la planilla. */
function pruebaRumbo() {
  const result = guardarMejora_({
    id: 'prueba-' + Utilities.getUuid(),
    course: 'PRUEBA DEL DOCENTE',
    section: 'Toda la app',
    kind: 'Idea de mejora',
    task: 'PRUEBA: comprobar la recepción de comentarios.',
    result: 'Esta fila confirma que el script puede escribir en la planilla.',
    expect: 'Después de publicar, enviar la URL terminada en /exec a ChatGPT.'
  });
  console.log(JSON.stringify(result));
  SpreadsheetApp.getActiveSpreadsheet().toast('Revisa la fila PRUEBA en Mejoras.', 'Rumbo', 8);
}

/** Comprueba el servicio sin publicar datos de la planilla. */
function doGet() {
  let ready = false;
  try {
    comprobarCabeceras_(abrirHoja_());
    ready = true;
  } catch (error) {
    console.error('No se pudo comprobar la configuración de Rumbo.');
  }
  return json_({
    ok: ready,
    service: 'Rumbo · recepción de mejoras',
    version: RUMBO.VERSION,
    message: ready ? 'Recepción de mejoras lista.' : 'Ejecuta configurarRumbo y revisa los permisos.'
  });
}

/**
 * Contrato para GitHub Pages:
 * POST JSON {id, course?, section, kind, task, result, expect?}, o formulario
 * con campo payload = JSON.stringify(objeto).
 * responseMode=iframe devuelve confirmación postMessage al ORIGIN configurado.
 * No usar fetch no-cors como comprobante: no permite leer la confirmación.
 */
function doPost(e) {
  let id = '';
  const iframe = !!(e && e.parameter && e.parameter.responseMode === 'iframe');
  let result;
  try {
    const raw = e && e.parameter && e.parameter.payload
      ? e.parameter.payload : e && e.postData && e.postData.contents;
    if (typeof raw !== 'string' || raw.length > 12000) {
      throw new Error('Envío vacío o demasiado largo.');
    }
    let data;
    try { data = JSON.parse(raw); }
    catch (error) { throw new Error('El envío no tiene un formato válido.'); }
    if (data && typeof data.id === 'string' && /^[A-Za-z0-9_-]{8,100}$/.test(data.id)) {
      id = data.id;
    }
    result = guardarMejora_(data);
  } catch (error) {
    // No enviar errores internos ni identificadores privados de Google.
    const message = error && error.rumboPublic
      ? error.message : 'No se pudo guardar. Conserva tu nota e inténtalo nuevamente.';
    result = {ok: false, id: id, message: message};
  }
  return iframe ? respuestaIframe_(result) : json_(result);
}

function guardarMejora_(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) fallo_('Comentario no válido.');
  const id = texto_(data.id, 100, true, 'ID');
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(id)) fallo_('ID de envío no válido.');
  const sections = {
    dinero: 'Mi dinero', futuro: 'Mi futuro', riesgos: 'Sin trampas', general: 'Toda la app',
    'Mi dinero': 'Mi dinero', 'Mi futuro': 'Mi futuro', 'Sin trampas': 'Sin trampas', 'Toda la app': 'Toda la app'
  };
  if (!Object.prototype.hasOwnProperty.call(sections, data.section)) fallo_('Selecciona una sección válida.');
  const kinds = ['Idea de mejora', 'Algo no funciona', 'Algo no se entiende', 'Algo que me gustó'];
  if (kinds.indexOf(data.kind) === -1) fallo_('Selecciona un tipo de comentario válido.');
  const course = texto_(data.course, 80, false, 'Curso');
  const task = texto_(data.task, 500, true, 'Qué intentabas hacer');
  const observed = texto_(data.result, 700, true, 'Qué ocurrió');
  const proposal = texto_(data.expect, 700, false, 'Qué propones');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) fallo_('Hay varios envíos en curso. Vuelve a intentarlo en unos segundos.');
  try {
    const sheet = abrirHoja_();
    comprobarCabeceras_(sheet);
    const last = sheet.getLastRow();
    // Reintentar con el mismo ID no duplica un comentario ya recibido.
    if (last > 1 && sheet.getRange(2, 2, last - 1, 1).createTextFinder(id)
      .matchEntireCell(true).matchCase(true).useRegularExpression(false).findNext()) {
      return {ok: true, id: id, duplicate: true, message: 'Esta mejora ya estaba recibida.'};
    }
    const row = last + 1;
    if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 100);
    const values = [new Date(), id, course, sections[data.section], data.kind, task, observed, proposal, 'Nueva', ''];
    sheet.getRange(row, 1, 1, values.length).setValues([values.map(literal_)]);
    sheet.getRange(row, 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
    sheet.getRange(row, 1, 1, values.length).setWrap(true).setVerticalAlignment('top');
    SpreadsheetApp.flush();
    return {ok: true, id: id, duplicate: false, message: 'Tu mejora fue recibida por el profesor.'};
  } finally {
    lock.releaseLock();
  }
}

function abrirHoja_() {
  const id = PropertiesService.getScriptProperties().getProperty(RUMBO.PROPERTY);
  if (!id) throw new Error('Falta configurarRumbo.');
  const sheet = SpreadsheetApp.openById(id).getSheetByName(RUMBO.SHEET);
  if (!sheet) throw new Error('Falta la pestaña de mejoras.');
  return sheet;
}

function comprobarCabeceras_(sheet) {
  const actual = sheet.getRange(1, 1, 1, RUMBO.HEADERS.length).getDisplayValues()[0];
  if (actual.some(function (value, i) { return value !== RUMBO.HEADERS[i]; })) {
    throw new Error('Las cabeceras no coinciden. No las renombres ni cambies de orden.');
  }
}

function texto_(value, max, required, label) {
  if (value == null && !required) return '';
  if (typeof value !== 'string') fallo_(label + ': texto no válido.');
  const text = value.replace(/\u0000/g, '').trim();
  if (required && !text) fallo_('Completa: ' + label + '.');
  if (text.length > max) fallo_(label + ': máximo ' + max + ' caracteres.');
  return text;
}

/** Evita que comentarios como =SUM(...) se ejecuten como fórmulas. */
function literal_(value) {
  return typeof value === 'string' && /^[\s]*[=+@-]/.test(value) ? "'" + value : value;
}

function fallo_(message) {
  const error = new Error(message);
  error.rumboPublic = true;
  throw error;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function respuestaIframe_(data) {
  const message = JSON.stringify(Object.assign({type: 'rumbo-feedback-result'}, data))
    .replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const origin = JSON.stringify(RUMBO.ORIGIN);
  return HtmlService.createHtmlOutput('<!doctype html><html><body><script>' +
    'window.top.postMessage(' + message + ',' + origin + ');' +
    '</script></body></html>').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
