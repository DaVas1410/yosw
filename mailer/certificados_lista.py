"""Arma el manifiesto de certificados YOSW 2026 a partir de las fuentes del evento.

Quién recibe qué:

- Ponente       charlas del Hall Senescyt (todos los días), keynote UNESCO, panelistas
                del foro del lunes y del panel del viernes, y los coautores de esas charlas.
- Charla corta  charlas de las Salas 1 y 2 (miércoles) y sus coautores, con el título
                ORIGINAL del cronograma (la web lo tradujo).
- Póster        presentadores de pósters (solo si la plantilla ya está en TIPOS).
- Asistente     todos los que marcaron "Asistencia" al inscribirse y, además, todos los
                de arriba.
Quien tiene dos roles recibe dos certificados.

Correos: se cruzan nombres contra la inscripción, el comité (profesores),
los matriculados (estudiantes) y el correo de ponentes. Solo se acepta un
cruce si da UN único correo. Lo que no se resuelve va a revisión; tú lo
completas en certificados/correos_manual.csv (columnas nombre,email y,
opcional, nombre_certificado para corregir el nombre impreso).

Salidas (en certificados/salida/, ignorado por git):
    manifiesto.csv         lo que consume `certificados.py generar`
    revision.csv           una fila por certificado, con de dónde salió el correo
    faltan_correos.csv     personas sin correo (cópialas a correos_manual.csv)

Uso:  python mailer/certificados_lista.py
"""
from __future__ import annotations

import csv
import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

import openpyxl

sys.path.insert(0, str(Path(__file__).resolve().parent))
from certificados import MANIFIESTO, ROOT, SALIDA, TIPOS  # noqa: E402

INSCRIPCION = ROOT / "assets/ponentes_posters_abstracts_info/Inscripcion al Congreso Estudiantil (Respuestas)(3).xlsx"
CRONOGRAMA = ROOT / "assets/ponentes_posters_abstracts_info/YOSW2026_Cronograma_Charlas.xlsx"
PARTICIPANTES = ROOT / "src/data/participants.json"
CALENDARIO = ROOT / "src/data/calendario.json"
COMITE = ROOT / "42. INF COMITE WOSW.xlsx"
MATRICULADOS = ROOT / "Matriculados_Carrera_DGSA 2026-2.xlsx"
PONENTES_CORREO = ROOT / "ponentes_correo_final.csv"
MANUAL = ROOT / "certificados/correos_manual.csv"

# Decisiones del organizador (2026-11-25)
EXCLUIR = {  # no reciben certificado
    "Vinicio Torres",
    "Claudia Marcela Pena Barajas",      # de CICPA solo vino Camilo
    "Rigo Daniel Julian Arias Carrero",
}
EXCLUIR_PANELES = {"2026-10-19"}  # foro del lunes: no se certifica

NO_PERSONA = re.compile(r"\b(club|mesa|grupo|asociaci[oó]n|equipo|laboratorio|stand)\b", re.I)
TITULOS_PERSONA = re.compile(r"^(mag|msc|ms|mgs|msg|dr|dra|ing|lic|phd|prof|econ|abg)\.?\s+", re.I)
PARTICULAS = {"de", "del", "la", "las", "los", "y", "da", "do", "dos", "van", "von"}


# --------------------------------------------------------------------------- nombres

def norm(texto: str) -> str:
    t = unicodedata.normalize("NFKD", str(texto)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z ]+", " ", t.replace("-", " ")).strip()


def tokens(nombre: str) -> set[str]:
    return {t for t in norm(nombre).split() if len(t) > 1}


def limpiar(nombre: str) -> str:
    """Quita títulos (Dr., Mag., …, PhD (c)) y arregla mayúsculas si vino todo en MAYÚSCULAS/minúsculas."""
    n = re.sub(r"\s+", " ", str(nombre)).strip(" ,;")
    n = re.sub(r",?\s*(PhD|MSc|Ph\.D\.)\s*(\(c\))?$", "", n, flags=re.I).strip()
    while TITULOS_PERSONA.match(n):
        n = TITULOS_PERSONA.sub("", n, count=1)
    if n.isupper() or n.islower():
        palabras = n.lower().split()
        n = " ".join(p if (p in PARTICULAS and i) else p[:1].upper() + p[1:] for i, p in enumerate(palabras))
    return n


def partir_personas(texto: str) -> list[str]:
    if not texto or str(texto).strip() in {"—", "-", "None"}:
        return []
    partes = re.split(r",\s*|\s+y\s+", str(texto))
    return [limpiar(p) for p in partes if p.strip()]


# --------------------------------------------------------------------------- directorio de correos

class Directorio:
    """Índice nombre → correo con varias fuentes; solo acepta cruces únicos."""

    def __init__(self) -> None:
        self.entradas: list[tuple[set[str], str, str, str]] = []  # tokens, nombre, email, fuente

    def agregar(self, nombre: str, email: str, fuente: str) -> None:
        email = str(email or "").strip().lower()
        if nombre and re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
            self.entradas.append((tokens(nombre), limpiar(nombre), email, fuente))

    def buscar(self, nombre: str) -> tuple[str, str, str, str]:
        """→ (email, nombre_completo, fuente, estado) con estado OK / SIN_CORREO / AMBIGUO."""
        q = tokens(nombre)
        if len(q) < 2:
            return "", nombre, "", "SIN_CORREO"
        hits = [e for e in self.entradas if q <= e[0]]
        correos = {e[2] for e in hits}
        if len(correos) == 1:
            mejor = max(hits, key=lambda e: len(e[0]))
            return mejor[2], mejor[1], mejor[3], "OK"
        if len(correos) > 1:
            # preferir el institucional si todos los demás cruces son la misma persona
            inst = {c for c in correos if c.endswith("@yachaytech.edu.ec")}
            if len(inst) == 1 and len({frozenset(e[0]) for e in hits}) == 1:
                e = next(h for h in hits if h[2] in inst)
                return e[2], e[1], e[3], "OK"
            return "", nombre, " / ".join(sorted(correos)), "AMBIGUO"
        return "", nombre, "", "SIN_CORREO"


def filas_xlsx(ruta: Path, hoja=0) -> tuple[tuple, list[tuple]]:
    wb = openpyxl.load_workbook(ruta, read_only=True, data_only=True)
    ws = wb.worksheets[hoja] if isinstance(hoja, int) else wb[hoja]
    filas = [tuple(r) + (None,) * 30 for r in ws.iter_rows(values_only=True) if any(r)]
    return filas[0], filas[1:]


def construir_directorio(inscritos: list[dict]) -> tuple[Directorio, dict[str, tuple[str, str, str]]]:
    d = Directorio()
    manual: dict[str, tuple[str, str, str]] = {}
    if MANUAL.exists():
        with MANUAL.open(encoding="utf-8-sig", newline="") as f:
            for r in csv.DictReader(f):
                if r.get("nombre") and r.get("email"):
                    manual[norm(r["nombre"])] = (r["email"].strip().lower(),
                                                 (r.get("nombre_certificado") or "").strip(),
                                                 (r.get("destinatario") or "").strip())
    for p in inscritos:
        d.agregar(p["nombre"], p["email"], "inscripción")
    if PONENTES_CORREO.exists():
        with PONENTES_CORREO.open(encoding="utf-8-sig", newline="") as f:
            for r in csv.DictReader(f):
                d.agregar(r["nombre"], r["email"], "correo ponentes")
    if COMITE.exists():
        h, filas = filas_xlsx(COMITE)
        for r in filas:
            d.agregar(r[h.index("NOMBRES Y APELLIDOS")], r[h.index("CORREO ELECTRONICO INSTITUCIONAL")], "comité/profesores")
    if MATRICULADOS.exists():
        h, filas = filas_xlsx(MATRICULADOS)
        for r in filas:
            d.agregar(f"{r[h.index('NOMBRE')]} {r[h.index('APELLIDO')]}", r[h.index("MAIL")], "matriculados")
    return d, manual


# --------------------------------------------------------------------------- fuentes de roles

def leer_inscritos() -> list[dict]:
    h, filas = filas_xlsx(INSCRIPCION)
    c = {k: h.index(k) for k in h if k}
    tipo1 = c["Seleccione el tipo de participacion (puede marcar mas de una opcion)"]
    tipo2 = c["Seleccione el tipo de participacion (puede marcar mas de una opcion) 2"]
    out = []
    for r in filas:
        inst = str(r[c["Correo electronico institucional"]] or "").strip().lower()
        email = inst if inst.endswith("@yachaytech.edu.ec") else str(r[c["Dirección de correo electrónico"]] or "").strip().lower()
        out.append({
            "nombre": str(r[c["Nombre completo"]] or "").strip(),
            "email": email,
            "asistencia": "Asistencia" in f"{r[tipo1]} {r[tipo2]}",
        })
    return out


def leer_roles() -> list[dict]:
    """Lista de (tipo, nombre, titulo, origen) para ponentes, charlas cortas, pósters y coautores."""
    roles: list[dict] = []
    part = json.loads(PARTICIPANTES.read_text(encoding="utf-8"))

    # Título de respaldo si el cronograma no lo tiene: el de la web (versión en inglés, la
    # original en el resumen), buscando la charla por aula y hora
    titulo_web = {}
    for x in part:
        t = x.get("trabajo") or {}
        aula = re.search(r"SE-PA\d-A\d+", (t.get("lugar") or {}).get("es", ""))
        if aula and isinstance(t.get("titulo"), dict):
            titulo_web[(aula.group(), t.get("hora"))] = t["titulo"].get("en") or t["titulo"].get("es", "")

    # Charlas cortas (Salas 1 y 2) y coautores del miércoles: del cronograma, con título original
    h, filas = filas_xlsx(CRONOGRAMA, "Cronograma charlas")
    c = {k: h.index(k) for k in h if k}
    for r in filas:
        sala, titulo = str(r[c["Sala"]] or ""), str(r[c["Título"]] or "").strip()
        if not titulo:
            aula = re.search(r"SE-PA\d-A\d+", sala)
            titulo = titulo_web.get((aula.group() if aula else "", str(r[c["Inicio"]])), "")
        presentadores = [p for p in partir_personas(r[c["Ponente(s)"]]) if "confirmar" not in p.lower()]
        coautores = [p for p in partir_personas(r[c["Coautores"]])
                     if not re.search(r"\bunae\b|\bpuce\b|proyecto", p, re.I)]
        if not presentadores:
            continue
        tipo = "ponente" if "Hall" in sala else "charla_corta"
        for p in presentadores:
            if tipo == "charla_corta":
                roles.append({"tipo": tipo, "nombre": p, "titulo": titulo, "origen": "cronograma (sala)",
                              "respaldo": [x for x in presentadores if x != p]})
        for p in coautores:
            # sin correo propio → se envía al expositor de la charla
            roles.append({"tipo": tipo, "nombre": p, "titulo": titulo if tipo == "charla_corta" else "",
                          "origen": "coautor (cronograma)", "respaldo": presentadores})

    # Ponentes del Hall (todos los días), keynote, panelistas y pósters: del directorio de la web
    for x in part:
        lugar = ((x.get("trabajo") or {}).get("lugar") or {}).get("es", "")
        if x["rol"] == "panelista" and (x.get("trabajo") or {}).get("fecha") in EXCLUIR_PANELES:
            continue
        if x["rol"] in {"ponente", "invitado", "panelista"} and (x["rol"] != "ponente" or "Hall" in lugar):
            roles.append({"tipo": "ponente", "nombre": limpiar(x["nombre"]), "titulo": "", "origen": f"web ({x['rol']})"})
        elif x["rol"] == "poster":
            t = (x.get("trabajo") or {}).get("titulo", "")
            for nombre in partir_personas(x["nombre"]):  # algunos pósters tienen varios presentadores
                roles.append({"tipo": "poster", "nombre": nombre,
                              "titulo": t if isinstance(t, str) else t.get("es", ""), "origen": "web (póster)"})

    cal = json.loads(CALENDARIO.read_text(encoding="utf-8"))
    for dia in cal["dias"]:
        for e in dia["eventos"]:
            if dia["fecha"] in EXCLUIR_PANELES:
                continue
            for p in e.get("panelists", []):
                nombre = limpiar(p["es"].split(" — ")[0])
                roles.append({"tipo": "ponente", "nombre": nombre, "titulo": "", "origen": f"panel {dia['fecha']}"})
    return roles


def ordenador_nombres():
    """Pone "Apellido Apellido Nombre Nombre" como "Nombre Nombre Apellido Apellido" cuando la
    persona está en matriculados (que separa NOMBRE y APELLIDO); conserva la escritura original."""
    idx: dict[frozenset, list[str]] = {}
    if MATRICULADOS.exists():
        h, filas = filas_xlsx(MATRICULADOS)
        for r in filas:
            completo = f"{r[h.index('NOMBRE')]} {r[h.index('APELLIDO')]}"
            idx.setdefault(frozenset(tokens(completo)), norm(completo).split())

    def ordenar(nombre: str) -> str:
        orden = idx.get(frozenset(tokens(nombre)))
        if not orden:
            return nombre
        return " ".join(sorted(nombre.split(), key=lambda p: orden.index(norm(p)) if norm(p) in orden else 99))
    return ordenar


# --------------------------------------------------------------------------- armar

def main() -> None:
    inscritos = leer_inscritos()
    directorio, manual = construir_directorio(inscritos)
    roles = leer_roles()

    certs: dict[tuple, dict] = {}  # (tipo, persona, titulo) → fila
    ordenar = ordenador_nombres()
    excluir = {norm(n) for n in EXCLUIR}

    def resolver(nombre: str, email_conocido: str = "") -> dict:
        clave = norm(nombre)
        if clave in manual:
            email, nombre_cert, destinatario = manual[clave]
            return {"email": email, "nombre": nombre_cert or limpiar(nombre), "fuente": "manual", "estado": "OK",
                    "destinatario": destinatario}
        if email_conocido:
            return {"email": email_conocido, "nombre": limpiar(nombre), "fuente": "inscripción", "estado": "OK"}
        email, completo, fuente, estado = directorio.buscar(nombre)
        # nombre impreso: el que la persona escribió al inscribirse (orden y tildes correctos);
        # las listas del comité y matriculados vienen en MAYÚSCULAS, apellido primero y sin tildes.
        usar_completo = estado == "OK" and fuente == "inscripción"
        impreso = limpiar(completo if usar_completo else nombre)
        if estado == "OK" and fuente == "matriculados" and tokens(nombre) == tokens(completo):
            # mismas palabras en otro orden (p. ej. apellido primero): orden de matriculados
            # ("NOMBRE APELLIDO"), escritura (tildes) de la fuente original
            orden = norm(completo).split()
            palabras = limpiar(nombre).split()
            impreso = " ".join(sorted(palabras, key=lambda p: orden.index(norm(p)) if norm(p) in orden else 99))
        return {"email": email, "nombre": impreso,
                "fuente": fuente, "estado": estado}

    def agregar(tipo: str, nombre: str, titulo: str, origen: str, email: str = "",
                respaldo: list[str] | None = None) -> None:
        if norm(nombre) in excluir:
            return
        r = resolver(nombre, email)
        if r["estado"] != "OK":
            for otro in respaldo or []:  # coautor sin correo → al correo del expositor
                o = resolver(otro)
                if o["estado"] == "OK":
                    r = {**r, "email": o["email"], "estado": "OK", "destinatario": o["nombre"],
                         "fuente": f"enviado a {o['nombre']}"}
                    break
        if r["fuente"] != "manual":
            r["nombre"] = ordenar(r["nombre"])
            if r.get("destinatario"):
                r["destinatario"] = ordenar(r["destinatario"])
        persona = norm(r["nombre"]) if r.get("destinatario") else (r["email"] or norm(nombre))
        clave = (tipo, persona, norm(titulo))
        if clave in certs:
            return
        nota = ""
        if NO_PERSONA.search(nombre):
            r["estado"], nota = "REVISAR", "no parece una persona"
        elif len(tokens(r["nombre"])) < 2:
            r["estado"], nota = ("REVISAR" if r["estado"] == "OK" else r["estado"]), "nombre incompleto"
        elif re.search(r"\b[A-Z]\.\s", r["nombre"]):
            nota = "nombre con iniciales (así figura en el programa)"
        if r["estado"] == "OK" and r["fuente"] in {"comité/profesores", "matriculados"} and len(tokens(nombre)) <= 2:
            nota = nota or "correo por cruce de nombre corto: verificar"
        certs[clave] = {"tipo": tipo, "nombre_original": nombre, "nombre": r["nombre"], "email": r["email"],
                        "titulo": titulo, "origen": origen, "fuente_email": r["fuente"],
                        "destinatario": r.get("destinatario") or r["nombre"],
                        "estado": r["estado"], "nota": nota}

    for rol in roles:
        agregar(rol["tipo"], rol["nombre"], rol["titulo"], rol["origen"], respaldo=rol.get("respaldo"))
    # Asistente: inscritos con "Asistencia" + todos los que tienen otro rol
    for p in inscritos:
        if p["asistencia"] and p["nombre"]:
            agregar("asistente", p["nombre"], "", "inscripción (asistencia)", p["email"])
    # todos los que expusieron (ponentes, charlas cortas, pósters) reciben también Asistente;
    # los coautores solo si ellos mismos se inscribieron con "Asistencia" (puede que no vinieran)
    for c in list(certs.values()):
        if c["tipo"] != "asistente" and not c["origen"].startswith("coautor"):
            respaldo = [c["destinatario"]] if c["destinatario"] != c["nombre"] else None
            agregar("asistente", c["nombre_original"], "", f"rol: {c['tipo']}", respaldo=respaldo)

    filas = sorted(certs.values(), key=lambda c: (c["estado"] != "OK", c["tipo"], c["nombre"]))
    SALIDA.mkdir(parents=True, exist_ok=True)
    campos = ["estado", "tipo", "nombre", "email", "destinatario", "titulo", "nombre_original", "origen",
              "fuente_email", "nota"]
    with (SALIDA / "revision.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos, extrasaction="ignore")
        w.writeheader()
        w.writerows(filas)

    listos = [c for c in filas if c["estado"] == "OK" and c["tipo"] in TIPOS]
    with MANIFIESTO.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["tipo", "nombre", "email", "titulo", "destinatario"], extrasaction="ignore")
        w.writeheader()
        w.writerows(listos)

    faltan = {}
    for c in filas:
        if c["estado"] != "OK":
            faltan.setdefault(norm(c["nombre_original"]), {
                "nombre": c["nombre_original"], "email": "", "nombre_certificado": "", "destinatario": "",
                "problema": c["estado"] + (f" ({c['nota']})" if c["nota"] else "")
                + (f" candidatos: {c['fuente_email']}" if c["estado"] == "AMBIGUO" else ""),
                "roles": set()})["roles"].add(c["tipo"])
    with (SALIDA / "faltan_correos.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["nombre", "email", "nombre_certificado", "destinatario", "problema", "roles"])
        w.writeheader()
        for v in faltan.values():
            w.writerow({**v, "roles": ", ".join(sorted(v["roles"]))})

    resumen = defaultdict(lambda: defaultdict(int))
    for c in filas:
        resumen[c["tipo"]][c["estado"]] += 1
    print(f"{'tipo':14} {'listos':>7} {'sin correo':>11} {'ambiguo':>8} {'revisar':>8}")
    for tipo, cnt in sorted(resumen.items()):
        print(f"{tipo:14} {cnt['OK']:7} {cnt['SIN_CORREO']:11} {cnt['AMBIGUO']:8} {cnt['REVISAR']:8}"
              + ("   (sin plantilla todavía)" if tipo not in TIPOS else ""))
    personas = {c["email"] for c in listos}
    print(f"\nManifiesto: {len(listos)} certificados para {len(personas)} personas → {MANIFIESTO.relative_to(ROOT)}")
    print(f"Revisión completa → {(SALIDA / 'revision.csv').relative_to(ROOT)}")
    print(f"Faltan datos de {len(faltan)} personas → {(SALIDA / 'faltan_correos.csv').relative_to(ROOT)}")


if __name__ == "__main__":
    main()
