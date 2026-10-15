/**
 * Cuaderno de Campo — registro de visitas, eventos y reservas.
 *
 * Se pega en: Google Sheet "Cuaderno de Campo — datos del sitio" → Extensiones → Apps Script.
 * Se despliega como Aplicación web (Ejecutar como: yo · Acceso: cualquier persona).
 * La URL de la aplicación web va en content/catalogo.json → config.registro_url.
 *
 * Hojas que crea solas:
 *   Eventos  → una fila por cada vista, escucha, tamaño elegido, pregunta abierta, reserva.
 *   Reservas → una fila por reserva, con estado editable (nueva / contactada / pagada / enviada / cancelada).
 */

const AVISAR_A = ""; // correo para avisos de reserva; vacío = el dueño del script

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const fecha = new Date();
    const datos = d.datos || {};

    hoja_(ss, "Eventos", ["fecha", "tipo", "pagina", "obra", "detalle", "origen", "dispositivo", "sesion"])
      .appendRow([fecha, d.tipo, d.pagina, datos.obra || "", d.tipo === "reserva" ? "(ver hoja Reservas)" : JSON.stringify(datos),
                  d.origen, d.dispositivo, d.sesion]);

    if (d.tipo === "reserva") {
      hoja_(ss, "Reservas", ["fecha", "estado", "obra", "titulo", "tamano", "precio", "ejemplar", "nombre", "correo",
                             "telefono", "region", "direccion", "dedicatoria", "origen", "sesion"])
        .appendRow([fecha, "nueva", datos.obra, datos.titulo, datos.tamano, datos.precio, datos.ejemplar, datos.nombre,
                    datos.correo, datos.telefono, datos.region, datos.direccion, datos.dedicatoria, d.origen, d.sesion]);
      const para = AVISAR_A || Session.getEffectiveUser().getEmail();
      MailApp.sendEmail(para, "Nueva reserva: " + datos.titulo + " · " + datos.tamano,
        datos.nombre + " (" + datos.correo + ", " + (datos.telefono || "sin teléfono") + ") reservó " + datos.titulo +
        " en " + datos.tamano + ", ejemplar " + datos.ejemplar + ".\n\nRegión: " + datos.region + "\nDirección: " + datos.direccion +
        "\nDedicatoria: " + (datos.dedicatoria || "—") + "\nLlegó desde: " + d.origen +
        "\n\nResponde con el link de pago dentro de 24 horas.\n" + ss.getUrl());
    }
    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error: " + err);
  } finally {
    lock.releaseLock();
  }
}

function hoja_(ss, nombre, encabezados) {
  let h = ss.getSheetByName(nombre);
  if (!h) {
    h = ss.insertSheet(nombre);
    h.appendRow(encabezados);
    h.setFrozenRows(1);
    h.getRange(1, 1, 1, encabezados.length).setFontWeight("bold");
  }
  return h;
}

/** Prueba manual desde el editor: Ejecutar → probar. Agrega una fila de ejemplo en Eventos. */
function probar() {
  doPost({postData: {contents: JSON.stringify({tipo: "prueba", pagina: "#inicio", datos: {nota: "prueba desde el editor"},
          origen: "editor", dispositivo: "-", sesion: "test"})}});
}
