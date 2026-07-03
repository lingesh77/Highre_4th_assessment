import { getRedisClient } from "../config/redis.js";

const DEVICE_KEY = (id) => `device:${id}`;
const DEVICE_INDEX_KEY = "devices:index"; // list of all device ids

export async function listDevices() {
  const redis = await getRedisClient();
  const ids = await getIndex(redis);
  const devices = [];
  for (const id of ids) {
    const d = await redis.hgetall(DEVICE_KEY(id));
    if (d && d.id) devices.push(d);
  }
  return devices;
}

export async function getDevice(id) {
  const redis = await getRedisClient();
  const d = await redis.hgetall(DEVICE_KEY(id));
  return d && d.id ? d : null;
}

export async function upsertDevice(device) {
  const redis = await getRedisClient();
  await redis.hset(DEVICE_KEY(device.id), device);
  const ids = await getIndex(redis);
  if (!ids.includes(device.id)) {
    ids.push(device.id);
    await redis.set(DEVICE_INDEX_KEY, JSON.stringify(ids));
  }
  return device;
}

export async function updateDeviceStatus(id, status) {
  const redis = await getRedisClient();
  const existing = await getDevice(id);
  if (!existing) return null;
  await redis.hset(DEVICE_KEY(id), { status, updatedAt: new Date().toISOString() });
  return { ...existing, status };
}

export async function seedDevicesIfEmpty(seedList) {
  const redis = await getRedisClient();
  const ids = await getIndex(redis);
  if (ids.length > 0) return;
  for (const device of seedList) {
    await upsertDevice(device);
  }
}

async function getIndex(redis) {
  const raw = await redis.get(DEVICE_INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
