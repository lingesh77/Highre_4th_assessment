import "dotenv/config";
import { seedDevicesIfEmpty } from "../models/deviceModel.js";
import { seedMetricsIfEmpty } from "../models/metricModel.js";
import { getRedisClient } from "../config/redis.js";

const deviceSeed = [
  { id: "SW-1001", model: "Cisco 3850", physical: "Rack 1 - Slot A", config: "Config-A", status: "Online" },
  { id: "SW-4001", model: "Cisco 9300", physical: "Rack 2 - Slot A", config: "Config-B", status: "Online" },
  { id: "SW-4501", model: "Cisco 9500", physical: "Rack 3 - Slot A", config: "Config-C", status: "Offline" },
  { id: "SW-2001", model: "Arista 7050", physical: "Rack 4 - Slot A", config: "Config-D", status: "Online" },
  { id: "SW-2501", model: "Arista 7280", physical: "Rack 5 - Slot A", config: "Config-E", status: "Online" },
  { id: "SW-3001", model: "Juniper EX4300", physical: "Rack 6 - Slot A", config: "Config-F", status: "Maintenance" },
  { id: "SW-3501", model: "Juniper QFX5120", physical: "Rack 7 - Slot A", config: "Config-A", status: "Online" },
  { id: "SW-5001", model: "HPE Aruba 2930", physical: "Rack 8 - Slot A", config: "Config-B", status: "Offline" },
  { id: "SW-5501", model: "HPE Aruba 6300", physical: "Rack 9 - Slot A", config: "Config-C", status: "Online" },
  { id: "SW-6001", model: "Dell PowerSwitch S5248", physical: "Rack 10 - Slot A", config: "Config-D", status: "Online" },
  { id: "SW-1002", model: "Cisco 3850", physical: "Rack 11 - Slot A", config: "Config-E", status: "Offline" },
  { id: "SW-4002", model: "Cisco 9300", physical: "Rack 12 - Slot A", config: "Config-F", status: "Online" },
  { id: "SW-4502", model: "Cisco 9500", physical: "Rack 1 - Slot B", config: "Config-A", status: "Online" },
  { id: "SW-2002", model: "Arista 7050", physical: "Rack 2 - Slot B", config: "Config-B", status: "Maintenance" },
  { id: "SW-2502", model: "Arista 7280", physical: "Rack 3 - Slot B", config: "Config-C", status: "Online" },
  { id: "SW-3002", model: "Juniper EX4300", physical: "Rack 4 - Slot B", config: "Config-D", status: "Online" },
  { id: "SW-3502", model: "Juniper QFX5120", physical: "Rack 5 - Slot B", config: "Config-E", status: "Online" },
  { id: "SW-5002", model: "HPE Aruba 2930", physical: "Rack 6 - Slot B", config: "Config-F", status: "Online" },
  { id: "SW-5502", model: "HPE Aruba 6300", physical: "Rack 7 - Slot B", config: "Config-A", status: "Offline" },
  { id: "SW-6002", model: "Dell PowerSwitch S5248", physical: "Rack 8 - Slot B", config: "Config-B", status: "Online" },
  { id: "SW-1003", model: "Cisco 3850", physical: "Rack 9 - Slot B", config: "Config-C", status: "Online" },
  { id: "SW-4003", model: "Cisco 9300", physical: "Rack 10 - Slot B", config: "Config-D", status: "Maintenance" },
  { id: "SW-4503", model: "Cisco 9500", physical: "Rack 11 - Slot B", config: "Config-E", status: "Online" },
  { id: "SW-2003", model: "Arista 7050", physical: "Rack 12 - Slot B", config: "Config-F", status: "Online" },
  { id: "SW-2503", model: "Arista 7280", physical: "Rack 1 - Slot C", config: "Config-A", status: "Maintenance" },
  { id: "SW-3003", model: "Juniper EX4300", physical: "Rack 2 - Slot C", config: "Config-B", status: "Online" },
  { id: "SW-3503", model: "Juniper QFX5120", physical: "Rack 3 - Slot C", config: "Config-C", status: "Offline" },
  { id: "SW-5003", model: "HPE Aruba 2930", physical: "Rack 4 - Slot C", config: "Config-D", status: "Online" },
  { id: "SW-5503", model: "HPE Aruba 6300", physical: "Rack 5 - Slot C", config: "Config-E", status: "Online" },
  { id: "SW-6003", model: "Dell PowerSwitch S5248", physical: "Rack 6 - Slot C", config: "Config-F", status: "Offline" },
  { id: "SW-1004", model: "Cisco 3850", physical: "Rack 7 - Slot C", config: "Config-A", status: "Online" },
  { id: "SW-4004", model: "Cisco 9300", physical: "Rack 8 - Slot C", config: "Config-B", status: "Online" },
  { id: "SW-4504", model: "Cisco 9500", physical: "Rack 9 - Slot C", config: "Config-C", status: "Maintenance" },
  { id: "SW-2004", model: "Arista 7050", physical: "Rack 10 - Slot C", config: "Config-D", status: "Online" },
  { id: "SW-2504", model: "Arista 7280", physical: "Rack 11 - Slot C", config: "Config-E", status: "Online" },
  { id: "SW-3004", model: "Juniper EX4300", physical: "Rack 12 - Slot C", config: "Config-F", status: "Online" },
  { id: "SW-3504", model: "Juniper QFX5120", physical: "Rack 1 - Slot D", config: "Config-A", status: "Online" },
  { id: "SW-5004", model: "HPE Aruba 2930", physical: "Rack 2 - Slot D", config: "Config-B", status: "Offline" },
  { id: "SW-5504", model: "HPE Aruba 6300", physical: "Rack 3 - Slot D", config: "Config-C", status: "Online" },
  { id: "SW-6004", model: "Dell PowerSwitch S5248", physical: "Rack 4 - Slot D", config: "Config-D", status: "Online" },
  { id: "SW-1005", model: "Cisco 3850", physical: "Rack 5 - Slot D", config: "Config-E", status: "Maintenance" },
  { id: "SW-4005", model: "Cisco 9300", physical: "Rack 6 - Slot D", config: "Config-F", status: "Online" },
  { id: "SW-4505", model: "Cisco 9500", physical: "Rack 7 - Slot D", config: "Config-A", status: "Online" },
  { id: "SW-2005", model: "Arista 7050", physical: "Rack 8 - Slot D", config: "Config-B", status: "Online" },
  { id: "SW-2505", model: "Arista 7280", physical: "Rack 9 - Slot D", config: "Config-C", status: "Online" },
  { id: "SW-3005", model: "Juniper EX4300", physical: "Rack 10 - Slot D", config: "Config-D", status: "Offline" },
  { id: "SW-3505", model: "Juniper QFX5120", physical: "Rack 11 - Slot D", config: "Config-E", status: "Online" },
  { id: "SW-5005", model: "HPE Aruba 2930", physical: "Rack 12 - Slot D", config: "Config-F", status: "Online" },
  { id: "SW-5505", model: "HPE Aruba 6300", physical: "Rack 1 - Slot A", config: "Config-A", status: "Offline" },
  { id: "SW-6005", model: "Dell PowerSwitch S5248", physical: "Rack 2 - Slot A", config: "Config-B", status: "Online" },
  { id: "SW-1006", model: "Cisco 3850", physical: "Rack 3 - Slot A", config: "Config-C", status: "Online" },
  { id: "SW-4006", model: "Cisco 9300", physical: "Rack 4 - Slot A", config: "Config-D", status: "Maintenance" },
  { id: "SW-4506", model: "Cisco 9500", physical: "Rack 5 - Slot A", config: "Config-E", status: "Online" },
  { id: "SW-2006", model: "Arista 7050", physical: "Rack 6 - Slot A", config: "Config-F", status: "Offline" },
  { id: "SW-2506", model: "Arista 7280", physical: "Rack 7 - Slot A", config: "Config-A", status: "Online" },
  { id: "SW-3006", model: "Juniper EX4300", physical: "Rack 8 - Slot A", config: "Config-B", status: "Online" },
  { id: "SW-3506", model: "Juniper QFX5120", physical: "Rack 9 - Slot A", config: "Config-C", status: "Offline" },
  { id: "SW-5006", model: "HPE Aruba 2930", physical: "Rack 10 - Slot A", config: "Config-D", status: "Online" },
  { id: "SW-5506", model: "HPE Aruba 6300", physical: "Rack 11 - Slot A", config: "Config-E", status: "Online" },
  { id: "SW-6006", model: "Dell PowerSwitch S5248", physical: "Rack 12 - Slot A", config: "Config-F", status: "Maintenance" },
  { id: "SW-1007", model: "Cisco 3850", physical: "Rack 1 - Slot B", config: "Config-A", status: "Online" },
  { id: "SW-4007", model: "Cisco 9300", physical: "Rack 2 - Slot B", config: "Config-B", status: "Online" },
  { id: "SW-4507", model: "Cisco 9500", physical: "Rack 3 - Slot B", config: "Config-C", status: "Online" },
  { id: "SW-2007", model: "Arista 7050", physical: "Rack 4 - Slot B", config: "Config-D", status: "Online" },
].map((d) => ({ ...d, updatedAt: new Date().toISOString() }));

function generateMetricPoints() {
  const points = [];
  const now = Date.now();
  for (let i = 60; i >= 0; i--) {
    const t = new Date(now - i * 60 * 1000).toISOString();
    const base = 40 + 15 * Math.sin(i / 6);
    const median = Math.round(base + (Math.random() * 4 - 2));
    const min = Math.round(median - (5 + Math.random() * 5));
    const max = Math.round(median + (5 + Math.random() * 5));
    points.push({ t, min, max, median });
  }
  return points;
}

async function run() {
  await seedDevicesIfEmpty(deviceSeed);
  await seedMetricsIfEmpty("cluster-a", generateMetricPoints);
  await seedMetricsIfEmpty("cluster-b", generateMetricPoints);
  console.log("Seed complete.");
  const redis = await getRedisClient();
  if (redis.quit) await redis.quit();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
