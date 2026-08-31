import { prisma } from "../../config/database";

interface CreateNotificationInput {
    userId: string;
    type: string;
    message: string;
}

export const createNotification = async ({
    userId,
    type,
    message,
}: CreateNotificationInput) => {
    const notification = await prisma.notification.create({
        data: {
            userId,
            type,
            message,
        },
    });

    return notification;
};

export const getUserNotifications = async (
    userId: string
) => {
    const notifications = await prisma.notification.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return notifications;
};


export const markNotificationAsRead = async (
    userId: string,
    notificationId: string
) => {
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId,
        },
    });

    if (!notification) {
        return {
            error: "NOTIFICATION_NOT_FOUND",
        };
    }

    if (notification.read) {
        return {
            notification,
        };
    }

    const updatedNotification =
        await prisma.notification.update({
            where: {
                id: notificationId,
            },
            data: {
                read: true,
            },
        });

    return {
        notification: updatedNotification,
    };
};

export const getUnreadNotificationCount = async (
    userId: string
) => {
    const count = await prisma.notification.count({
        where: {
            userId,
            read: false,
        },
    });

    return count;
};