import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { createEmergencyController } from "../../controllers/emergency/emergency.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  createEmergencyController
);

export default router;