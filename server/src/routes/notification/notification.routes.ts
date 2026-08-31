import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import {
    getMyNotificationsController,  markNotificationAsReadController,  getUnreadNotificationCountController,
} from "../../controllers/notification/notification.controller";

const router = Router();

router.get(
    "/",
    authenticate,
    getMyNotificationsController
);

router.get(
  "/unread-count",
  authenticate,
  getUnreadNotificationCountController
);

router.patch(
  "/:id/read",
  authenticate,
  markNotificationAsReadController
);

export default router;
