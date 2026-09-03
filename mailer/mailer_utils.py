"""Recipient loading, previewing, and sending for the YOSW 2026 mailer."""

from __future__ import annotations

import csv
import os
import smtplib
import ssl
import time
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

import openpyxl
from dotenv import load_dotenv

from audiences import AUDIENCES
from template import build_email_html

ROOT = Path(__file__).resolve().parent.parent
MAILER_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = MAILER_DIR / "output"
LOGO_PATH = ROOT / "src" / "assets" / "brand" / "logo-color.png"
WATERMARK_PATH = MAILER_DIR / "assets" / "watermark.png"
SOCIAL_ICON_PATHS = {
    "icon_instagram": MAILER_DIR / "assets" / "icon-instagram.png",
    "icon_facebook": MAILER_DIR / "assets" / "icon-facebook.png",
    "icon_linkedin": MAILER_DIR / "assets" / "icon-linkedin.png",
}
SENT_LOG_PATH = OUTPUT_DIR / "sent_log.csv"

OUTPUT_DIR.mkdir(exist_ok=True)
load_dotenv(MAILER_DIR / ".env")

# Exchange Online SMTP AUTH limits (smtp.office365.com), with safety margin:
# - hard limit is 30 messages/minute -> we pace to 20/minute (3s between sends).
#   This applies to the mailbox's submission rate regardless of recipient.
# - Exchange Online's outbound spam policy (and its 1,000/day "non-relationship"
#   first-time-recipient sub-limit) only governs mail to EXTERNAL recipients
#   (any domain not accepted by the sender's tenant). Internal mail — same
#   accepted domain as the sender — is not subject to it and gets a much
#   higher allowance (up to 10,000/day if no external mail is sent that day).
#   Both current lists (committee, students) are 100% @yachaytech.edu.ec —
#   the same domain as the sender — so they're internal and this cap won't
#   bind them. It exists for a future external list (e.g. alumni, likely
#   personal Gmail/Hotmail addresses), where it will matter.
MIN_SECONDS_BETWEEN_SENDS = 3.0
MAX_NEW_EXTERNAL_RECIPIENTS_PER_ROLLING_24H = 900
INTERNAL_DOMAIN = "yachaytech.edu.ec"

FEMALE_GENDER_VALUES = {"FEMENINO", "MUJER"}
MALE_GENDER_VALUES = {"MASCULINO", "HOMBRE"}


@dataclass
class Recipient:
    name: str
    email: str
    greeting: str


def _col_index(header_row: list, col_name: str) -> int:
    for i, cell in enumerate(header_row):
        if cell and str(cell).strip() == col_name:
            return i
    raise ValueError(f"Column {col_name!r} not found in header {header_row!r}")


def _greeting_name(raw_name: str, mode: str) -> str:
    parts = raw_name.strip().split()
    if not parts:
        return ""
    if mode == "first":
        return parts[0].title()
    # "full" mode: source column is "APELLIDO1 APELLIDO2 NOMBRE1 [NOMBRE2]" (all caps).
    # Greet by the given name(s) — the last one or two tokens — not the full string.
    given = parts[-2:] if len(parts) >= 4 else parts[-1:]
    return " ".join(p.title() for p in given)


def _first_given_and_surname(raw_name: str) -> tuple[str, str]:
    """Split "APELLIDO1 [APELLIDO2] NOMBRE1 [NOMBRE2]" into (first given name,
    first surname), e.g. "ACOSTA ORELLANA ANTONIO RAMON" -> ("Antonio", "Acosta")."""
    parts = raw_name.strip().split()
    if not parts:
        return "", ""
    surname = parts[0]
    given = parts[2] if len(parts) >= 3 else parts[-1]
    return given.title(), surname.title()


def _salutation(gender_raw) -> str:
    g = str(gender_raw or "").strip().upper()
    if g in FEMALE_GENDER_VALUES:
        return "Estimada"
    if g in MALE_GENDER_VALUES:
        return "Estimado"
    return "Estimado/a"


def _build_greeting(raw_name: str, gender_raw, cfg: dict) -> str:
    title = cfg.get("title")
    if title:
        given, surname = _first_given_and_surname(raw_name)
        return f"{title} {given} {surname}:"
    greeting_name = _greeting_name(raw_name, cfg["greeting_name_mode"])
    return f"{_salutation(gender_raw)} {greeting_name}:"


def load_recipients(audience_key: str) -> list[Recipient]:
    """Read the audience's source .xlsx and return deduped, valid recipients."""
    cfg = AUDIENCES[audience_key]
    path = ROOT / cfg["source_file"]
    if not path.exists():
        raise FileNotFoundError(
            f"Expected recipient file at {path} — place it at the repo root."
        )

    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.worksheets[cfg["sheet"]] if isinstance(cfg["sheet"], int) else wb[cfg["sheet"]]
    rows = ws.iter_rows(values_only=True)
    header = list(next(rows))

    email_idx = _col_index(header, cfg["email_col"])
    name_cols = cfg["name_col"]
    if isinstance(name_cols, str):
        name_idxs = [_col_index(header, name_cols)]
    else:
        name_idxs = [_col_index(header, c) for c in name_cols]
    gender_idx = _col_index(header, cfg["gender_col"]) if cfg.get("gender_col") else None

    seen_emails: set[str] = set()
    recipients: list[Recipient] = []
    for row in rows:
        email = row[email_idx]
        if not email or "@" not in str(email):
            continue
        email = str(email).strip().lower()
        if email in seen_emails:
            continue
        seen_emails.add(email)

        raw_name = " ".join(str(row[i]).strip() for i in name_idxs if row[i]).strip()
        gender = row[gender_idx] if gender_idx is not None else None
        recipients.append(
            Recipient(
                name=raw_name,
                email=email,
                greeting=_build_greeting(raw_name, gender, cfg),
            )
        )

    return recipients


def render_html(audience_key: str, recipient: Recipient) -> str:
    """Render one recipient's personalized email for an audience."""
    cfg = AUDIENCES[audience_key]
    body = cfg["body_html"].format(greeting=recipient.greeting)
    return build_email_html(body_html=body)


def save_preview(audience_key: str, recipient: Recipient) -> Path:
    """Render one recipient's email to a self-contained HTML file for visual review.

    The real email embeds the header art via a `cid:` reference (only
    resolvable by an email client), so for preview we inline it as a base64
    data URI instead, so the file renders standalone in any browser,
    including sandboxed preview panes that block `file://` resource loads.
    """
    import base64

    html = render_html(audience_key, recipient)
    logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode("ascii")
    watermark_b64 = base64.b64encode(WATERMARK_PATH.read_bytes()).decode("ascii")
    html = html.replace("cid:logo", f"data:image/png;base64,{logo_b64}")
    html = html.replace("cid:watermark", f"data:image/png;base64,{watermark_b64}")
    for cid, path in SOCIAL_ICON_PATHS.items():
        icon_b64 = base64.b64encode(path.read_bytes()).decode("ascii")
        html = html.replace(f"cid:{cid}", f"data:image/png;base64,{icon_b64}")
    out_path = OUTPUT_DIR / f"preview_{audience_key}.html"
    out_path.write_text(html, encoding="utf-8")
    return out_path


def _build_message(subject: str, html: str, sender: str, sender_name: str, to_email: str) -> MIMEMultipart:
    msg = MIMEMultipart("related")
    msg["Subject"] = subject
    msg["From"] = f"{sender_name} <{sender}>"
    msg["To"] = to_email

    alt = MIMEMultipart("alternative")
    alt.attach(MIMEText("Ver esta invitación en un cliente que soporte HTML.", "plain"))
    alt.attach(MIMEText(html, "html"))
    msg.attach(alt)

    with open(LOGO_PATH, "rb") as f:
        logo = MIMEImage(f.read())
    logo.add_header("Content-ID", "<logo>")
    logo.add_header("Content-Disposition", "inline", filename="logo-color.png")
    msg.attach(logo)

    with open(WATERMARK_PATH, "rb") as f:
        watermark = MIMEImage(f.read())
    watermark.add_header("Content-ID", "<watermark>")
    watermark.add_header("Content-Disposition", "inline", filename="watermark.png")
    msg.attach(watermark)

    for cid, path in SOCIAL_ICON_PATHS.items():
        with open(path, "rb") as f:
            icon = MIMEImage(f.read())
        icon.add_header("Content-ID", f"<{cid}>")
        icon.add_header("Content-Disposition", "inline", filename=path.name)
        msg.attach(icon)

    return msg


def _smtp_connect() -> smtplib.SMTP:
    host = os.environ["SMTP_HOST"]
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ["SMTP_USER"]
    password = os.environ["SMTP_PASSWORD"]

    server = smtplib.SMTP(host, port, timeout=30)
    server.starttls(context=ssl.create_default_context())
    server.login(user, password)
    return server


def send_test_email(audience_key: str, recipient: Recipient, test_to: str) -> None:
    """Send a single real email (personalized for `recipient`) to `test_to`."""
    cfg = AUDIENCES[audience_key]
    html = render_html(audience_key, recipient)
    sender = os.environ["SMTP_USER"]
    sender_name = "Yachay Open Science Week 2026"
    subject = f"[TEST] {cfg['subject']}"
    msg = _build_message(subject, html, sender, sender_name, test_to)

    server = _smtp_connect()
    try:
        server.sendmail(sender, [test_to], msg.as_string())
    finally:
        server.quit()


def _already_sent(audience_key: str) -> set[str]:
    """Emails already sent the given audience's template.

    Scoped per-audience: the same address can legitimately receive more than
    one audience's email (e.g. a test address getting both the committee and
    student versions), so a global "already sent anything" set would
    incorrectly skip the second template.
    """
    if not SENT_LOG_PATH.exists():
        return set()
    with open(SENT_LOG_PATH, newline="", encoding="utf-8") as f:
        return {
            row["email"]
            for row in csv.DictReader(f)
            if row.get("status") == "sent" and row.get("audience") == audience_key
        }


def is_external(email: str) -> bool:
    """True if `email`'s domain differs from the sender's own (INTERNAL_DOMAIN).

    Exchange Online's outbound recipient caps only apply to external mail.
    """
    return not email.lower().endswith(f"@{INTERNAL_DOMAIN}")


def sent_count_last_24h(*, external_only: bool = True) -> int:
    """How many messages this mailbox has actually sent in the trailing 24h.

    Exchange Online's recipient caps are rolling windows, not calendar days,
    so this reads the log directly rather than assuming "one run = one day".
    By default only counts external recipients, matching what the cap governs.
    """
    if not SENT_LOG_PATH.exists():
        return 0
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    count = 0
    with open(SENT_LOG_PATH, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row.get("status") != "sent":
                continue
            if external_only and not is_external(row.get("email", "")):
                continue
            try:
                ts = datetime.fromisoformat(row["timestamp"])
            except ValueError:
                continue
            if ts >= cutoff:
                count += 1
    return count


def _log_send(email: str, audience_key: str, status: str, detail: str = "") -> None:
    is_new = not SENT_LOG_PATH.exists()
    with open(SENT_LOG_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["timestamp", "email", "audience", "status", "detail"])
        if is_new:
            writer.writeheader()
        writer.writerow(
            {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "email": email,
                "audience": audience_key,
                "status": status,
                "detail": detail,
            }
        )


def send_batch(
    audience_key: str,
    recipients: list[Recipient],
    *,
    dry_run: bool = True,
    delay_seconds: float = MIN_SECONDS_BETWEEN_SENDS,
    max_new_external_recipients_per_24h: int = MAX_NEW_EXTERNAL_RECIPIENTS_PER_ROLLING_24H,
    show_progress: bool = True,
) -> dict:
    """Send (or simulate) the invitation to every recipient not yet logged as sent.

    Paces sends at `delay_seconds` apart (default keeps us under Exchange
    Online's 30 messages/minute SMTP AUTH limit — applies to every recipient,
    internal or external). This is a deliberately single sequential
    connection: Exchange Online's *rate* (30/minute) is the bottleneck, not
    per-message network latency, so opening multiple connections wouldn't
    send any faster — it would only add complexity and risk tripping the
    "3 concurrent connections" cap for no benefit. See README for detail.

    Separately, stops sending to EXTERNAL recipients (domain != INTERNAL_DOMAIN)
    once this run plus the trailing 24h would exceed
    `max_new_external_recipients_per_24h` — Exchange Online's outbound spam
    policy only throttles external mail, so internal recipients (e.g. the
    current @yachaytech.edu.ec lists) are never deferred by this cap.
    Recipients skipped for the cap are NOT logged as sent, so simply
    re-running this after the window rolls forward (e.g. tomorrow) picks up
    exactly where it left off.

    Prints a live line per send (or per failure) and shows a tqdm progress
    bar (set `show_progress=False` to silence it, e.g. in a non-interactive
    script). Returns per-run counts plus a `failures` list of
    {email, error} for anything that didn't go out.
    """
    if delay_seconds < MIN_SECONDS_BETWEEN_SENDS:
        raise ValueError(
            f"delay_seconds={delay_seconds} is below the safe minimum "
            f"({MIN_SECONDS_BETWEEN_SENDS}s) — Exchange Online SMTP AUTH caps at "
            "30 messages/minute; going faster risks throttling or a temporary block."
        )

    from tqdm.auto import tqdm

    cfg = AUDIENCES[audience_key]
    sender_name = "Yachay Open Science Week 2026"
    done = _already_sent(audience_key)
    already_sent_external_24h = 0 if dry_run else sent_count_last_24h(external_only=True)

    sender = None if dry_run else os.environ["SMTP_USER"]
    server = None if dry_run else _smtp_connect()
    sent, skipped, failed, deferred = 0, 0, 0, 0
    sent_external_this_run = 0
    failures: list[dict] = []
    bar = tqdm(recipients, desc=audience_key, unit="email", disable=not show_progress)
    try:
        for r in bar:
            if r.email in done:
                skipped += 1
                bar.set_postfix(sent=sent, failed=failed, skipped=skipped)
                continue
            if dry_run:
                print(f"[DRY RUN] would send to {r.email} ({r.greeting})")
                sent += 1
                bar.set_postfix(sent=sent, failed=failed, skipped=skipped)
                continue
            if is_external(r.email) and (
                already_sent_external_24h + sent_external_this_run >= max_new_external_recipients_per_24h
            ):
                deferred += 1
                bar.set_postfix(sent=sent, failed=failed, deferred=deferred)
                continue
            try:
                html = render_html(audience_key, r)
                msg = _build_message(cfg["subject"], html, sender, sender_name, r.email)
                server.sendmail(sender, [r.email], msg.as_string())
                _log_send(r.email, audience_key, "sent")
                sent += 1
                if is_external(r.email):
                    sent_external_this_run += 1
                print(f"[OK] {audience_key} -> {r.email}")
                bar.set_postfix(sent=sent, failed=failed, skipped=skipped)
                time.sleep(delay_seconds)
            except Exception as exc:  # noqa: BLE001 — log and keep going
                _log_send(r.email, audience_key, "failed", str(exc))
                failed += 1
                failures.append({"email": r.email, "error": str(exc)})
                print(f"[FAILED] {audience_key} -> {r.email}: {exc}")
                bar.set_postfix(sent=sent, failed=failed, skipped=skipped)
    finally:
        bar.close()
        if server:
            server.quit()

    if deferred:
        print(
            f"[{audience_key}] hit the {max_new_external_recipients_per_24h}/24h external-recipient "
            f"cap — {deferred} recipients deferred. Re-run send_batch() after the 24h window rolls "
            "forward (e.g. tomorrow) to continue; already-sent recipients won't be re-sent."
        )
    if failures:
        print(f"[{audience_key}] {len(failures)} failure(s):")
        for f in failures:
            print(f"   {f['email']}: {f['error']}")

    return {
        "sent": sent,
        "skipped_already_sent": skipped,
        "failed": failed,
        "deferred_daily_cap": deferred,
        "failures": failures,
    }
