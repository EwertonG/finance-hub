interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_NAME = 'CentralFinanças';

export async function sendEmail({ to, subject, html, text }: EmailMessage) {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(`[email] BREVO_API_KEY/EMAIL_FROM ausentes. E-mail não enviado.\nPara: ${to}\nAssunto: ${subject}\n${text}`);
    return;
  }

  const response = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: from },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Brevo respondeu ${response.status}: ${await response.text()}`);
  }
}
