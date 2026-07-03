import { sendEmail } from "../config/mailer.js";
import { clusterAlertTemplate } from "../utils/emailTemplates.js";
import { findUserById } from "../models/userModel.js";
import { recordAlert, listRecentAlerts, trimAlertHistory } from "../models/alertModel.js";

export async function sendClusterAlert(req, res, next) {
  try {
    const { clusterName, issue, severity = "warning", recipientEmail } = req.body;
    if (!clusterName || !issue) {
      return res.status(400).json({ message: "clusterName and issue are required." });
    }

    let to = recipientEmail;
    if (!to && req.user) {
      const user = await findUserById(req.user.id);
      to = user?.email;
    }
    if (!to) {
      return res.status(400).json({ message: "No recipient email available." });
    }

    const timestamp = new Date().toLocaleString();
    let sentBy = "system";
    if (req.user) {
      const user = await findUserById(req.user.id);
      sentBy = user?.name || user?.email || "system";
    }

    try {
      await sendEmail({
        to,
        subject: `⚠ Cluster Alert: ${clusterName} (${severity.toUpperCase()})`,
        html: clusterAlertTemplate({ clusterName, issue, severity, timestamp }),
      });

      // Once the alert has actually gone out, persist a durable record of it —
      // kept in its own storage layer (Redis, dedicated `alert:*` keyspace,
      // separate from user/device/metric data) so the history survives page
      // reloads and isn't just held in frontend session state.
      const record = await recordAlert({
        clusterName,
        issue,
        severity,
        recipientEmail: to,
        sentBy,
        status: "sent",
      });
      await trimAlertHistory();

      res.json({ message: `Alert email sent to ${to}.`, timestamp, alert: record });
    } catch (sendErr) {
      await recordAlert({
        clusterName,
        issue,
        severity,
        recipientEmail: to,
        sentBy,
        status: "failed",
        errorMessage: sendErr.message,
      });
      throw sendErr;
    }
  } catch (err) {
    next(err);
  }
}

export async function getAlertHistory(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 25, 100);
    const alerts = await listRecentAlerts(limit);
    res.json({ alerts });
  } catch (err) {
    next(err);
  }
}
