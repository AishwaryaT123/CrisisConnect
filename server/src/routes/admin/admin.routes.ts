import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { verifyResponderController } from "../../controllers/admin/admin.controller";

const router = Router();

router.patch(
  "/responders/:id/verify",
  authenticate,
  verifyResponderController
);

export default router;