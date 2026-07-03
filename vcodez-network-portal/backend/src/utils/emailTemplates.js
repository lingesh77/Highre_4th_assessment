const brandWrapper = (title, bodyHtml) => `
<div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; background: linear-gradient(135deg,#ecfdf5,#ecfeff,#eff6ff); padding: 32px;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15,23,42,0.08);">
    <div style="background: linear-gradient(90deg,#059669,#0891b2,#2563eb); padding: 20px 28px;">
      <span style="color:#fff; font-weight:800; font-size:20px; letter-spacing:0.5px;">Highre Software Network Portal</span>
    </div>
    <div style="padding: 28px;">
      <h2 style="margin:0 0 12px; color:#1e293b;">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="padding: 16px 28px; background:#f8fafc; color:#94a3b8; font-size:12px;">
      This is an automated message from Highre Software Network Portal. Please do not reply.
    </div>
  </div>
</div>`;

export function accountCreatedTemplate({ name }) {
  return brandWrapper(
    `Welcome, ${name} 👋`,
    `<p style="color:#475569; line-height:1.6;">Your Highre Software Network Portal account has been created successfully. You can now sign in and start managing switch devices, view live cluster metrics, and generate reports.</p>`
  );
}

export function passwordResetTemplate({ name, resetUrl }) {
  return brandWrapper(
    `Reset your password`,
    `<p style="color:#475569; line-height:1.6;">Hi ${name}, we received a request to reset your password. Click the button below within 30 minutes to choose a new one.</p>
     <a href="${resetUrl}" style="display:inline-block; margin-top:16px; padding:12px 24px; background:linear-gradient(90deg,#2563eb,#0891b2); color:#fff; text-decoration:none; border-radius:10px; font-weight:600;">Reset Password</a>
     <p style="color:#94a3b8; font-size:13px; margin-top:20px;">If you didn't request this, you can safely ignore this email.</p>`
  );
}

export function clusterAlertTemplate({ clusterName, issue, severity, timestamp }) {
  const color = severity === "critical" ? "#dc2626" : severity === "warning" ? "#d97706" : "#0891b2";
  return brandWrapper(
    `⚠ Cluster Alert: ${clusterName}`,
    `<p style="color:#475569; line-height:1.6;">An issue has been detected on cluster <b>${clusterName}</b>.</p>
     <div style="margin:16px 0; padding:14px 16px; border-left:4px solid ${color}; background:#f8fafc; border-radius:8px;">
       <p style="margin:0; color:#1e293b;"><b>Severity:</b> ${severity.toUpperCase()}</p>
       <p style="margin:6px 0 0; color:#1e293b;"><b>Issue:</b> ${issue}</p>
       <p style="margin:6px 0 0; color:#1e293b;"><b>Detected at:</b> ${timestamp}</p>
     </div>
     <p style="color:#475569;">Please investigate the affected devices in the Network Portal dashboard.</p>`
  );
}
