import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { UserRole } from "../../generated/prisma/client";
import { verifyResponderController } from "../../controllers/admin/admin.controller";

const router = Router();

router.patch(
  "/responders/:id/verify",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  verifyResponderController
);

export default router;