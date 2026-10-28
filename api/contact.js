// Función de Vercel: recibe el formulario de contacto y envía los correos con Resend.
// Variables de entorno (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY  (obligatoria) clave de Resend
//   CONTACT_TO      (opcional) destino, por defecto arvabranch@gmail.com
//   CONTACT_FROM    (opcional) remitente con dominio verificado, ej. "ARVABRANCH <hola@arvabranch.com>".
//                   Si está definida, el cliente también recibe una confirmación automática.

const { notificationEmail, confirmationEmail } = require("./_email");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v, max) => String(v || "").trim().slice(0, max);

async function send(payload) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return res.json();
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(503).json({ success: false, message: "not_configured" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  if (body._honey) return res.status(200).json({ success: true }); // bot: fingimos éxito

  const name = clip(body.name, 120);
  const email = clip(body.email, 200);
  const message = clip(body.message, 5000);
  const services = (Array.isArray(body.services) ? body.services : []).map((s) => clip(s, 60)).filter(Boolean).slice(0, 8);
  if (!name || !EMAIL_RE.test(email)) {
    return res.status(400).json({ success: false, message: "invalid" });
  }

  const date = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "full", timeStyle: "short", timeZone: "America/Bogota",
  }).format(new Date());
  const page = clip(req.headers.referer, 300);
  const from = process.env.CONTACT_FROM || "ARVABRANCH <onboarding@resend.dev>";
  const data = { name, email, services, message, date, page };

  try {
    await send({
      from,
      to: [process.env.CONTACT_TO || "arvabranch@gmail.com"],
      reply_to: email,
      subject: `Nuevo proyecto — ${name}`,
      html: notificationEmail(data),
    });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ success: false, message: "send_failed" });
  }

  if (process.env.CONTACT_FROM) {
    // La confirmación al cliente es opcional: si falla, la solicitud ya llegó igual.
    await send({
      from,
      to: [email],
      reply_to: process.env.CONTACT_TO || "arvabranch@gmail.com",
      subject: "Recibimos tu mensaje — ARVABRANCH",
      html: confirmationEmail(data),
    }).catch((err) => console.error(err));
  }

  return res.status(200).json({ success: true });
};
