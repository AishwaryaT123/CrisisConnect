import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { createResponderController, getMyResponderProfileController,   updateResponderAvailabilityController, } from "../../controllers/responder/responder.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  createResponderController
);

router.get(
  "/me",
  authenticate,
  getMyResponderProfileController
);

router.patch(
  "/availability",
  authenticate,
  updateResponderAvailabilityController
);

export default router;