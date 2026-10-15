# Cuaderno de Campo — manual de operación

Este repositorio es el sitio de **Cuaderno de Campo**: fotografía de paisaje en ediciones limitadas, impresa en papel de algodón, enmarcada a mano, con un chip NFC que abre el sonido del lugar donde se tomó la foto. Lo mantiene principalmente una IA (Claude) a pedido de Conah, su hermano y el fotógrafo. Este archivo es la fuente de verdad sobre cómo operarlo.

Publicado en GitHub Pages: https://constanzacordova.github.io/cuaderno-de-campo/ (rama `main`, raíz). Cada push a `main` se publica solo en 1–2 minutos.

## Concepto (no romper)

- **Galería** = el sitio completo. **Sala** = la exposición de un cuaderno. **Cuaderno** = una salida a terreno (un territorio, una estación, pocas fotos). "Apuntes sueltos" es el cuaderno de obras fuera de serie.
- Las salas se recorren hacia el lado al hacer scroll. Cada sala parte con un texto de pared y la pared toma el `color` del cuaderno.
- Ediciones limitadas por tamaño. Cuando una edición se agota **no se reimprime**; la obra sigue colgada y el tamaño aparece "Agotada".
- **Nunca publicar ubicaciones exactas** (ni coordenadas, ni nombres de sendero/predio). Solo región, altitud aproximada, estación y hora. Es un principio de la marca: proteger los lugares.
- El sonido debe ser honesto: si no se grabó en el mismo momento, `sobre_el_sonido` lo dice ("Grabado en el lugar, otro día de la misma estación").

## Estructura

```
index.html              sitio completo (HTML + CSS + JS en un archivo, módulo que lee el catálogo)
content/catalogo.json   TODO el contenido editable: tamaños, cuadernos, obras, ventas, config
img/                    fotos web (NN-titulo.jpg) y portadas de cuadernos (cuaderno-N.jpg)
audio/                  sonidos (NN-titulo.mp3)
video/                  video de portada (humedal.mp4 + poster)
scripts/registro.gs     Apps Script que recibe eventos y reservas en la Google Sheet
```

## Catálogo (`content/catalogo.json`)

- `config.registro_url`: URL de la aplicación web de Apps Script. Vacío = no se registra nada.
- `tamanos[]`: `clave` (S/M/L), `medida`, `tiraje` (copias totales de la edición), `precio` (CLP, entero).
- `cuadernos[]`: `numero`, `romano`, `titulo`, `lugar`, `estacion`, `color` (hex del tinte de la sala), `portada`, `texto_sala` (2–3 frases).
- `obras[]`: `id` (dos dígitos, único, nunca reutilizar), `cuaderno` (numero), `titulo`, `foto`, `formato` (`vertical`|`horizontal`), `descripcion_foto` (texto alternativo), `region`, `altitud`, `estacion`, `hora` (HH:MM), `nota` (la nota de campo), `audio` (ruta o null), `sobre_el_sonido`, `publicada` (false = oculta), `vendidos` ({S,M,L} = copias ya vendidas).
- Quedan = `tiraje - vendidos`. Si da 0, el tamaño se muestra agotado automáticamente.
- El orden de `obras` es el orden en la pared.

## Procedimientos

### Agregar un cuaderno nuevo
1. Pedir: fotos (idealmente RAW/JPG grande), lugar (región, no exacto), estación, hora de cada foto, anécdotas, audios.
2. Procesar fotos para web: lado largo 1600 px, JPG calidad 85, sRGB, sin metadatos GPS (`exiftool -all=` o PIL sin EXIF). Nombre `NN-titulo-en-minusculas.jpg`. Nunca subir alta resolución: el repo es público.
3. Procesar audio: MP3 128 kbps, normalizado (`ffmpeg -af loudnorm=I=-20`), idealmente 1–3 min que haga loop sin corte audible.
4. Portada del cuaderno (`img/cuaderno-N.jpg`, 4:5): foto de una libreta real o generada (ver historial del proyecto), con la foto real montada en la tapa y etiqueta escrita a máquina.
5. Agregar el cuaderno y sus obras al catálogo. Escribir `texto_sala` y las `nota` con la voz de marca (abajo) y mostrárselas a Conah antes de publicar.
6. Probar localmente (`python3 -m http.server`), revisar galería, sala, ficha y experiencia NFC; luego commit + push.

### Registrar una venta
Sumar 1 en `obras[i].vendidos[clave]`, commit con mensaje "Venta: <obra> <tamaño>", push. Actualizar la fila en la hoja Reservas (`estado`).

### Ocultar o retirar una obra
`publicada: false`. No borrar la obra (su `id` y su página NFC deben seguir existiendo para quien ya la compró).

### Páginas NFC
Cada chip apunta a `https://…/cuaderno-de-campo/#escuchar-NN` (NN = id de la obra). Esa URL no debe cambiar nunca.

## Métricas y reservas

- Google Sheet: **Cuaderno de Campo — datos del sitio** (id `1bYo8k4-y6r7cseyzKMIl4Phyll-SrBoXlftKpFg2usA`), de constanza.cn@gmail.com.
  - Hoja `Eventos`: `vista` (inicio/cuaderno/obra/reserva/gracias/nfc), `tamano`, `escucha`, `escucha_portada`, `pregunta`, `reserva`.
  - Hoja `Reservas`: una fila por reserva, con `estado` editable.
- `origen` viene de `?utm_source=` (o `?ref=`) en el link, o del sitio de referencia. Para cada campaña, compartir links como `…/cuaderno-de-campo/?utm_source=instagram&utm_campaign=lanzamiento`.
- Embudo principal: visita → vista de obra → tamaño elegido → reserva.
- Al reportar: visitas únicas (sesiones), origen, obras más vistas, tasa de escucha, embudo, preguntas más abiertas, reservas nuevas sin contactar.

## Voz de marca

- Cuaderno de explorador: sobrio, preciso, en primera persona plural o impersonal. Datos concretos (hora, estación, altitud) + una observación breve y sensorial.
- Frases cortas. Nada de adjetivos de catálogo ("impresionante", "único", "mágico"), ni signos de exclamación, ni emojis.
- Las notas de campo cuentan qué pasó en ese momento, no describen la foto. Ej.: "No llovió. El sol encontró una rendija bajo la nube y encendió el cerro por tres minutos. Después, nada."
- Español de Chile neutro, tuteo.

## Diseño (no cambiar sin pedirlo)

- Tipografías: Newsreader (voz, títulos en cursiva) + Hanken Grotesk (datos, precios). Sin monoespaciadas.
- Sin texturas de fondo, sin ilustraciones que imiten objetos (se ven falsos). Los dibujos técnicos de línea (escala, reverso) sí van.
- Portada: video a pantalla completa con botón de sonido.
