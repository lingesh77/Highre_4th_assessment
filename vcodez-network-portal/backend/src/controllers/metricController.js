import { getMetricSeries, pushMetricPoint } from "../models/metricModel.js";

export async function getSeries(req, res, next) {
  try {
    const { cluster = "cluster-a" } = req.params;
    const limit = Number(req.query.limit) || 200;
    const points = await getMetricSeries(cluster, limit);
    res.json({ cluster, points });
  } catch (err) {
    next(err);
  }
}

export async function addPoint(req, res, next) {
  try {
    const { cluster = "cluster-a" } = req.params;
    const { min, max, median, t } = req.body;
    if ([min, max, median].some((v) => typeof v !== "number")) {
      return res.status(400).json({ message: "min, max, median must be numbers." });
    }
    const point = { t: t || new Date().toISOString(), min, max, median };
    await pushMetricPoint(cluster, point);
    res.status(201).json({ point });
  } catch (err) {
    next(err);
  }
}
