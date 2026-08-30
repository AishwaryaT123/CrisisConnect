import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { UserRole } from "../../generated/prisma/client";
import { createResponderController, getMyResponderProfileController,   updateResponderAvailabilityController, } from "../../controllers/responder/responder.controller";
import { updateLocationController } from "../../controllers/responder/location.controller";
import { getNearbyRespondersController } from "../../controllers/responder/nearby.controller";
import { acceptAssignmentController, markAssignmentEnRouteController, markAssignmentArrivedController, resolveAssignmentController, } from "../../controllers/responder/assignment.controller";

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

router.patch(
  "/location",
  authenticate,
  updateLocationController
);

router.get(
  "/nearby",
  authenticate,
  getNearbyRespondersController
);

router.patch(
  "/assignments/:assignmentId/accept",
  authenticate,
  acceptAssignmentController
);

router.patch(
  "/assignments/:assignmentId/en-route",
  authenticate,
  markAssignmentEnRouteController
);

router.patch(
  "/assignments/:assignmentId/arrived",
  authenticate,
  markAssignmentArrivedController
);

router.patch(
  "/assignments/:assignmentId/resolve",
  authenticate,
  resolveAssignmentController
);

export default router;