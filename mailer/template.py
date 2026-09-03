"""HTML email template for YOSW 2026 invitations (Spanish only).

Sober, table-based layout (for email-client compatibility) using the site's
brand palette from src/styles/tokens.css. The header shows the full brand
logo (src/assets/brand/logo-color.png). The body text sits over a faded,
low-brightness render of the site's tower drawing (mailer/assets/watermark.png,
built by build_header.py) as a CSS background-image on the text <td>. Both
images are referenced by CID ("cid:logo" / "cid:watermark") so they must be
attached inline when the email is actually sent.

Note: CSS background-image on a <td> isn't reliable in classic desktop
Outlook (its Word rendering engine ignores it). A true cross-client fix
needs a publicly-hosted image URL for a VML fallback, which this local,
no-hosting mailer doesn't have. The degradation is graceful — those readers
just see the plain white background, with all text still fully legible.

The color bar reproduces the site's --grad-spectrum accent as discrete solid
segments (a real CSS gradient renders as a flat block in Outlook's desktop
engine, so segments are the reliable cross-client choice).
"""

BLUE = "#1f5c8e"
BLUE_DARK = "#164a75"
TEAL = "#0f9ba8"
TEXT = "#24313d"
MUTED = "#5d6771"
BORDER = "#e2e7eb"
PAGE = "#f4f5f2"

# The five eje colors, in the same order as --grad-spectrum in tokens.css.
EJE_COLORS = ["#1f5c8e", "#0f9ba8", "#74b944", "#f2a900", "#d6402c"]


def _color_bar(height: int = 6) -> str:
    cells = "".join(
        f'<td width="20%" style="background:{c};height:{height}px;line-height:0;font-size:0;">&nbsp;</td>'
        for c in EJE_COLORS
    )
    return (
        f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
        f"<tr>{cells}</tr></table>"
    )


def build_email_html(*, body_html: str, logo_cid: str = "logo", watermark_cid: str = "watermark") -> str:
    """Return the full HTML document for one invitation email.

    `body_html` is the fully formatted Spanish message body (already built by
    audiences.py); this function only wraps it with the shared header/footer.
    """
    color_bar = _color_bar()

    return f"""\
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Yachay Open Science Week 2026</title>
</head>
<body style="margin:0;padding:0;background:{PAGE};font-family:Arial,Helvetica,sans-serif;color:{TEXT};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{PAGE};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="900" cellpadding="0" cellspacing="0"
             style="max-width:900px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;
                    border:1px solid {BORDER};">
        <tr><td>{color_bar}</td></tr>
        <tr>
          <td style="background:#ffffff;padding:32px 48px;text-align:center;">
            <img src="cid:{logo_cid}" alt="Yachay Open Science Week 2026"
                 width="260" style="display:block;margin:0 auto;max-width:260px;height:auto;">
          </td>
        </tr>
        <tr>
          <td style="background-color:#ffffff;background-image:url('cid:{watermark_cid}');
                     background-repeat:no-repeat;background-position:center top;
                     padding:8px 56px 32px 56px;font-size:16px;line-height:1.7;">
            {body_html}
          </td>
        </tr>
        <tr><td>{color_bar}</td></tr>
        <tr>
          <td style="background:{PAGE};padding:24px 56px;text-align:center;">
            <p style="margin:0;font-size:12px;line-height:1.6;color:{MUTED};">
              Yachay Open Science Week 2026 · Yachay Tech, Urcuquí, Ecuador<br>
              ¿Preguntas? Escríbenos a
              <a href="mailto:YOSW_organization@yachaytech.edu.ec" style="color:{BLUE};">YOSW_organization@yachaytech.edu.ec</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
"""
