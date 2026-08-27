import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { UserRole } from "../../generated/prisma/client";
import { createResponderController, getMyResponderProfileController,   updateResponderAvailabilityController, } from "../../controllers/responder/responder.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.RESPONDER),
  createResponderController
);

router.get(
  "/me",
  authenticate,
  authorizeRoles(UserRole.RESPONDER),
  getMyResponderProfileController
);

router.patch(
  "/availability",
  authenticate,
  authorizeRoles(UserRole.RESPONDER),
  updateResponderAvailabilityController
);

export default router;