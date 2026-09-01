import { useEffect } from "react";
import { socket } from "../services/socket";

interface Notification {
    id: string;
    userId: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export const useNotifications = (
    userId: string | null,
    onNotification: (notification: Notification) => void
) => {
    useEffect(() => {
        if (!userId) {
            return;
        }

        socket.connect();

        socket.emit("join-user-room", userId);

        const handleNotification = (
            notification: Notification
        ) => {
            console.log(
                "🔔 New notification:",
                notification
            );

            onNotification(notification);
        };

        socket.on(
            "notification",
            handleNotification
        );

        return () => {
            socket.off(
                "notification",
                handleNotification
            );

            socket.disconnect();
        };
    }, [userId, onNotification]);
};