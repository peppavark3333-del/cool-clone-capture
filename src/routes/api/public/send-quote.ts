import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const QUOTE_RECIPIENT = "rybus.info@gmail.com";

const schema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(1).max(30),
  email: z.string().email().max(255),
  address: z.string().max(500).optional().nullable(),
  service_type: z.string().max(100).optional().nullable(),
  property_size: z.string().max(100).optional().nullable(),
  message: z.string().max(2000).optional().nullable(),
});

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );
}

function buildHtml(d: z.infer<typeof schema>) {
  const row = (label: string, value?: string | null) =>
    value
      ? `<tr><td style="padding:10px 14px;background:#f6f8fb;border-radius:8px;font-size:13px;color:#5b6472;width:140px;font-weight:600">${esc(label)}</td><td style="padding:10px 14px;font-size:14px;color:#0f172a">${esc(value)}</td></tr>`
      : "";
  return `<!doctype html><html><body style="margin:0;background:#eef2f7;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a">
<div style="max-width:640px;margin:0 auto;padding:24px">
  <div style="background:linear-gradient(135deg,#0ea5e9,#0369a1);color:#fff;padding:28px 30px;border-radius:16px 16px 0 0">
    <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.85">New Quote Request</div>
    <div style="font-size:26px;font-weight:800;margin-top:6px">${esc(d.name)}</div>
    <div style="margin-top:4px;opacity:.9;font-size:14px">${esc(d.service_type || "General enquiry")}</div>
  </div>
  <div style="background:#fff;padding:24px 26px;border-radius:0 0 16px 16px;box-shadow:0 8px 24px rgba(15,23,42,.06)">
    <table style="width:100%;border-collapse:separate;border-spacing:0 6px">
      ${row("Phone", d.phone)}
      ${row("Email", d.email)}
      ${row("Address", d.address)}
      ${row("Property size", d.property_size)}
      ${row("Service", d.service_type)}
    </table>
    ${d.message ? `<div style="margin-top:18px;padding:16px 18px;background:#f6f8fb;border-left:4px solid #0ea5e9;border-radius:8px"><div style="font-size:12px;color:#5b6472;font-weight:600;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Message</div><div style="font-size:14px;line-height:1.55;white-space:pre-wrap">${esc(d.message)}</div></div>` : ""}
    <div style="margin-top:22px;display:flex;gap:10px;flex-wrap:wrap">
      <a href="tel:${esc(d.phone)}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px">Call ${esc(d.name.split(" ")[0])}</a>
      <a href="mailto:${esc(d.email)}" style="display:inline-block;background:#fff;color:#0369a1;border:1px solid #0ea5e9;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px">Reply by email</a>
    </div>
    <div style="margin-top:20px;font-size:12px;color:#94a3b8">Rybus · Air-Conditioning & Refrigeration · Cape Town</div>
  </div>
</div></body></html>`;
}

function toBase64Url(s: string) {
  return Buffer.from(s, "utf-8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildRawEmail(d: z.infer<typeof schema>) {
  const subject = `New quote request — ${d.name}${d.service_type ? ` (${d.service_type})` : ""}`;
  const html = buildHtml(d);
  const lines = [
    `To: ${QUOTE_RECIPIENT}`,
    `Reply-To: ${d.name} <${d.email}>`,
    `Subject: =?UTF-8?B?${Buffer.from(subject, "utf-8").toString("base64")}?=`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
  ].join("\r\n");
  return toBase64Url(lines);
}

export const Route = createFileRoute("/api/public/send-quote")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const data = schema.parse(body);

          const lovableKey = process.env.LOVABLE_API_KEY;
          const gmailKey = process.env.GOOGLE_MAIL_API_KEY;
          if (!lovableKey || !gmailKey) {
            console.error("[send-quote] missing gateway credentials");
            return Response.json({ ok: false, error: "email_not_configured" }, { status: 500 });
          }

          const res = await fetch(
            "https://connector-gateway.lovable.dev/google_mail/gmail/v1/users/me/messages/send",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${lovableKey}`,
                "X-Connection-Api-Key": gmailKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ raw: buildRawEmail(data) }),
            },
          );

          if (!res.ok) {
            const text = await res.text();
            console.error(`[send-quote] gateway failed [${res.status}]: ${text}`);
            return Response.json({ ok: false, error: "send_failed" }, { status: 502 });
          }

          return Response.json({ ok: true });
        } catch (err) {
          console.error("[send-quote] error", err);
          return Response.json({ ok: false, error: "invalid_request" }, { status: 400 });
        }
      },
    },
  },
});
