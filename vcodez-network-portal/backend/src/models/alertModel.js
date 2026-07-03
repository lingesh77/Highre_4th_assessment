import { v4 as uuidv4 } from "uuid";
import { getRedisClient } from "../config/redis.js";

/**
 * Alerts get their own dedicated storage layer (separate Redis keyspace from
 * users/devices/metrics):
 *   alert:<id>     -> hash with the full alert record
 *   alerts:log     -> capped list of alert ids, newest first (history feed)
 */
const ALERT_KEY = (id) => `alert:${id}`;
const ALERT_LOG_KEY = "alerts:log";
const MAX_HISTORY = 200;

export async function recordAlert({
  clusterName,
  issue,
  severity,
  recipientEmail,
  sentBy,
  status = "sent",
  errorMessage = null,
}) {
  const redis = await getRedisClient();
  const id = uuidv4();
  const record = {
    id,
    clusterName,
    issue,
    severity,
    recipientEmail,
    sentBy: sentBy || "system",
    status,
    errorMessage: errorMessage || "",
    createdAt: new Date().toISOString(),
  };

  await redis.hset(ALERT_KEY(id), record);
  await redis.lpush(ALERT_LOG_KEY, id);

  return record;
}

export async function listRecentAlerts(limit = 25) {
  const redis = await getRedisClient();
  const ids = await redis.lrange(ALERT_LOG_KEY, 0, limit - 1);
  const alerts = [];
  for (const id of ids) {
    const record = await redis.hgetall(ALERT_KEY(id));
    if (record && record.id) alerts.push(record);
  }
  return alerts;
}

export async function trimAlertHistory(keep = MAX_HISTORY) {
  const redis = await getRedisClient();
  const ids = await redis.lrange(ALERT_LOG_KEY, 0, -1);
  if (ids.length <= keep) return;
  const stale = ids.slice(keep);
  for (const id of stale) {
    await redis.del(ALERT_KEY(id));
  }
}
