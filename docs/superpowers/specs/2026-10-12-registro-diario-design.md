# Registro diario de asistentes YOSW 2026 — Diseño

> **Estado (nov 2026):** no se implementó en este repo; se conserva como referencia histórica.

**Fecha:** 2026-10-12 · **Evento:** 19–24 oct 2026 (lun–sáb) · **Plazo:** operativo antes del 19 oct

## Objetivo

Una **página web** (se abre en el navegador escaneando un QR; nada que instalar) para que los asistentes
se inscriban **cada día** del evento dejando nombre, correo, cédula y firma con el dedo. La inscripción
diaria es la base para entregar **un coffee break por persona por día** y deja un respaldo firmado
de asistencia. Los organizadores siguen las inscripciones **en tiempo real en una Google Sheet** del Drive.

### Éxito

- Un asistente se inscribe en < 30 s el primer día y en ~10 s los días siguientes.
- Nadie puede inscribirse dos veces el mismo día con la misma cédula.
- En la mesa del coffee basta con mirar la pantalla del asistente (sin escanear ni buscar).
- Cada inscripción aparece en la Google Sheet en ≤ 5 s.
- Ninguna inscripción se pierde aunque Google falle (queda en Supabase y se reenvía).
- Los datos personales (cédula, firma) nunca son legibles públicamente.

### Fuera de alcance

Pre-registro / Google Form existente, certificados, check-in por charla, canje del coffee en el sistema,
envío de correos, panel de administración propio (la Sheet cumple ese rol).

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Modelo | Hoja de firmas digital: **una fila por persona por día**, datos completos cada día |
| Coffee | **Pantalla como ticket** (sin canje en sistema); anti-captura con reloj vivo + animación + color del día |
| Coffee breaks | 1 por día |
| Firma | Cada día, en cada inscripción |
| Plataforma | Página web aparte del sitio de YOSW, desplegada como sitio Netlify propio |
| Fuente de verdad | **Supabase** (Postgres + Edge Function) |
| Vista de organizadores | **Google Sheet en Drive**, copia en vivo, una pestaña por día; firmas como PNG en carpeta privada de Drive |
| QR | **Uno solo para toda la semana**; el día lo determina el servidor (hora de Ecuador) |
| Campos | Nombre, correo, documento (cédula o pasaporte), consentimiento LOPDP, firma |

## Arquitectura

```
Celular / tablet ──► Página web (Netlify) ──► Edge Function `inscribir` (Supabase)
                                                 │ 1. valida y guarda en Postgres (única cédula+día)
                                                 │ 2. POST a Apps Script (con secreto compartido)
                                                 ▼
                                   Google Apps Script (ligado a la Sheet)
                                     - guarda firma PNG en carpeta privada de Drive
                                     - agrega fila en la pestaña del día
```

```
registro/                     # carpeta nueva en este repo, sitio Netlify independiente
  index.html                  # formulario del asistente (ES/EN)
  kiosko.html                 # mismo formulario en modo kiosko
  src/
    cedula.ts                 # validación de cédula ecuatoriana (puro, testeado)
    dia.ts                    # días del evento, colores, nombres ES/EN (puro, testeado)
    i18n.ts                   # textos ES/EN
    api.ts                    # llamada a la Edge Function
    form.ts                   # lógica del formulario, recordar datos, firma
    ticket.ts                 # pantalla de ticket viva
  supabase/
    schema.sql                # tabla, RLS
    functions/inscribir/      # Edge Function (Deno/TS)
    functions/reenviar/       # Edge Function: reenvía a la Sheet las filas pendientes
  apps-script/Code.gs         # script para pegar en la Google Sheet
  README.md                   # configuración y operación
```

Stack web: Vite + TypeScript sin framework, `signature_pad`, Vitest.
Variables web: `VITE_FUNCTIONS_URL`, `VITE_SUPABASE_ANON_KEY`.
Secretos de la Edge Function: `SHEET_WEBHOOK_URL`, `SHEET_SECRET` (también configurado en Apps Script).

## Datos (Supabase)

Tabla `inscripciones`:

| columna | tipo | nota |
|---|---|---|
| id | uuid pk | |
| dia | date | asignado por el servidor: fecha actual en `America/Guayaquil` |
| nombre | text | requerido |
| correo | text | requerido, formato email |
| tipo_doc | text | `cedula` \| `pasaporte` |
| documento | text | normalizado (sin espacios/guiones, mayúsculas) |
| firma_png | text | PNG en base64 (≤ 200 KB) |
| consentimiento | boolean | debe ser true |
| origen | text | `web` \| `kiosko` |
| creado | timestamptz | default now() |
| en_sheet | boolean | default false; true cuando Apps Script confirmó la fila |

**Restricción única `(documento, dia)`.** RLS activado sin políticas para `anon`: la tabla solo se toca
desde las Edge Functions con la service role key.

## Edge Function `inscribir`

Entrada: `{nombre, correo, tipo_doc, documento, firma_png, consentimiento, origen}`.

1. Calcula `dia` (hora Ecuador). Si no está entre 2026-10-19 y 2026-10-24 → `{error: "fuera_de_fecha"}`.
2. Valida campos (cédula con dígito verificador, email, consentimiento, tamaño de firma).
3. Inserta. Si choca con `(documento, dia)` → devuelve `{nombre, dia, ya_inscrito: true}` del registro existente.
4. POST a Apps Script con `{secret, id, dia, hora, nombre, correo, tipo_doc, documento, origen, firma_png}`
   con timeout de ~5 s. Si responde ok → `en_sheet = true`. Si falla, no afecta al participante.
5. Devuelve `{nombre, dia, ya_inscrito: false}`. Nunca devuelve correo, documento ni firma.

## Edge Function `reenviar`

Protegida con `SHEET_SECRET` en un header. Reenvía a Apps Script todas las filas con `en_sheet = false`
y las marca. Se ejecuta a mano (comando `curl` en el README) o con un cron de Supabase cada 5 min.

## Google Sheet + Apps Script

- Una Sheet "YOSW 2026 – Inscripciones" en el Drive de la organización, compartida solo con organizadores.
- `doPost(e)`: verifica `secret`; con `LockService` crea la pestaña del día si no existe
  (`Lun 19`, `Mar 20`, …) con encabezados; **si el `id` ya está en la pestaña, no duplica**
  (idempotente para reintentos); guarda la firma como `{dia}_{documento}.png` en una carpeta privada de
  Drive; agrega la fila: Hora · Nombre · Correo · Tipo doc · Documento · Origen · Firma (link) · ID.
- Encabezado congelado y filtro activado para buscar por cédula desde el celular.
- Desplegado como aplicación web ("Ejecutar como: yo", "Acceso: cualquiera"; la protección es el secreto).

## Flujo del asistente (`index.html`)

1. Escanea el QR único → abre la página (idioma por navegador, conmutador ES/EN).
2. Fuera del 19–24 oct (hora Ecuador): mensaje "Las inscripciones abren el 19 de octubre".
3. Formulario: nombre, correo, selector cédula/pasaporte + número (cédula validada en vivo), casilla
   de consentimiento LOPDP con texto breve, recuadro de firma con botón "Borrar". "Inscribirme"
   deshabilitado hasta que todo sea válido y haya trazo de firma.
4. Si el navegador tiene datos de un día anterior (`localStorage`: nombre, correo, documento;
   **nunca la firma**), el formulario viene prellenado; solo se firma y envía.
5. Al enviar → `inscribir` → pantalla de ticket. Se guarda el ticket del día en `localStorage` para
   reabrirlo sin reenviar.
6. Si ya estaba inscrito hoy → mismo ticket con nota "Ya estabas inscrito/a hoy".

### Pantalla de ticket

Fondo a pantalla completa con el color del día (6 colores bien distintos), "✓ Inscrito/a",
nombre del día y fecha ("Miércoles 21 oct"), nombre del asistente en grande, **reloj HH:MM:SS que
avanza** y un elemento animado continuo. Texto: "Muestra esta pantalla en el coffee break".

## Modo kiosko (`kiosko.html`)

Igual al formulario pero: no lee ni escribe `localStorage`, `origen = 'kiosko'`, y tras mostrar el
ticket 8 s vuelve a un formulario vacío (o botón "Siguiente").

## Workflow operativo

- **Entrada:** carteles con el QR único; tablet en modo kiosko para quien no tenga celular
  (a ellos se les marca la credencial o se les da una ficha de coffee).
- **Coffee:** el organizador mira el ticket: color de hoy + reloj avanzando + nombre → entrega.
- **Seguimiento:** organizadores con la Sheet abierta ven las filas llegar; buscan por cédula con el filtro.
- **Cierre del día:** si hay filas pendientes, ejecutar `reenviar`; descargar la pestaña como Excel si se requiere.

## Errores

- Sin conexión / error de red: mensaje claro y reintentar; el formulario conserva los datos.
- Documento inválido: error en línea antes de enviar.
- Fuera de fechas: mensaje, sin formulario.
- Firma vacía: botón deshabilitado.
- Apps Script caído o lento: el participante igual recibe su ticket; la fila queda `en_sheet = false`
  hasta `reenviar`.

## Pruebas

- Unitarias (Vitest): `cedula.ts` (válidas, inválidas, provincia, longitud), `dia.ts` (fecha Ecuador
  → día del evento, fuera de rango, colores/nombres).
- Edge Function: prueba local/desplegada con fecha simulada (variable `FECHA_PRUEBA` solo en entorno
  de prueba) — inscripción nueva, duplicada, fuera de fecha, Apps Script caído → `en_sheet = false`
  y luego `reenviar` lo corrige sin duplicar en la Sheet.
- Prueba real en celular (Android + iPhone) y tablet en kiosko antes del 19 oct, viendo la fila
  aparecer en la Sheet.

## Pasos manuales para la organización

1. Crear proyecto Supabase (plan gratis); pegar `supabase/schema.sql` en el SQL Editor.
2. Desplegar las Edge Functions (te guío con la CLI o el editor web de Supabase) y cargar los secretos.
3. Crear la Google Sheet, pegar `apps-script/Code.gs`, configurar el secreto y desplegar como app web.
4. Crear sitio Netlify apuntando a `registro/` con las variables de entorno.
5. Generar el QR de la URL final e imprimirlo.
