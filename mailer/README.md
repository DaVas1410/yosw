# YOSW 2026 invitation mailer

Sends the congress invitation email to the committee and student lists.

## Setup

1. `uve activate py311` (deps already installed: `openpyxl`, `jupyter`, `ipykernel`, `python-dotenv`, `Pillow`, `tqdm`).
2. Place the recipient spreadsheets at the repo root (already gitignored):
   - `42. INF COMITE WOSW.xlsx`
   - `Matriculados_Carrera_DGSA 2026-2.xlsx`
3. Copy `.env.example` to `.env` in this folder and fill in `SMTP_PASSWORD`
   (an app password if the Outlook/Office365 account has MFA enabled).
4. Open `invite.ipynb` (kernel: `py311`) and run the cells top to bottom.

## Files

- `audiences.py` — one entry per recipient list: source file, name/email/
  gender columns, and the fixed Spanish subject + body copy for that group
  (with a `{greeting}` placeholder filled in per recipient). Add a new entry
  here (e.g. `alumni`) once that list exists — no other code changes needed.
- `template.py` — the HTML email layout (brand colors from
  `src/styles/tokens.css`): full logo header (`cid:logo`) and a faded tower
  watermark behind the body text (`cid:watermark`).
- `build_header.py` — generates `assets/watermark.png` (the site's tower
  drawing, washed out and low-opacity) from `src/assets/brand/tower-mark.png`.
  Re-run it if you want to tweak `WATERMARK_ALPHA`/`WATERMARK_BRIGHTNESS` or
  the source art changes:
  `/home/davas/.uve/py311/bin/python mailer/build_header.py`
- `mailer_utils.py` — loading recipients (professors get `Prof. {{nombre}}
  {{apellido}}:`; students get a gender-aware `Estimado`/`Estimada`
  greeting), rendering previews, test-sending, and rate-limited batch-sending
  with a resumable `output/sent_log.csv`, a live tqdm progress bar, and a
  per-send `[OK]`/`[FAILED]` log line (failures are also collected into the
  returned dict's `failures` list: `[{"email": ..., "error": ...}, ...]`).
- `invite.ipynb` — the notebook that ties it together: load → preview →
  test send → real send.

## Safety

- `send_batch(..., dry_run=True)` (the notebook default) only prints who
  *would* get an email.
- Sends are logged to `output/sent_log.csv`; re-running skips anyone
  already marked `sent`, so an interrupted run is safe to resume.
- `output/` and `.env` are gitignored — never commit recipient data,
  rendered previews, or credentials.

## Exchange Online rate limits

Sent via `smtp.office365.com` (SMTP AUTH) for `YOSW_organization@yachaytech.edu.ec`.
Two limits matter, and `mailer_utils.py` handles both automatically:

- **30 messages/minute, 3 concurrent connections** — applies to every
  message, internal or external. `send_batch` paces sends 3 seconds apart
  (`MIN_SECONDS_BETWEEN_SENDS`) and raises if called with a faster delay.
- **1,000/day "non-relationship" (first-time) recipients, part of Exchange
  Online's outbound spam policy** — this only governs *external* mail (any
  domain other than the sender's own accepted domain). Internal mail gets a
  much higher allowance (up to 10,000/day). Both current lists (committee,
  students) are 100% `@yachaytech.edu.ec` — the same domain as the sender —
  so they're internal and this cap doesn't bind them; all 1,830 recipients
  can go out in one run (paced sending takes about 90 minutes). The cap is
  still enforced in code (`MAX_NEW_EXTERNAL_RECIPIENTS_PER_ROLLING_24H = 900`,
  checked via `is_external()`), so it's ready for a future external list
  (e.g. alumni on personal email) without any additional changes.
- Recipients deferred by the external cap are **not** logged as sent — just
  re-run `send_batch` after the 24h window rolls forward to pick up the rest.

## Why sending isn't parallelized

The 30 messages/minute figure above is a *rate* limit, not a per-connection
latency limit — the total time to send N messages is at least N/30 minutes
no matter how many of Exchange Online's 3 allowed concurrent connections are
used, since the aggregate cap across all connections is still 30/minute.
Opening multiple connections would add real complexity (coordinating a
shared rate budget across threads, thread-safe log writes) for zero
throughput gain, and raises the risk of accidentally exceeding the
concurrent-connection or per-minute caps. `send_batch` stays a single
sequential connection paced by `delay_seconds`.
