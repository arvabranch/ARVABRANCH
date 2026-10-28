// Plantillas de correo de ARVABRANCH: negro, blanco y degradados de marca.
// Todo va con estilos en línea y tablas para que se vea bien en Gmail, Outlook y Apple Mail.

const GRADIENT = "linear-gradient(100deg, #34f5c5 0%, #3bb2f6 50%, #a78bfa 100%)";
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const escapeHtml = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const nl2br = (s) => escapeHtml(s).replace(/\r?\n/g, "<br />");

// Barra fina con el degradado de marca (color sólido de respaldo para clientes sin soporte)
const gradientBar = (height = 4) =>
  `<tr><td height="${height}" style="height:${height}px;line-height:${height}px;font-size:0;background:#34f5c5;background-image:${GRADIENT};">&nbsp;</td></tr>`;

const wordmark = `
  <span style="font-family:${FONT};font-size:15px;font-weight:700;letter-spacing:3px;color:#ffffff;">ARVA</span><span style="font-family:${FONT};font-size:15px;font-weight:700;letter-spacing:3px;color:#34f5c5;">BRANCH</span>`;

const layout = ({ preheader, body }) => `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>ARVABRANCH</title>
</head>
<body style="margin:0;padding:0;background:#000000;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#000000;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background:#000000;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          <tr>
            <td style="padding:0 4px 24px;">${wordmark}</td>
          </tr>
          <tr>
            <td style="border-radius:20px;overflow:hidden;background:#0a0a0a;border:1px solid #1f1f1f;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${gradientBar(4)}
                ${body}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 4px 0;font-family:${FONT};font-size:12px;line-height:18px;color:#5c5c5c;">
              ARVABRANCH · Software a la medida, automatizaciones y bots<br />
              <a href="https://www.arvabranch.com" style="color:#8a8a8a;text-decoration:none;">arvabranch.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const pill = (text) =>
  `<span style="display:inline-block;margin:0 6px 8px 0;padding:7px 14px;border-radius:999px;background:#161616;border:1px solid #2a2a2a;font-family:${FONT};font-size:13px;line-height:16px;color:#ffffff;">${escapeHtml(text)}</span>`;

const row = (label, value) => `
  <tr>
    <td style="padding:14px 0;border-top:1px solid #1c1c1c;font-family:${FONT};font-size:13px;color:#7a7a7a;width:110px;vertical-align:top;">${label}</td>
    <td style="padding:14px 0;border-top:1px solid #1c1c1c;font-family:${FONT};font-size:14px;color:#ffffff;vertical-align:top;">${value}</td>
  </tr>`;

const button = (href, text) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="border-radius:999px;background:#34f5c5;background-image:${GRADIENT};">
        <a href="${href}" style="display:inline-block;padding:15px 30px;font-family:${FONT};font-size:15px;font-weight:700;color:#000000;text-decoration:none;border-radius:999px;">${text}</a>
      </td>
    </tr>
  </table>`;

/** Correo que recibe ARVABRANCH con cada solicitud. */
function notificationEmail({ name, email, services, message, date, page }) {
  const replyHref = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("Re: Tu proyecto con ARVABRANCH")}`;
  const pills = services.length ? services.map(pill).join("") : pill("Sin especificar");
  const body = `
    <tr>
      <td style="padding:40px 36px 8px;">
        <p style="margin:0 0 14px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#34f5c5;">● Nuevo proyecto</p>
        <h1 style="margin:0;font-family:${FONT};font-size:32px;line-height:38px;font-weight:700;letter-spacing:-0.5px;color:#ffffff;">${escapeHtml(name)}</h1>
        <p style="margin:10px 0 0;font-family:${FONT};font-size:15px;line-height:22px;color:#9a9a9a;">quiere hablar contigo sobre:</p>
      </td>
    </tr>
    <tr><td style="padding:16px 36px 8px;">${pills}</td></tr>
    <tr>
      <td style="padding:16px 36px 8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111111;border-radius:14px;">
          <tr>
            <td width="3" style="width:3px;background:#34f5c5;background-image:linear-gradient(180deg, #34f5c5, #3bb2f6, #a78bfa);border-radius:14px 0 0 14px;font-size:0;">&nbsp;</td>
            <td style="padding:20px 22px;">
              <p style="margin:0 0 8px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6a6a6a;">Mensaje</p>
              <p style="margin:0;font-family:${FONT};font-size:16px;line-height:25px;color:#f2f2f2;">${message ? nl2br(message) : '<span style="color:#6a6a6a;">(Sin mensaje)</span>'}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 36px 8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${row("Correo", `<a href="mailto:${escapeHtml(email)}" style="color:#ffffff;text-decoration:underline;">${escapeHtml(email)}</a>`)}
          ${row("Recibido", escapeHtml(date))}
          ${page ? row("Desde", `<a href="${escapeHtml(page)}" style="color:#9a9a9a;text-decoration:none;">${escapeHtml(page.replace(/^https?:\/\//, ""))}</a>`) : ""}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 36px 40px;">
        ${button(replyHref, `Responder a ${escapeHtml(name.split(" ")[0])} →`)}
        <p style="margin:14px 0 0;font-family:${FONT};font-size:12px;color:#5c5c5c;">También puedes contestar directamente este correo.</p>
      </td>
    </tr>`;
  return layout({ preheader: `${name} · ${services.join(", ") || "Nuevo mensaje"}`, body });
}

/** Confirmación automática para el cliente (solo con dominio verificado en Resend). */
function confirmationEmail({ name, services, message }) {
  const first = name.split(" ")[0];
  const body = `
    <tr>
      <td style="padding:44px 36px 8px;">
        <p style="margin:0 0 14px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#34f5c5;">● Mensaje recibido</p>
        <h1 style="margin:0;font-family:${FONT};font-size:30px;line-height:36px;font-weight:700;letter-spacing:-0.5px;color:#ffffff;">Gracias, ${escapeHtml(first)}.</h1>
        <p style="margin:14px 0 0;font-family:${FONT};font-size:16px;line-height:25px;color:#a6a6a6;">Ya tenemos tu solicitud. Un experto de nuestro equipo la revisará y te responderá en menos de 24 horas con los siguientes pasos.</p>
      </td>
    </tr>
    ${services.length ? `<tr><td style="padding:20px 36px 0;">${services.map(pill).join("")}</td></tr>` : ""}
    ${message ? `
    <tr>
      <td style="padding:12px 36px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111111;border-radius:14px;">
          <tr><td style="padding:18px 22px;font-family:${FONT};font-size:14px;line-height:22px;color:#bdbdbd;">${nl2br(message)}</td></tr>
        </table>
      </td>
    </tr>` : ""}
    <tr>
      <td style="padding:32px 36px 44px;">
        ${button("https://www.arvabranch.com", "Visitar arvabranch.com")}
      </td>
    </tr>`;
  return layout({ preheader: "Recibimos tu mensaje. Te respondemos en menos de 24 horas.", body });
}

module.exports = { notificationEmail, confirmationEmail, escapeHtml };
