import { Router } from "express";
import { register, login, } from "../../controllers/auth/auth.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { UserRole } from "../../generated/prisma/client";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authenticated user",
    user: req.user,
  });
});

router.get(
  "/citizen",
  authenticate,
  authorizeRoles(UserRole.CITIZEN),
  (req, res) => {
    res.json({
      success: true,
      message: "Citizen access granted successfully.",
      user: req.user,
    });
  }
);

router.get(
  "/admin",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin access granted successfully.",
      user: req.user,
    });
  }
);

export default router;
