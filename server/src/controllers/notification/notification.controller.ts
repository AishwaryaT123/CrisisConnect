import { Request, Response } from "express";
import { getUserNotifications, markNotificationAsRead, getUnreadNotificationCount, } from "../../services/notification/notification.service";

export const getMyNotificationsController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });

            return;
        }

        const notifications = await getUserNotifications(userId);

        res.status(200).json({
            success: true,
            message: "Notifications retrieved successfully",
            data: notifications,
        });
    } catch (error) {
        console.error("Get notifications error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve notifications",
        });
    }
};


export const markNotificationAsReadController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });

            return;
        }

        if (!id || Array.isArray(id)) {
            res.status(400).json({
                success: false,
                message: "Valid notification ID is required",
            });

            return;
        }

        const result = await markNotificationAsRead(
            userId,
            id
        );

        if ("error" in result) {
            res.status(404).json({
                success: false,
                message: "Notification not found",
            });

            return;
        }

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: result.notification,
        });
    } catch (error) {
        console.error(
            "Mark notification as read error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to mark notification as read",
        });
    }
};

export const getUnreadNotificationCountController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });

            return;
        }

        const count = await getUnreadNotificationCount(userId);

        res.status(200).json({
            success: true,
            message: "Unread notification count retrieved successfully",
            data: {
                count,
            },
        });
    } catch (error) {
        console.error(
            "Get unread notification count error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to retrieve unread notification count",
        });
    }
};