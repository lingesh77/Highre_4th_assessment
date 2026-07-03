import { Router } from "express";
import { sendClusterAlert, getAlertHistory } from "../controllers/alertController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/cluster-issue", requireAuth, sendClusterAlert);
router.get("/", requireAuth, getAlertHistory);

export default router;
