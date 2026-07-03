import Redis from "ioredis";
import "dotenv/config";

/**
 * Real Redis client wrapper.
 *
 * If REDIS_URL is unreachable (e.g. no credentials provided yet during local
 * dev), we transparently fall back to an in-memory store that implements the
 * same subset of commands we use (get/set/del/hset/hgetall/keys/etc.), so the
 * rest of the app never needs to know which backend is active.
 */

class InMemoryStore {
  constructor() {
    this.store = new Map();
    this.hashes = new Map();
    console.warn(
      "[redis] Falling back to IN-MEMORY store. Data will NOT persist across restarts. " +
      "Set REDIS_URL in backend/.env to use real Redis."
    );
  }
  async set(key, value) { this.store.set(key, value); return "OK"; }
  async get(key) { return this.store.has(key) ? this.store.get(key) : null; }
  async del(key) { this.store.delete(key); this.hashes.delete(key); return 1; }
  async exists(key) { return this.store.has(key) || this.hashes.has(key) ? 1 : 0; }
  async keys(pattern) {
    const prefix = pattern.replace("*", "");
    return [...new Set([...this.store.keys(), ...this.hashes.keys()])].filter((k) => k.startsWith(prefix));
  }
  async hset(key, obj) {
    const existing = this.hashes.get(key) || {};
    this.hashes.set(key, { ...existing, ...obj });
    return 1;
  }
  async hgetall(key) { return this.hashes.get(key) || {}; }
  async hdel(key) { this.hashes.delete(key); return 1; }
  async expire() { return 1; }
  async setex(key, _seconds, value) { this.store.set(key, value); return "OK"; }
  async lpush(key, value) {
    const list = this.store.get(key) || [];
    list.unshift(value);
    this.store.set(key, list);
    return list.length;
  }
  async lrange(key, start, stop) {
    const list = this.store.get(key) || [];
    const end = stop === -1 ? list.length : stop + 1;
    return list.slice(start, end);
  }
  async quit() { return "OK"; }
}

let client;

function createClient() {
  const url = process.env.REDIS_URL;
  if (!url || url.includes("localhost")) {
    // No real connection string supplied yet -> safe fallback for dev/demo.
    // Once a real REDIS_URL is provided in .env, this branch is skipped and
    // ioredis connects to the real managed Redis instance.
  }

  try {
    const redis = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // don't keep retrying forever in dev
    });

    redis.on("error", (err) => {
      console.error("[redis] connection error:", err.message);
    });

    return redis;
  } catch (err) {
    console.error("[redis] failed to init client:", err.message);
    return null;
  }
}

export async function getRedisClient() {
  if (client) return client;

  const redis = createClient();

  if (!redis) {
    client = new InMemoryStore();
    return client;
  }

  try {
    await redis.connect();
    await redis.ping();
    console.log("[redis] Connected to Redis at", process.env.REDIS_URL);
    client = redis;
  } catch (err) {
    console.warn("[redis] Could not connect to REDIS_URL:", err.message);
    client = new InMemoryStore();
  }

  return client;
}

export default getRedisClient;
