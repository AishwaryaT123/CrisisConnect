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