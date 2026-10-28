// Plantillas de correo de ARVABRANCH: minimalistas, negro y blanco, con degradados solo como acento.
// Todo va con estilos en línea y tablas para que se vea bien en Gmail, Outlook y Apple Mail.
// Donde no hay soporte para degradados, el respaldo es blanco para mantener el blanco y negro.

const GRADIENT = "linear-gradient(90deg, #34f5c5 0%, #3bb2f6 50%, #a78bfa 100%)";
const GRADIENT_V = "linear-gradient(180deg, #34f5c5 0%, #3bb2f6 50%, #a78bfa 100%)";
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const WHITE = "#ffffff";
const MUTED = "#8c8c8c";
const FAINT = "#555555";
const LINE = "#1c1c1c";

const escapeHtml = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const nl2br = (s) => escapeHtml(s).replace(/\r?\n/g, "<br />");

// Línea con el degradado de marca
const gradientLine = (height = 1) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="${height}" style="height:${height}px;line-height:${height}px;font-size:0;background-color:${WHITE};background-image:${GRADIENT};">&nbsp;</td></tr></table>`;

const eyebrow = (text) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="font-size:0;line-height:0;vertical-align:middle;"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background-color:${WHITE};background-image:${GRADIENT};"></span></td>
      <td style="padding-left:10px;vertical-align:middle;font-family:${FONT};font-size:11px;line-height:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${MUTED};">${text}</td>
    </tr>
  </table>`;

const layout = ({ preheader, body }) => `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>ARVABRANCH</title>
</head>
<body style="margin:0;padding:0;background-color:#000000;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#000000;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background-color:#000000;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">
          <tr>
            <td style="padding:0 0 32px;">
              <p style="margin:0;font-family:${FONT};font-size:14px;line-height:14px;font-weight:700;letter-spacing:5px;color:${WHITE};">ARVABRANCH</p>
              <table role="presentation" width="44" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;"><tr><td height="2" style="height:2px;line-height:2px;font-size:0;background-color:${WHITE};background-image:${GRADIENT};">&nbsp;</td></tr></table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#0a0a0a;border:1px solid ${LINE};border-radius:24px;overflow:hidden;">
              ${gradientLine(3)}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${body}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 0 0;font-family:${FONT};font-size:12px;line-height:19px;color:${FAINT};">
              Software a la medida · Automatizaciones · Bots<br />
              <a href="https://www.arvabranch.com" style="color:${MUTED};text-decoration:none;">arvabranch.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const pill = (text) =>
  `<span style="display:inline-block;margin:0 8px 8px 0;padding:8px 16px;border-radius:999px;border:1px solid #2e2e2e;font-family:${FONT};font-size:13px;line-height:15px;color:${WHITE};">${escapeHtml(text)}</span>`;

const row = (label, value) => `
  <tr>
    <td style="padding:16px 0;border-bottom:1px solid ${LINE};font-family:${FONT};font-size:13px;color:${MUTED};width:96px;vertical-align:top;">${label}</td>
    <td style="padding:16px 0;border-bottom:1px solid ${LINE};font-family:${FONT};font-size:14px;color:${WHITE};vertical-align:top;">${value}</td>
  </tr>`;

const button = (href, text) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="border-radius:999px;background-color:${WHITE};background-image:${GRADIENT};">
        <a href="${href}" style="display:inline-block;padding:16px 32px;font-family:${FONT};font-size:15px;line-height:15px;font-weight:700;color:#000000;text-decoration:none;border-radius:999px;">${text}</a>
      </td>
    </tr>
  </table>`;

// Bloque de cita con barra vertical en degradado
const quote = (html, color = WHITE) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td width="2" style="width:2px;font-size:0;background-color:${WHITE};background-image:${GRADIENT_V};">&nbsp;</td>
      <td style="padding:4px 0 4px 20px;font-family:${FONT};font-size:17px;line-height:27px;color:${color};">${html}</td>
    </tr>
  </table>`;

/** Correo que recibe ARVABRANCH con cada solicitud. */
function notificationEmail({ name, email, services, message, date, page }) {
  const replyHref = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("Re: Tu proyecto con ARVABRANCH")}`;
  const pills = services.length ? services.map(pill).join("") : pill("Sin especificar");
  const body = `
    <tr><td style="padding:44px 40px 0;">${eyebrow("Nuevo proyecto")}</td></tr>
    <tr>
      <td style="padding:22px 40px 0;">
        <h1 style="margin:0;font-family:${FONT};font-size:36px;line-height:40px;font-weight:700;letter-spacing:-1px;color:${WHITE};">${escapeHtml(name)}</h1>
        <p style="margin:12px 0 0;font-family:${FONT};font-size:15px;line-height:22px;color:${MUTED};">quiere hablar contigo sobre</p>
      </td>
    </tr>
    <tr><td style="padding:18px 40px 0;">${pills}</td></tr>
    <tr>
      <td style="padding:28px 40px 0;">
        ${quote(message ? nl2br(message) : `<span style="color:${FAINT};">Sin mensaje</span>`)}
      </td>
    </tr>
    <tr>
      <td style="padding:36px 40px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${LINE};">
          ${row("Correo", `<a href="mailto:${escapeHtml(email)}" style="color:${WHITE};text-decoration:none;">${escapeHtml(email)}</a>`)}
          ${row("Recibido", escapeHtml(date))}
          ${page ? row("Desde", `<a href="${escapeHtml(page)}" style="color:${MUTED};text-decoration:none;">${escapeHtml(page.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</a>`) : ""}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:36px 40px 44px;">
        ${button(replyHref, `Responder a ${escapeHtml(name.split(" ")[0])} &rarr;`)}
        <p style="margin:16px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:${FAINT};">O responde directamente este correo: le llega a ${escapeHtml(email)}.</p>
      </td>
    </tr>`;
  return layout({ preheader: `${name} · ${services.join(", ") || "Nuevo mensaje"}`, body });
}

/** Confirmación automática para el cliente. */
function confirmationEmail({ name, services, message }) {
  const first = name.split(" ")[0];
  const body = `
    <tr><td style="padding:44px 40px 0;">${eyebrow("Mensaje recibido")}</td></tr>
    <tr>
      <td style="padding:22px 40px 0;">
        <h1 style="margin:0;font-family:${FONT};font-size:34px;line-height:40px;font-weight:700;letter-spacing:-1px;color:${WHITE};">Gracias, ${escapeHtml(first)}.</h1>
        <p style="margin:16px 0 0;font-family:${FONT};font-size:16px;line-height:26px;color:${MUTED};">Ya tenemos tu solicitud. Nuestro equipo la revisará y te responderá en menos de 24 horas con los siguientes pasos.</p>
      </td>
    </tr>
    ${services.length ? `<tr><td style="padding:24px 40px 0;">${services.map(pill).join("")}</td></tr>` : ""}
    ${message ? `<tr><td style="padding:24px 40px 0;">${quote(nl2br(message), "#bdbdbd")}</td></tr>` : ""}
    <tr>
      <td style="padding:36px 40px 0;">${gradientLine(1)}</td>
    </tr>
    <tr>
      <td style="padding:28px 40px 44px;">
        <p style="margin:0 0 22px;font-family:${FONT};font-size:14px;line-height:22px;color:${MUTED};">Mientras tanto, conoce lo que construimos.</p>
        ${button("https://www.arvabranch.com", "Visitar arvabranch.com &rarr;")}
      </td>
    </tr>`;
  return layout({ preheader: "Recibimos tu mensaje. Te respondemos en menos de 24 horas.", body });
}

module.exports = { notificationEmail, confirmationEmail, escapeHtml };
