import { SITE_NAME, SITE_URL } from "@/lib/seo";

const FROM = process.env.RESEND_FROM || "Ubora World <hello@uboraworld.com.ng>";

export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false as const, reason: "not_configured" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Resend send failed", res.status, body.slice(0, 300));
    return { sent: false as const, reason: "provider_error" };
  }
  return { sent: true as const };
}

function wrap(body: string) {
  return `<!doctype html>
<html>
<body style="margin:0;background:#f6f4ef;font-family:Georgia,serif;color:#101B33;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4ef;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e6e2d8;border-radius:16px;padding:32px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#8C6D1F;">${SITE_NAME}</p>
              ${body}
              <p style="margin:28px 0 0;font-size:12px;line-height:1.5;color:#6b7280;">
                This is not the official NOUN portal. Fees and TMAs stay on nouonline.nou.edu.ng and elearn.nou.edu.ng.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(to: string, fullName: string) {
  const first = fullName.split(" ")[0] || "there";
  const html = wrap(`
    <h1 style="margin:0 0 12px;font-size:24px;">Welcome to Ubora World, ${first}.</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
      Your 10-day free trial is open. Sit NOUN CBT practice, read course summaries, and ask the tutor from your phone.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${SITE_URL}/login" style="display:inline-block;background:#C79A3D;color:#101B33;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">Log in to start</a>
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">
      If you did not create this account, ignore this email.
    </p>
  `);
  return sendEmail({
    to,
    subject: "Welcome to Ubora World — your 10-day NOUN CBT trial",
    html,
    text: `Welcome to Ubora World, ${first}. Your 10-day free trial is open. Log in: ${SITE_URL}/login`,
  });
}

export async function sendPasswordResetEmail(to: string, fullName: string, link: string) {
  const first = fullName.split(" ")[0] || "there";
  const html = wrap(`
    <h1 style="margin:0 0 12px;font-size:24px;">Reset your password</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
      Hi ${first}, use this link within one hour to set a new Ubora World password.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${link}" style="display:inline-block;background:#C79A3D;color:#101B33;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">Set a new password</a>
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">
      If you did not ask for this, ignore the email. The link expires in 60 minutes.
    </p>
  `);
  return sendEmail({
    to,
    subject: "Reset your Ubora World password",
    html,
    text: `Hi ${first}, reset your Ubora World password (valid 1 hour): ${link}`,
  });
}
