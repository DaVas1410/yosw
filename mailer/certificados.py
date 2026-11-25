"""Certificados YOSW 2026: generar, firmar y enviar.

Las plantillas de certificados/ ya vienen firmadas por las autoridades (Rector y
Vicerrector, vía FirmaEC) con el nombre en blanco. Este script:

1. ``generar``  escribe nombre (y título del trabajo, si aplica) en cada plantilla
   como *actualización incremental*: los bytes firmados por las autoridades no
   cambian y sus firmas siguen válidas en FirmaEC (verificado 2026-11-25).
2. ``firmar``   agrega la firma del organizador (tu .p12) a todos los generados,
   también incremental, con un sello estilo FirmaEC (QR + texto). La clave se
   pide en la terminal y no se guarda.
3. ``enviar``   manda a cada persona un correo con todos sus certificados
   firmados adjuntos. Por defecto es simulacro (no envía nada).

Datos (todo dentro de certificados/, que está en .gitignore porque tiene datos
personales):

    certificados/salida/manifiesto.csv   tipo,nombre,email,titulo  (una fila por certificado)
    certificados/salida/sin_firmar/      PDFs generados
    certificados/salida/firmados/        PDFs con tu firma (lo que se envía)
    mailer/output/cert_sent_log.csv      registro de envíos (reanudable)

Uso (desde la raíz del repo, con mailer/.venv):

    python mailer/certificados.py prueba "Nombre Completo" correo@dominio   # manifiesto de prueba
    python mailer/certificados.py generar
    python mailer/certificados.py firmar ~/Documents/tu_firma.p12
    python mailer/certificados.py enviar --test-to correo@dominio          # un correo de prueba
    python mailer/certificados.py enviar                                   # simulacro
    python mailer/certificados.py enviar --real                            # envío real
"""
from __future__ import annotations

import argparse
import csv
import getpass
import os
import re
import sys
import tempfile
import time
import unicodedata
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
MAILER_DIR = ROOT / "mailer"
PLANTILLAS_DIR = ROOT / "certificados"
SALIDA = PLANTILLAS_DIR / "salida"
MANIFIESTO = SALIDA / "manifiesto.csv"
SIN_FIRMAR = SALIDA / "sin_firmar"
FIRMADOS = SALIDA / "firmados"
SENT_LOG = MAILER_DIR / "output" / "cert_sent_log.csv"
FUENTES = MAILER_DIR / "assets" / "fonts"
FUENTE_NOMBRE = FUENTES / "Montserrat-Bold.otf"
FUENTE_TITULO = FUENTES / "Montserrat-MediumItalic.otf"

ECUADOR = timezone(timedelta(hours=-5))
AZUL = (0x00 / 255, 0x62 / 255, 0x8E / 255)  # #00628e, color de los títulos de la plantilla
GRIS = (0x41 / 255, 0x40 / 255, 0x42 / 255)  # #414042, color del texto de la plantilla

# tipo -> (archivo de plantilla, etiqueta legible, lleva título del trabajo)
TIPOS: dict[str, tuple[str, str, bool]] = {
    "asistente": ("Certificados YOSW_Asistente-signed.pdf", "Asistente", False),
    "ponente": ("Certificados YOSW_Ponente-signed.pdf", "Ponente", False),
    "charla_corta": ("Certificados YOSW_Charla corta-signed.pdf", "Charla corta", True),
    "organizador": ("Certificados YOSW_Organizador-signed.pdf", "Comité Organizador", False),
    "logistica": ("Certificados YOSW_Logística-signed.pdf", "Comité de Logística", False),
    # "poster": ("Certificados YOSW_Poster-signed.pdf", "Póster", True),  # cuando esté firmada
}

FIRMA_RAZON = "Organizador YOSW 2026"
FIRMA_LUGAR = "San Miguel de Urcuquí"
FIRMA_CAMPO = "FirmaOrganizador"


# --------------------------------------------------------------------------- utilidades

def slug(texto: str) -> str:
    t = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"[^A-Za-z0-9]+", "_", t).strip("_")


def nombre_archivo(tipo: str, nombre: str, titulo: str = "") -> str:
    extra = f"_{slug(titulo)[:30]}" if titulo else ""
    return f"YOSW2026_{slug(TIPOS[tipo][1])}_{slug(nombre)}{extra}.pdf"


def leer_manifiesto(ruta: Path = MANIFIESTO) -> list[dict]:
    with ruta.open(encoding="utf-8-sig", newline="") as f:
        filas = [
            {k: (v or "").strip() for k, v in fila.items()}
            for fila in csv.DictReader(f)
        ]
    errores = []
    vistos = set()
    for i, fila in enumerate(filas, start=2):
        if fila["tipo"] not in TIPOS:
            errores.append(f"fila {i}: tipo desconocido «{fila['tipo']}»")
        if not fila["nombre"]:
            errores.append(f"fila {i}: falta nombre")
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", fila["email"]):
            errores.append(f"fila {i}: correo inválido «{fila['email']}»")
        if fila["tipo"] in TIPOS and TIPOS[fila["tipo"]][2] and not fila.get("titulo"):
            errores.append(f"fila {i}: {fila['tipo']} necesita título")
        clave = (fila["tipo"], fila["nombre"].lower(), fila.get("titulo", "").lower())
        if clave in vistos:
            errores.append(f"fila {i}: duplicada ({fila['tipo']}, {fila['nombre']})")
        vistos.add(clave)
    if errores:
        sys.exit("Manifiesto con errores:\n  " + "\n  ".join(errores))
    return filas


# --------------------------------------------------------------------------- posiciones

def _lineas(page: pymupdf.Page) -> list[tuple[str, pymupdf.Rect]]:
    out = []
    for b in page.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            t = "".join(s["text"] for s in l["spans"]).strip()
            if t:
                out.append((t, pymupdf.Rect(l["bbox"])))
    return out


def _buscar(lineas, pred) -> pymupdf.Rect:
    for t, r in lineas:
        if pred(t):
            return r
    raise LookupError("No encontré el texto de referencia en la plantilla")


def posiciones(page: pymupdf.Page) -> dict:
    """Huecos para nombre, título y firma, a partir del texto de la plantilla.

    Coordenadas con origen arriba-izquierda (las de pymupdf)."""
    L = _lineas(page)
    a = _buscar(L, lambda t: t == "a")
    por = _buscar(L, lambda t: t.startswith("Por su valios"))
    juan = _buscar(L, lambda t: t.startswith("Juan V"))
    pos = {
        "nombre_y": a.y1 + (por.y0 - a.y1) * 0.63,  # línea base del nombre
        # caja de la firma: sobre la línea de "Juan Vásconez", 36 pt de alto
        "firma": pymupdf.Rect(juan.x0 + juan.width / 2 - 75, juan.y0 - 56.5,
                              juan.x0 + juan.width / 2 + 75, juan.y0 - 20.5),
    }
    try:
        en_el = _buscar(L, lambda t: t.startswith("En el I Congreso"))
        pos["titulo"] = pymupdf.Rect(110, por.y1 + 4, page.rect.width - 110, en_el.y0 - 4)
    except LookupError:
        pass
    return pos


# --------------------------------------------------------------------------- generar

def _ajustar_lineas(texto: str, font: pymupdf.Font, size: float, ancho: float) -> list[str]:
    lineas, actual = [], ""
    for palabra in texto.split():
        prueba = f"{actual} {palabra}".strip()
        if font.text_length(prueba, size) <= ancho or not actual:
            actual = prueba
        else:
            lineas.append(actual)
            actual = palabra
    if actual:
        lineas.append(actual)
    return lineas


def rellenar(tipo: str, nombre: str, titulo: str, salida: Path) -> None:
    """Copia la plantilla y escribe nombre/título como actualización incremental."""
    plantilla = PLANTILLAS_DIR / TIPOS[tipo][0]
    salida.parent.mkdir(parents=True, exist_ok=True)
    salida.write_bytes(plantilla.read_bytes())
    doc = pymupdf.open(salida)
    page = doc[0]
    pos = posiciones(page)
    cx = page.rect.width / 2

    fn = pymupdf.Font(fontfile=str(FUENTE_NOMBRE))
    page.insert_font(fontname="yoswNombre", fontfile=str(FUENTE_NOMBRE))
    tam = 24.0
    while fn.text_length(nombre, tam) > page.rect.width - 160 and tam > 14:
        tam -= 0.5
    page.insert_text((cx - fn.text_length(nombre, tam) / 2, pos["nombre_y"]), nombre,
                     fontname="yoswNombre", fontsize=tam, color=AZUL)

    if TIPOS[tipo][2]:
        caja = pos["titulo"]
        ft = pymupdf.Font(fontfile=str(FUENTE_TITULO))
        page.insert_font(fontname="yoswTitulo", fontfile=str(FUENTE_TITULO))
        texto = f"“{titulo}”"
        tam = 15.0
        while True:
            lineas = _ajustar_lineas(texto, ft, tam, caja.width)
            alto = len(lineas) * tam * 1.25
            if (len(lineas) <= 3 and alto <= caja.height) or tam <= 9:
                break
            tam -= 0.5
        y = caja.y0 + (caja.height - alto) / 2 + tam
        for linea in lineas:
            page.insert_text((cx - ft.text_length(linea, tam) / 2, y), linea,
                             fontname="yoswTitulo", fontsize=tam, color=GRIS)
            y += tam * 1.25

    doc.saveIncr()
    doc.close()


def cmd_generar(_args) -> None:
    filas = leer_manifiesto()
    for fila in filas:
        destino = SIN_FIRMAR / fila["tipo"] / nombre_archivo(fila["tipo"], fila["nombre"], fila.get("titulo", ""))
        rellenar(fila["tipo"], fila["nombre"], fila.get("titulo", ""), destino)
        print(f"  generado  {destino.relative_to(SALIDA)}")
    print(f"{len(filas)} certificados en {SIN_FIRMAR.relative_to(ROOT)}")


# --------------------------------------------------------------------------- firmar

def crear_sello(nombre: str, fecha: datetime, ancho: float, alto: float) -> Path:
    """PDF de una página del tamaño de la caja: QR + texto al estilo FirmaEC."""
    import segno

    doc = pymupdf.open()
    page = doc.new_page(width=ancho, height=alto)
    qr = segno.make(
        f"FIRMADO POR: {nombre}\nRAZON: {FIRMA_RAZON}\nLOCALIZACION: {FIRMA_LUGAR}\n"
        f"FECHA: {fecha.isoformat(timespec='seconds')}\n"
        "VALIDAR CON: https://www.firmadigital.gob.ec",
        error="m",
    )
    matriz = list(qr.matrix)
    modulo = alto / len(matriz)
    chico, grande = 3.6, 6.4
    cour, courb = pymupdf.Font("cour"), pymupdf.Font("cobo")
    ancho_txt = max(courb.text_length(nombre, grande),
                    cour.text_length("Validar únicamente en FirmaEC.", chico))
    x0 = max(0.0, (ancho - (alto + 3 + ancho_txt)) / 2)

    shape = page.new_shape()
    for f, valores in enumerate(matriz):
        for c, v in enumerate(valores):
            if v:
                shape.draw_rect(pymupdf.Rect(x0 + c * modulo, f * modulo,
                                             x0 + (c + 1) * modulo, (f + 1) * modulo))
    shape.finish(color=None, fill=(0, 0, 0), width=0)
    shape.commit()

    tx, y = x0 + alto + 3, alto / 2 - 7
    for texto, fuente, tam, salto in [
        ("Validar únicamente en FirmaEC.", "cour", chico, 4.6),
        ("Firmado electrónicamente por:", "cour", chico, 7.4),
        (nombre, "cobo", grande, 5.2),
        (f"Fecha: {fecha.strftime('%Y-%m-%d %H:%M:%S%z')}", "cour", chico, 0),
    ]:
        page.insert_text((tx, y), texto, fontname=fuente, fontsize=tam)
        y += salto

    fd, ruta = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    doc.save(ruta)
    return Path(ruta)


def firmar_pdf(origen: Path, destino: Path, firmante) -> None:
    from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
    from pyhanko.sign import fields, signers
    from pyhanko.stamp import StaticStampStyle

    with origen.open("rb") as f:
        alto_pag = pymupdf.open(origen)[0].rect.height
        caja = posiciones(pymupdf.open(origen)[0])["firma"]
        caja_pdf = (caja.x0, alto_pag - caja.y1, caja.x1, alto_pag - caja.y0)
        nombre = firmante.signing_cert.subject.native["common_name"]
        sello = crear_sello(nombre, datetime.now(ECUADOR), caja.width, caja.height)
        try:
            w = IncrementalPdfFileWriter(f, strict=False)
            fields.append_signature_field(w, fields.SigFieldSpec(FIRMA_CAMPO, on_page=0, box=caja_pdf))
            meta = signers.PdfSignatureMetadata(field_name=FIRMA_CAMPO, reason=FIRMA_RAZON,
                                                location=FIRMA_LUGAR)
            estilo = StaticStampStyle.from_pdf_file(str(sello), border_width=0)
            destino.parent.mkdir(parents=True, exist_ok=True)
            tmp = destino.with_suffix(".tmp")
            with tmp.open("wb") as out:
                signers.PdfSigner(meta, signer=firmante, stamp_style=estilo).sign_pdf(w, output=out)
            tmp.replace(destino)
        finally:
            sello.unlink(missing_ok=True)


def cmd_firmar(args) -> None:
    from pyhanko.sign import signers

    p12 = Path(args.p12).expanduser()
    if not p12.is_file():
        sys.exit(f"No existe el archivo {p12}")
    def pendiente(p: Path) -> bool:  # sin firmar, o regenerado después de firmarse
        f = FIRMADOS / p.relative_to(SIN_FIRMAR)
        return not f.exists() or f.stat().st_mtime < p.stat().st_mtime

    pendientes = [p for p in sorted(SIN_FIRMAR.rglob("*.pdf")) if pendiente(p)]
    if not pendientes:
        print("No hay certificados pendientes de firma.")
        return
    clave = getpass.getpass(f"Clave de {p12.name}: ").encode()
    firmante = signers.SimpleSigner.load_pkcs12(p12, passphrase=clave)
    del clave
    if firmante is None:
        sys.exit("No se pudo abrir el .p12 (¿clave incorrecta?)")
    for i, origen in enumerate(pendientes, 1):
        destino = FIRMADOS / origen.relative_to(SIN_FIRMAR)
        firmar_pdf(origen, destino, firmante)
        print(f"  [{i}/{len(pendientes)}] firmado  {destino.relative_to(SALIDA)}")
    print(f"{len(pendientes)} certificados firmados en {FIRMADOS.relative_to(ROOT)}")


# --------------------------------------------------------------------------- enviar

def _cuerpo_html(nombre: str, certs: list[dict]) -> str:
    from audiences import SOCIAL_LINE, _P

    def item(c: dict) -> str:
        de_otro = c["nombre"] != nombre
        return (f'<li style="margin:0 0 6px 0;"><strong>{TIPOS[c["tipo"]][1]}</strong>'
                + (f' a nombre de <strong>{c["nombre"]}</strong>' if de_otro else "")
                + (f' — <em>{c["titulo"]}</em>' if c.get("titulo") else "") + "</li>")

    propios = [c for c in certs if c["nombre"] == nombre]
    ajenos = sorted({c["nombre"] for c in certs if c["nombre"] != nombre})
    items = "".join(item(c) for c in propios + [c for c in certs if c["nombre"] != nombre])
    plural = len(certs) > 1
    if ajenos:
        quienes = ", ".join(ajenos[:-1]) + (" y " if len(ajenos) > 1 else "") + ajenos[-1]
        varios = len(certs) - len(propios) > 1
        nota_ajenos = (f'<p {_P}>Como no contamos con el correo de {quienes}, incluimos también '
                       f'{"sus certificados" if varios else "su certificado"} en este mensaje. '
                       f'Te agradeceríamos mucho {"hacérselos" if varios else "hacérselo"} llegar.</p>')
    else:
        nota_ajenos = ""
    return f"""
<p {_P}>Estimado/a {nombre}:</p>
<p {_P}>Gracias por ser parte de la primera edición de la <strong>Yachay Open Science
Week 2026</strong>, realizada del 19 al 24 de octubre en Yachay Tech.</p>
<p {_P}>Adjunto encontrarás {"los siguientes certificados" if plural else "tu certificado"}:</p>
<ul style="margin:0 0 14px 0;padding-left:20px;">{items}</ul>
{nota_ajenos}<p {_P}>{"Los certificados están firmados" if plural else "El certificado está firmado"}
electrónicamente por el Rector, el Vicerrector de Investigación y el Organizador del
congreso. Puedes verificar las firmas en el validador oficial de
<a href="https://www.firmadigital.gob.ec/validador-de-documentos/" style="color:#1f5c8e;">FirmaEC</a>.</p>
<p {_P}>Si encuentras un error en tu nombre o en el título de tu trabajo, responde a este
correo y te enviaremos una versión corregida.</p>
<p style="margin:20px 0 0 0;">Con gratitud,<br>
<strong>Comité Organizador</strong><br>
Yachay Open Science Week 2026</p>
{SOCIAL_LINE}
"""


def _mensaje(nombre: str, email_to: str, certs: list[dict], asunto_prefijo: str = ""):
    from mailer_utils import _build_message
    from template import build_email_html

    asunto = ("Tus certificados" if len(certs) > 1 else "Tu certificado") + " · YOSW 2026"
    rel = _build_message(
        asunto_prefijo + asunto,
        build_email_html(body_html=_cuerpo_html(nombre, certs)),
        os.environ["SMTP_USER"],
        "Yachay Open Science Week 2026",
        email_to,
    )
    msg = MIMEMultipart("mixed")
    for h in ("Subject", "From", "To"):
        msg[h] = rel[h]
        del rel[h]
    msg.attach(rel)
    for c in certs:
        parte = MIMEApplication(c["ruta"].read_bytes(), _subtype="pdf")
        parte.add_header("Content-Disposition", "attachment", filename=c["ruta"].name)
        msg.attach(parte)
    return msg


def _por_persona(filas: list[dict]) -> dict[str, dict]:
    personas: dict[str, dict] = defaultdict(lambda: {"nombre": "", "certs": []})
    faltan = []
    for fila in filas:
        ruta = FIRMADOS / fila["tipo"] / nombre_archivo(fila["tipo"], fila["nombre"], fila.get("titulo", ""))
        if not ruta.exists():
            faltan.append(ruta.relative_to(SALIDA))
        p = personas[fila["email"].lower()]
        p["nombre"] = p["nombre"] or fila.get("destinatario") or fila["nombre"]
        p["certs"].append({**fila, "ruta": ruta})
    if faltan:
        sys.exit("Faltan certificados firmados (corre `generar` y `firmar`):\n  "
                 + "\n  ".join(map(str, faltan[:20])))
    return personas


def _ya_enviados() -> set[tuple[str, str]]:
    if not SENT_LOG.exists():
        return set()
    with SENT_LOG.open(encoding="utf-8") as f:
        return {(r["email"].lower(), r["archivo"]) for r in csv.DictReader(f) if r["estado"] == "sent"}


def _registrar(email: str, archivos: list[str], estado: str, detalle: str = "") -> None:
    nuevo = not SENT_LOG.exists()
    SENT_LOG.parent.mkdir(exist_ok=True)
    with SENT_LOG.open("a", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["timestamp", "email", "archivo", "estado", "detalle"])
        if nuevo:
            w.writeheader()
        ahora = datetime.now(ECUADOR).isoformat(timespec="seconds")
        for a in archivos:
            w.writerow({"timestamp": ahora, "email": email, "archivo": a, "estado": estado, "detalle": detalle})


def cmd_enviar(args) -> None:
    sys.path.insert(0, str(MAILER_DIR))
    from mailer_utils import MIN_SECONDS_BETWEEN_SENDS, _smtp_connect  # carga mailer/.env

    personas = _por_persona(leer_manifiesto())

    if args.test_to:
        email, p = next(iter(personas.items()))
        msg = _mensaje(p["nombre"], args.test_to, p["certs"], "[PRUEBA] ")
        server = _smtp_connect()
        try:
            server.sendmail(os.environ["SMTP_USER"], [args.test_to], msg.as_string())
        finally:
            server.quit()
        print(f"Prueba enviada a {args.test_to}: certificados de {p['nombre']} ({len(p['certs'])} adjuntos)")
        return

    enviados = _ya_enviados()
    cola = []
    for email, p in personas.items():
        certs = [c for c in p["certs"] if (email, c["ruta"].name) not in enviados]
        if certs:
            cola.append((email, p["nombre"], certs))
    print(f"{len(personas)} personas; {len(cola)} con certificados por enviar "
          f"({sum(len(c) for *_, c in cola)} archivos).")
    if not args.real:
        for email, nombre, certs in cola[:15]:
            print(f"  (simulacro) {email:40} {nombre:35} {', '.join(TIPOS[c['tipo']][1] for c in certs)}")
        if len(cola) > 15:
            print(f"  … y {len(cola) - 15} más")
        print("Simulacro: no se envió nada. Usa --real para enviar.")
        return

    server = _smtp_connect()
    try:
        for i, (email, nombre, certs) in enumerate(cola, 1):
            archivos = [c["ruta"].name for c in certs]
            for intento in range(3):
                try:
                    server.sendmail(os.environ["SMTP_USER"], [email], _mensaje(nombre, email, certs).as_string())
                    _registrar(email, archivos, "sent")
                    print(f"  [{i}/{len(cola)}] OK      {email}")
                    break
                except Exception as e:  # noqa: BLE001 — se registra y se reintenta
                    if intento == 2:
                        _registrar(email, archivos, "failed", str(e)[:200])
                        print(f"  [{i}/{len(cola)}] FALLÓ   {email}: {e}")
                    else:
                        time.sleep(5)
                        try:
                            server.quit()
                        except Exception:  # noqa: BLE001
                            pass
                        server = _smtp_connect()
            time.sleep(MIN_SECONDS_BETWEEN_SENDS)
    finally:
        server.quit()


# --------------------------------------------------------------------------- prueba

def cmd_prueba(args) -> None:
    SALIDA.mkdir(parents=True, exist_ok=True)
    titulo = ("Ejemplo de título largo para comprobar cómo se acomoda el nombre del "
              "trabajo en dos líneas del certificado")
    with MANIFIESTO.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["tipo", "nombre", "email", "titulo"])
        w.writeheader()
        for tipo, (_, _, con_titulo) in TIPOS.items():
            w.writerow({"tipo": tipo, "nombre": args.nombre, "email": args.email,
                        "titulo": titulo if con_titulo else ""})
    print(f"Manifiesto de prueba con {len(TIPOS)} certificados: {MANIFIESTO.relative_to(ROOT)}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("prueba", help="manifiesto con todos los certificados para una persona")
    p.add_argument("nombre")
    p.add_argument("email")
    p.set_defaults(func=cmd_prueba)
    sub.add_parser("generar", help="rellena las plantillas según el manifiesto").set_defaults(func=cmd_generar)
    p = sub.add_parser("firmar", help="agrega tu firma a todos los generados pendientes")
    p.add_argument("p12")
    p.set_defaults(func=cmd_firmar)
    p = sub.add_parser("enviar", help="envía los certificados firmados")
    p.add_argument("--test-to", help="envía UN correo de prueba (los certificados de la primera persona) a esta dirección")
    p.add_argument("--real", action="store_true", help="envía de verdad (sin esto es simulacro)")
    p.set_defaults(func=cmd_enviar)
    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
