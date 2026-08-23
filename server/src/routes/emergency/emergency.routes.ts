import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { createEmergencyController,  getMyEmergenciesController, getEmergencyByIdController,  cancelEmergencyController, } from "../../controllers/emergency/emergency.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  createEmergencyController
);

router.get(
  "/my",
  authenticate,
  getMyEmergenciesController
);

router.patch(
  "/:id/cancel",
  authenticate,
  cancelEmergencyController
);

router.get(
  "/:id",
  authenticate,
  getEmergencyByIdController
);



export default router;