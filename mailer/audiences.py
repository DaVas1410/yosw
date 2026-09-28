"""Recipient-list configs for the YOSW 2026 invitation mailer.

Each audience describes: where to read recipients from, which columns hold
the name/email, and the (fixed, Spanish-only) HTML body sent to that group.
The bodies are the exact copy provided by the organizing committee, add a
new dict to AUDIENCES to onboard a new list later (e.g. alumni).
"""

from template import BLUE, BLUE_DARK, MUTED

SITE_URL = "https://yoswcongreso.github.io/yosw_website/es/"
REGISTER_URL = SITE_URL
EVENT_DATES_ES = "19 al 24 de octubre de 2026"
VENUE = "campus de Yachay Tech en Urcuquí"

def _social_icon(cid: str, href: str, label: str) -> str:
    return (
        f'<a href="{href}" style="display:inline-block;margin:0 6px;text-decoration:none;'
        f'color:{BLUE};font-size:13px;vertical-align:middle;">'
        f'<img src="cid:{cid}" width="22" height="22" alt="{label}" '
        f'style="display:inline-block;vertical-align:middle;margin-right:6px;border-radius:6px;">'
        f"{label}</a>"
    )


SOCIAL_LINE = (
    f'<p style="margin:24px 0 0 0;font-size:13px;line-height:1.7;color:{MUTED};">'
    + _social_icon("icon_instagram", "https://www.instagram.com/yosw2026", "@yosw2026")
    + _social_icon(
        "icon_linkedin",
        "https://www.linkedin.com/in/yachay-open-science-week-1374ab424?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
        "LinkedIn YOSW",
    )
    + _social_icon("icon_facebook", "https://www.facebook.com/share/1H2TWQGxBZ/?mibextid=wwXIfr", "Facebook YOSW")
    + "</p>"
)

CTA_BUTTON = (
    f'<div style="text-align:center;margin:24px 0;">'
    f'<a href="{REGISTER_URL}" style="display:inline-block;background:{BLUE};color:#ffffff;'
    f'text-decoration:none;font-size:15px;font-weight:bold;padding:12px 28px;border-radius:999px;">'
    f"Ver página oficial e inscribirme</a></div>"
)

_H2 = f'style="margin:24px 0 10px 0;font-size:17px;line-height:1.3;color:{BLUE_DARK};"'
_P = 'style="margin:0 0 14px 0;"'
_UL = 'style="margin:0 0 14px 0;padding-left:20px;"'
_LI = 'style="margin:0 0 8px 0;"'

COMMITTEE_BODY_HTML = f"""
<p {_P}>{{greeting}}</p>
<p {_P}>Es un honor dirigirnos a usted, en nombre del Comité Organizador de
<strong>Yachay Open Science Week 2026 (YOSW)</strong>, un congreso interdisciplinario de
ciencia abierta que se llevará a cabo del {EVENT_DATES_ES} en el {VENUE}, bajo
modalidad híbrida y con participación gratuita.</p>
<p {_P}>YOSW nace con una visión clara: convertirse en el evento insignia de nuestra
universidad, un espacio institucional donde la excelencia investigativa se encuentra con
la ciencia abierta, el diálogo entre disciplinas y la vinculación con el territorio. Esta
es su primera edición, y queremos construirla junto a quienes sostienen el rigor y la
identidad científica de nuestra casa de estudios.</p>

<h2 {_H2}>¿Cómo puede participar?</h2>
<p {_P}>Su experiencia es fundamental para darle profundidad académica al congreso. Le
invitamos a sumarse en cualquiera de los siguientes roles:</p>
<ul {_UL}>
<li {_LI}>🎤 <strong>Conferencista / ponente</strong>: Postúlese para presentar una
charla o ponencia sobre su área de investigación, inscrita en uno de los cinco ejes
temáticos del congreso.</li>
<li {_LI}>🖼️ <strong>Expositor de póster</strong>: Envíe su propuesta de póster
científico para exponerla durante el evento, mostrando resultados de investigación o
proyectos en desarrollo.</li>
<li {_LI}>🧭 <strong>Mentor del Ideatón YOSW</strong>: Acompañe a equipos
interdisciplinarios de estudiantes que trabajarán durante toda la semana en retos reales
del campus y del territorio.</li>
</ul>

<h2 {_H2}>Ejes temáticos del congreso</h2>
<ol {_UL}>
<li {_LI}><strong>IA, Ciencia de Datos y HPC</strong>: Inteligencia artificial, análisis
de datos y cómputo de alto rendimiento aplicados a la investigación y la industria.</li>
<li {_LI}><strong>Salud Digital, Bioingeniería e Interoperabilidad Clínica</strong>:
Tecnologías médicas, bioingeniería y sistemas de salud interoperables para mejorar el
diagnóstico y la atención.</li>
<li {_LI}><strong>Sostenibilidad, Producción y Territorio Inteligente</strong>:
Innovación agroindustrial, energía y gestión inteligente del territorio para un
desarrollo sostenible.</li>
<li {_LI}><strong>Sociedad Digital: Gobierno, Educación e Identidad</strong>: Gobierno
digital, educación e identidad ciudadana en la transformación digital de la sociedad.</li>
<li {_LI}><strong>Ciencias Fundamentales y Computación Teórica</strong>: Física,
matemáticas, química teórica, biología teórica y ciencias de la computación teórica como
base de la innovación científica.</li>
</ol>

<h2 {_H2}>Inscripción y certificación</h2>
<p {_P}>Un solo formulario cubre asistencia, presentación de pósteres y ponencias. Todos
los participantes reciben certificados de asistencia y de presentación de trabajos,
emitidos por la universidad.</p>
<p {_P}>🔗 Página oficial e inscripción:
<a href="{SITE_URL}" style="color:{BLUE};">{SITE_URL}</a><br>
📧 Contacto: <a href="mailto:YOSW_organization@yachaytech.edu.ec" style="color:{BLUE};">YOSW_organization@yachaytech.edu.ec</a></p>
{CTA_BUTTON}
<p {_P}>El programa detallado de cada día se publicará próximamente en la página oficial,
conforme se confirmen las actividades. Le invitamos a mantenerse atento y a reservar la
semana del {EVENT_DATES_ES} en su agenda.</p>
<p {_P}>Su voz es parte del legado que estamos construyendo. Gracias por ser pilar de la
ciencia que se hace en Yachay Tech.</p>
<p style="margin:20px 0 0 0;">Con profundo respeto y expectativa,<br>
<strong>Comité Organizador</strong><br>
Yachay Open Science Week 2026<br>
#HacemosCienciaYT</p>
{SOCIAL_LINE}
"""

STUDENTS_BODY_HTML = f"""
<p {_P}>{{greeting}}</p>
<p {_P}>Es un honor invitarte, en nombre del Comité Organizador de
<strong>Yachay Open Science Week 2026 (YOSW)</strong>, a nuestro congreso interdisciplinario de
ciencia abierta que se llevará a cabo del {EVENT_DATES_ES} en el {VENUE}, bajo
modalidad híbrida y con participación gratuita.</p>
<p {_P}>YOSW nace con una visión clara: convertirse en el evento insignia de nuestra
universidad, un espacio institucional donde la excelencia investigativa se encuentra con
la ciencia abierta, el diálogo entre disciplinas y la vinculación con el territorio. Esta
es su primera edición, y queremos construirla junto a la comunidad estudiantil que
representa el futuro científico de nuestra casa de estudios.</p>
<p {_P}>Este es un evento hecho por estudiantes, para estudiantes: buscamos la
participación de <strong>todos</strong>, sin importar tu semestre, carrera o nivel de
experiencia en investigación. No necesitas resultados avanzados ni ser parte de un
semillero para sumarte. Todas las ideas y disciplinas tienen un lugar en YOSW.</p>

<h2 {_H2}>¿Cómo puedes participar?</h2>
<p {_P}>Tu participación es fundamental para darle vida al congreso. Te invitamos a
sumarte en cualquiera de los siguientes roles:</p>
<ul {_UL}>
<li {_LI}>🎤 <strong>Ponente</strong>: Presenta una charla corta sobre tu investigación
o proyecto: una gran oportunidad para practicar de cara a la defensa de tu tesis.</li>
<li {_LI}>🖼️ <strong>Expositor de póster</strong>: Envía tu propuesta de póster
científico para exponerla durante el evento, mostrando resultados de investigación o
proyectos en desarrollo.</li>
<li {_LI}>🎓 <strong>Asistente</strong>: Participa de charlas, mesas abiertas y espacios
de networking junto a investigadores e innovadores de la región.</li>
</ul>

<h2 {_H2}>Ejes temáticos del congreso</h2>
<ol {_UL}>
<li {_LI}><strong>IA, Ciencia de Datos y HPC</strong>: Inteligencia artificial, análisis
de datos y cómputo de alto rendimiento aplicados a la investigación y la industria.</li>
<li {_LI}><strong>Salud Digital, Bioingeniería e Interoperabilidad Clínica</strong>:
Tecnologías médicas, bioingeniería y sistemas de salud interoperables para mejorar el
diagnóstico y la atención.</li>
<li {_LI}><strong>Sostenibilidad, Producción y Territorio Inteligente</strong>:
Innovación agroindustrial, energía y gestión inteligente del territorio para un
desarrollo sostenible.</li>
<li {_LI}><strong>Sociedad Digital: Gobierno, Educación e Identidad</strong>: Gobierno
digital, educación e identidad ciudadana en la transformación digital de la sociedad.</li>
<li {_LI}><strong>Ciencias Fundamentales y Computación Teórica</strong>: Física,
matemáticas, química teórica, biología teórica y ciencias de la computación teórica como
base de la innovación científica.</li>
</ol>

<h2 {_H2}>Inscripción y certificación</h2>
<p {_P}>Un solo formulario cubre asistencia, presentación de pósteres y ponencias. Todos
los participantes reciben certificados de asistencia y de presentación de trabajos,
emitidos por la universidad.</p>
<p {_P}>🔗 Página oficial e inscripción:
<a href="{SITE_URL}" style="color:{BLUE};">{SITE_URL}</a><br>
📧 Contacto: <a href="mailto:YOSW_organization@yachaytech.edu.ec" style="color:{BLUE};">YOSW_organization@yachaytech.edu.ec</a></p>
{CTA_BUTTON}
<p {_P}>El programa detallado de cada día se publicará próximamente en la página oficial,
conforme se confirmen las actividades. Te invitamos a mantenerte atento y a reservar la
semana del {EVENT_DATES_ES} en tu agenda.</p>
<p {_P}>Tu voz es parte del legado que estamos construyendo. Gracias por ser parte de la
ciencia que se hace en Yachay Tech.</p>
<p style="margin:20px 0 0 0;">Con profundo aprecio y expectativa,<br>
<strong>Comité Organizador</strong><br>
Yachay Open Science Week 2026<br>
#HacemosCienciaYT</p>
{SOCIAL_LINE}
"""

RESEARCHERS_BODY_HTML = f"""
<p {_P}>{{greeting}}</p>
<p {_P}>Es un honor dirigirnos a usted, en nombre del Comité Organizador de
<strong>Yachay Open Science Week 2026 (YOSW)</strong>, un congreso interdisciplinario de
ciencia abierta que se llevará a cabo del {EVENT_DATES_ES} en el {VENUE}, bajo
modalidad híbrida y con participación gratuita.</p>
<p {_P}>YOSW nace con una visión clara: convertirse en un espacio de encuentro entre la
excelencia investigativa, la ciencia abierta, el diálogo entre disciplinas y la
vinculación con el territorio. Esta es su primera edición, y nos gustaría mucho
construirla también junto a investigadores como usted, cuyo trabajo enriquecería
enormemente el debate académico del congreso.</p>
<p {_P}>Sería muy grato para nosotros contar con su presencia, ya sea de forma
presencial en Urcuquí o en modalidad virtual, y compartir con la comunidad de
Yachay Tech la perspectiva que su experiencia puede aportar.</p>

<h2 {_H2}>¿Cómo puede participar?</h2>
<p {_P}>Le invitamos a sumarse en cualquiera de los siguientes roles:</p>
<ul {_UL}>
<li {_LI}>🎤 <strong>Conferencista / ponente</strong>: Postúlese para presentar una
charla o ponencia sobre su área de investigación, inscrita en uno de los cinco ejes
temáticos del congreso.</li>
<li {_LI}>🖼️ <strong>Expositor de póster</strong>: Envíe su propuesta de póster
científico para exponerla durante el evento, mostrando resultados de investigación o
proyectos en desarrollo.</li>
<li {_LI}>🧭 <strong>Mentor del Ideatón YOSW</strong>: Acompañe a equipos
interdisciplinarios de estudiantes que trabajarán durante toda la semana en retos reales
del campus y del territorio.</li>
</ul>

<h2 {_H2}>Ejes temáticos del congreso</h2>
<ol {_UL}>
<li {_LI}><strong>IA, Ciencia de Datos y HPC</strong>: Inteligencia artificial, análisis
de datos y cómputo de alto rendimiento aplicados a la investigación y la industria.</li>
<li {_LI}><strong>Salud Digital, Bioingeniería e Interoperabilidad Clínica</strong>:
Tecnologías médicas, bioingeniería y sistemas de salud interoperables para mejorar el
diagnóstico y la atención.</li>
<li {_LI}><strong>Sostenibilidad, Producción y Territorio Inteligente</strong>:
Innovación agroindustrial, energía y gestión inteligente del territorio para un
desarrollo sostenible.</li>
<li {_LI}><strong>Sociedad Digital: Gobierno, Educación e Identidad</strong>: Gobierno
digital, educación e identidad ciudadana en la transformación digital de la sociedad.</li>
<li {_LI}><strong>Ciencias Fundamentales y Computación Teórica</strong>: Física,
matemáticas, química teórica, biología teórica y ciencias de la computación teórica como
base de la innovación científica.</li>
</ol>

<h2 {_H2}>Inscripción y certificación</h2>
<p {_P}>Un solo formulario cubre asistencia, presentación de pósteres y ponencias. Todos
los participantes reciben certificados de asistencia y de presentación de trabajos,
emitidos por la universidad.</p>
<p {_P}>🔗 Página oficial e inscripción:
<a href="{SITE_URL}" style="color:{BLUE};">{SITE_URL}</a><br>
📧 Contacto: <a href="mailto:YOSW_organization@yachaytech.edu.ec" style="color:{BLUE};">YOSW_organization@yachaytech.edu.ec</a></p>
{CTA_BUTTON}
<p {_P}>El programa detallado de cada día se publicará próximamente en la página oficial,
conforme se confirmen las actividades. Le invitamos a mantenerse atento y a reservar la
semana del {EVENT_DATES_ES} en su agenda.</p>
<p {_P}>Sería un placer para nosotros contar con su participación y, con ella, con la
mirada que solo alguien fuera de casa puede traer a esta primera edición.</p>
<p style="margin:20px 0 0 0;">Con profundo respeto y expectativa,<br>
<strong>Comité Organizador</strong><br>
Yachay Open Science Week 2026<br>
#HacemosCienciaYT</p>
{SOCIAL_LINE}
"""

DEADLINE_ES = "25 de septiembre de 2026"  # extended from the original 19 de septiembre

FLYER_BLOCK = (
    '<div style="text-align:center;margin:24px 0 0 0;">'
    '<img src="cid:flyer" alt="YOSW 2026" width="440" '
    'style="display:inline-block;width:100%;max-width:440px;height:auto;border-radius:16px;'
    'box-shadow:0 4px 16px rgba(0,0,0,0.12);">'
    "</div>"
)

COUNTDOWN_BANNER = f"""
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;">
<tr><td style="background:#fff4de;border:1px solid #f2a900;border-radius:12px;padding:14px 18px;text-align:center;">
<p style="margin:0;font-size:16px;font-weight:bold;color:{BLUE_DARK};">
📢 Ampliamos el plazo · Nueva fecha límite: {DEADLINE_ES}</p>
</td></tr>
</table>
"""

REPLY_PROMPT_USTED = (
    f'<p {_P}>💬 ¿Dudas, ideas o algún eje en el que le gustaría participar? '
    f"Solo responda a este correo: lo lee el equipo organizador, no un buzón automático.</p>"
)

REPLY_PROMPT_TU = (
    f'<p {_P}>💬 ¿Dudas, ideas o algún eje en el que te gustaría participar? '
    f"Solo responde a este correo: lo lee el equipo organizador, no un buzón automático.</p>"
)

EJES_REMINDER_HTML = f"""
<h2 {_H2}>Categorías temáticas de este año</h2>
<ol {_UL}>
<li {_LI}><strong>IA, Ciencia de Datos y HPC</strong>: Inteligencia artificial, análisis
de datos y cómputo de alto rendimiento aplicados a la investigación y la industria.</li>
<li {_LI}><strong>Salud Digital, Bioingeniería e Interoperabilidad Clínica</strong>:
Tecnologías médicas, bioingeniería y sistemas de salud interoperables para mejorar el
diagnóstico y la atención.</li>
<li {_LI}><strong>Sostenibilidad, Producción y Territorio Inteligente</strong>:
Innovación agroindustrial, energía y gestión inteligente del territorio para un
desarrollo sostenible.</li>
<li {_LI}><strong>Sociedad Digital: Gobierno, Educación e Identidad</strong>: Gobierno
digital, educación e identidad ciudadana en la transformación digital de la sociedad.</li>
<li {_LI}><strong>Ciencias Fundamentales y Computación Teórica</strong>: Física,
matemáticas, química teórica, biología teórica, ciencias de la computación teórica,
nanotecnología y materiales aplicados como base de la innovación científica.</li>
</ol>
"""

DEADLINE_REMINDER_HTML = f"""
<h2 {_H2}>Fechas y directrices importantes para postulantes</h2>
<ul {_UL}>
<li {_LI}>🗓️ <strong>Fecha límite de registro:</strong> {DEADLINE_ES}.</li>
<li {_LI}>⚠️ <strong>Presentaciones/pósteres grupales:</strong> si postulan como parte de
un equipo, solo un representante debe realizar el proceso de registro en el sistema. Sin
embargo, el documento del resumen (abstract) debe incluir los nombres de todos los
miembros del equipo.</li>
<li {_LI}>🔢 <strong>Sin límite de grupos ni de proyectos:</strong> no hay un límite en la
cantidad de grupos que pueden postular, ni en la cantidad de integrantes por grupo, y un
mismo grupo puede presentar más de una ponencia o póster.</li>
<li {_LI}>🔎 <strong>Revisión por el Comité Científico:</strong> todos los resúmenes
(abstracts) serán evaluados por nuestro Comité Científico, que seleccionará las
propuestas que se presentarán en el congreso.</li>
</ul>
<p {_P}>🎓 Registrar la asistencia también da acceso al <strong>certificado</strong> y
al <strong>kit del participante</strong> (merch, coffee breaks y demás beneficios en
sitio).</p>
"""

REMINDER_COMMITTEE_BODY_HTML = f"""
<p {_P}>{{greeting}}</p>
{COUNTDOWN_BANNER}
<p {_P}>Tenemos una buena noticia: por la respuesta que hemos recibido, decidimos
<strong>ampliar el plazo de inscripción</strong> de Yachay Open Science Week 2026 (YOSW)
hasta el <strong>{DEADLINE_ES}</strong>. Si el tiempo se le vino encima y no había podido
registrarse, esta es su oportunidad — y será la última.</p>
<p {_P}>YOSW se llevará a cabo del {EVENT_DATES_ES} en el {VENUE}, en modalidad híbrida y
con participación gratuita. El congreso está pensado como el evento insignia de nuestra
universidad, y su participación —como conferencista, expositor de póster, mentor del
Ideatón o asistente— es justamente lo que le da ese peso académico.</p>
{EJES_REMINDER_HTML}
{DEADLINE_REMINDER_HTML}
<p {_P}>🔗 Página oficial e inscripción:
<a href="{SITE_URL}" style="color:{BLUE};">{SITE_URL}</a></p>
{CTA_BUTTON}
{REPLY_PROMPT_USTED}
<p {_P}>No queremos que esta segunda oportunidad se le pase de largo. Regístrese antes
del {DEADLINE_ES} — después de esa fecha, cerramos inscripciones.</p>
<p style="margin:20px 0 0 0;">Con cariño y expectativa,<br>
<strong>Comité Organizador</strong><br>
Yachay Open Science Week 2026<br>
#HacemosCienciaYT</p>
{FLYER_BLOCK}
{SOCIAL_LINE}
"""

REMINDER_STUDENTS_BODY_HTML = f"""
<p {_P}>{{greeting}}</p>
{COUNTDOWN_BANNER}
<p {_P}>Buenas noticias: le dimos más tiempo a las inscripciones de
<strong>Yachay Open Science Week 2026 (YOSW)</strong> — el nuevo plazo es el
<strong>{DEADLINE_ES}</strong>. Si entre parciales, proyectos y todo lo demás se te pasó
registrarte, aquí tienes otra oportunidad.</p>
<p {_P}>YOSW es del {EVENT_DATES_ES}, en el {VENUE}, modalidad híbrida y 100% gratuita.
Es un evento hecho por estudiantes para estudiantes — no importa tu semestre, carrera o
experiencia en investigación, hay un lugar para ti como ponente, expositor de póster o
asistente.</p>
{EJES_REMINDER_HTML}
{DEADLINE_REMINDER_HTML}
<p {_P}>🔗 Página oficial e inscripción:
<a href="{SITE_URL}" style="color:{BLUE};">{SITE_URL}</a></p>
{CTA_BUTTON}
{REPLY_PROMPT_TU}
<p {_P}>No dejes pasar esta segunda oportunidad. Regístrate antes del {DEADLINE_ES} —
después de esa fecha, se cierran las inscripciones.</p>
<p style="margin:20px 0 0 0;">Con cariño y expectativa,<br>
<strong>Comité Organizador</strong><br>
Yachay Open Science Week 2026<br>
#HacemosCienciaYT</p>
{FLYER_BLOCK}
{SOCIAL_LINE}
"""

REMINDER_RESEARCHERS_BODY_HTML = f"""
<p {_P}>{{greeting}}</p>
{COUNTDOWN_BANNER}
<p {_P}>¡Le escribimos de nuevo! No queríamos que se le pasara la fecha para sumarse a
<strong>Yachay Open Science Week 2026 (YOSW)</strong>, el congreso que se llevará a cabo
del {EVENT_DATES_ES} en el {VENUE}, en modalidad híbrida y con participación gratuita.
Como conferencista, expositor de póster o mentor del Ideatón, su mirada desde fuera de
Yachay Tech le daría un gran valor a esta primera edición.</p>
{EJES_REMINDER_HTML}
{DEADLINE_REMINDER_HTML}
<p {_P}>🔗 Página oficial e inscripción:
<a href="{SITE_URL}" style="color:{BLUE};">{SITE_URL}</a></p>
{CTA_BUTTON}
{REPLY_PROMPT_USTED}
<p {_P}>¡Esperamos contar con su participación para hacer de esta primera edición un
evento inolvidable para la ciencia y la innovación!</p>
<p style="margin:20px 0 0 0;">Con cariño y expectativa,<br>
<strong>Comité Organizador</strong><br>
Yachay Open Science Week 2026<br>
#HacemosCienciaYT</p>
{FLYER_BLOCK}
{SOCIAL_LINE}
"""

AUDIENCES = {
    "committee": {
        "label": "Comité / personal Yachay Tech",
        "source_file": "42. INF COMITE WOSW.xlsx",
        "sheet": 0,
        "name_col": "NOMBRES Y APELLIDOS",
        "email_col": "CORREO ELECTRONICO INSTITUCIONAL",
        "gender_col": "GENERO",
        "title": "Prof.",  # greeting becomes "Prof. {first given name} {first surname}:"
        "subject": "Invitación · Yachay Open Science Week 2026",
        "body_html": COMMITTEE_BODY_HTML,
    },
    "students": {
        "label": "Estudiantes matriculados",
        "source_file": "Matriculados_Carrera_DGSA 2026-2.xlsx",
        "sheet": 0,
        "name_col": ["NOMBRE", "APELLIDO"],
        "email_col": "MAIL",
        "gender_col": "GENERO",
        "greeting_name_mode": "first",
        "subject": "Invitación · Yachay Open Science Week 2026",
        "body_html": STUDENTS_BODY_HTML,
    },
    "researchers": {
        "label": "Investigadores externos",
        # TODO: place the spreadsheet at the repo root once the list is ready.
        # Expected columns: NOMBRE (full "Nombre Apellido", any order), EMAIL, GENERO
        # (GENERO is optional — falls back to "Estimado/a" when absent/unrecognized).
        "source_file": "Investigadores_externos.xlsx",
        "sheet": 0,
        "name_col": "NOMBRE",
        "email_col": "EMAIL",
        "gender_col": "GENERO",
        "greeting_name_mode": "asis",
        "subject": "Invitación · Yachay Open Science Week 2026",
        "body_html": RESEARCHERS_BODY_HTML,
    },
    "reminder_committee": {
        "label": "Recordatorio · Comité / personal Yachay Tech",
        "source_file": "42. INF COMITE WOSW.xlsx",
        "sheet": 0,
        "name_col": "NOMBRES Y APELLIDOS",
        "email_col": "CORREO ELECTRONICO INSTITUCIONAL",
        "gender_col": "GENERO",
        "title": "Prof.",
        "subject": f"📢 Ampliamos el plazo · Inscripciones YOSW 2026 hasta el {DEADLINE_ES}",
        "body_html": REMINDER_COMMITTEE_BODY_HTML,
        "include_flyer": True,
        "urgent": True,
    },
    "reminder_students": {
        "label": "Recordatorio · Estudiantes matriculados",
        "source_file": "Matriculados_Carrera_DGSA 2026-2.xlsx",
        "sheet": 0,
        "name_col": ["NOMBRE", "APELLIDO"],
        "email_col": "MAIL",
        "gender_col": "GENERO",
        "greeting_name_mode": "first",
        "subject": f"📢 Ampliamos el plazo · Inscripciones YOSW 2026 hasta el {DEADLINE_ES}",
        "body_html": REMINDER_STUDENTS_BODY_HTML,
        "include_flyer": True,
        "urgent": True,
    },
    "reminder_researchers": {
        "label": "Recordatorio · Investigadores externos",
        "source_file": "Investigadores_externos.xlsx",
        "sheet": 0,
        "name_col": "NOMBRE",
        "email_col": "EMAIL",
        "gender_col": "GENERO",
        "greeting_name_mode": "asis",
        "subject": f"📢 Ampliamos el plazo · Inscripciones YOSW 2026 hasta el {DEADLINE_ES}",
        "body_html": REMINDER_RESEARCHERS_BODY_HTML,
        "include_flyer": True,
        "urgent": True,
    },
    # reminder_committee/reminder_students were already sent for real on 2026-09-08
    # (old copy: Sept 19 deadline, no group-size notes). These "final_reminder_*" keys
    # reuse the same lists and templates under a distinct audience key so send_batch's
    # per-audience "already sent" dedup doesn't skip everyone who got the earlier send.
    "final_reminder_committee": {
        "label": "Recordatorio final · Comité / personal Yachay Tech",
        "source_file": "42. INF COMITE WOSW.xlsx",
        "sheet": 0,
        "name_col": "NOMBRES Y APELLIDOS",
        "email_col": "CORREO ELECTRONICO INSTITUCIONAL",
        "gender_col": "GENERO",
        "title": "Prof.",
        "subject": f"📢 Ampliamos el plazo · Inscripciones YOSW 2026 hasta el {DEADLINE_ES}",
        "body_html": REMINDER_COMMITTEE_BODY_HTML,
        "include_flyer": True,
        "urgent": True,
    },
    "final_reminder_students": {
        "label": "Recordatorio final · Estudiantes matriculados",
        "source_file": "Matriculados_Carrera_DGSA 2026-2.xlsx",
        "sheet": 0,
        "name_col": ["NOMBRE", "APELLIDO"],
        "email_col": "MAIL",
        "gender_col": "GENERO",
        "greeting_name_mode": "first",
        "subject": f"📢 Ampliamos el plazo · Inscripciones YOSW 2026 hasta el {DEADLINE_ES}",
        "body_html": REMINDER_STUDENTS_BODY_HTML,
        "include_flyer": True,
        "urgent": True,
    },
    # "alumni": {
    #     # Stub, fill in once the alumni list exists. Same shape as above:
    #     # source_file / sheet / name_col / email_col / subject / body_html.
    # },
}
