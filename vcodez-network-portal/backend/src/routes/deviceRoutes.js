import { Router } from "express";
import { getDevices, createDevice, patchDeviceStatus } from "../controllers/deviceController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", getDevices);
router.post("/", createDevice);
router.patch("/:id/status", patchDeviceStatus);

export default router;
