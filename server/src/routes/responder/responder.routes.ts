import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { createResponderController, getMyResponderProfileController, } from "../../controllers/responder/responder.controller";

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

export default router;