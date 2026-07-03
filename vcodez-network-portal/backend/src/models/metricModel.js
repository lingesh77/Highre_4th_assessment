import { getRedisClient } from "../config/redis.js";

// Metrics are stored as a capped list per cluster, newest first:
// key: metrics:<clusterName>  -> list of JSON strings { t, min, max, median }
const METRIC_KEY = (cluster) => `metrics:${cluster}`;
const MAX_POINTS = 500;

export async function pushMetricPoint(cluster, point) {
  const redis = await getRedisClient();
  await redis.lpush(METRIC_KEY(cluster), JSON.stringify(point));
  return point;
}

export async function getMetricSeries(cluster, limit = 200) {
  const redis = await getRedisClient();
  const raw = await redis.lrange(METRIC_KEY(cluster), 0, limit - 1);
  return raw
    .map((r) => {
      try { return JSON.parse(r); } catch { return null; }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.t) - new Date(b.t));
}

export async function seedMetricsIfEmpty(cluster, generator) {
  const redis = await getRedisClient();
  const existing = await redis.lrange(METRIC_KEY(cluster), 0, 0);
  if (existing.length > 0) return;
  const points = generator();
  for (const p of points.slice(0, MAX_POINTS)) {
    await redis.lpush(METRIC_KEY(cluster), JSON.stringify(p));
  }
}
