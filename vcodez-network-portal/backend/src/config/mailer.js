import nodemailer from "nodemailer";
import "dotenv/config";

/**
 * Creates a nodemailer transporter from SMTP env vars.
 * If SMTP_USER / SMTP_PASS are not set, falls back to a transporter that
 * just logs the email to the console -- so signup / reset / alert flows keep
 * working end-to-end during development before real SMTP creds are added.
 */
function buildTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn(
      "[mailer] SMTP_USER/SMTP_PASS not set. Using CONSOLE mailer " +
      "(emails will be logged, not actually sent). Fill in backend/.env to send real email."
    );
    return {
      sendMail: async (options) => {
        console.log("\n===== [console-mailer] Email =====");
        console.log("To:", options.to);
        console.log("Subject:", options.subject);
        console.log("---");
        console.log(options.text || options.html);
        console.log("===================================\n");
        return { messageId: "console-mailer-" + Date.now() };
      },
    };
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export const transporter = buildTransporter();

export async function sendEmail({ to, subject, html, text }) {
  const from = process.env.EMAIL_FROM || "Highre Software Network Portal <no-reply@highresoftware.com>";
  return transporter.sendMail({ from, to, subject, html, text });
}
