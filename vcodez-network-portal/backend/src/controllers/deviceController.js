import { listDevices, getDevice, upsertDevice, updateDeviceStatus } from "../models/deviceModel.js";

export async function getDevices(req, res, next) {
  try {
    const { search, status } = req.query;
    let devices = await listDevices();

    if (search) {
      const q = search.toLowerCase();
      devices = devices.filter(
        (d) =>
          d.model?.toLowerCase().includes(q) ||
          d.id?.toLowerCase().includes(q)
      );
    }

    if (status && status !== "All") {
      devices = devices.filter((d) => d.status === status);
    }

    res.json({ devices });
  } catch (err) {
    next(err);
  }
}

export async function createDevice(req, res, next) {
  try {
    const { id, model, physical, config, status } = req.body;
    if (!id || !model) {
      return res.status(400).json({ message: "id and model are required." });
    }
    const existing = await getDevice(id);
    if (existing) {
      return res.status(409).json({ message: `Device with id ${id} already exists.` });
    }
    const device = await upsertDevice({
      id,
      model,
      physical: physical || "",
      config: config || "",
      status: status || "Offline",
      updatedAt: new Date().toISOString(),
    });
    res.status(201).json({ device });
  } catch (err) {
    next(err);
  }
}

export async function patchDeviceStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["Online", "Offline", "Maintenance"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(", ")}` });
    }
    const updated = await updateDeviceStatus(id, status);
    if (!updated) return res.status(404).json({ message: "Device not found." });
    res.json({ device: updated });
  } catch (err) {
    next(err);
  }
}
