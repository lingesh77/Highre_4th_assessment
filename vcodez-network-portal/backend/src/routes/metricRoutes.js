import { Router } from "express";
import { getSeries, addPoint } from "../controllers/metricController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/:cluster", getSeries);
router.post("/:cluster", addPoint);

export default router;
