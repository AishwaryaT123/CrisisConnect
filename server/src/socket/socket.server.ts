import { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server;

export const initializeSocket = (
    httpServer: HttpServer
) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
        },
    });

    io.on("connection", (socket) => {
        console.log(
            `WebSocket connected: ${socket.id}`
        );

        socket.on("join-user-room", (userId: string) => {
            socket.join(`user:${userId}`);

            console.log(
                `User ${userId} joined notification room`
            );
        });

        socket.on("disconnect", () => {
            console.log(
                `WebSocket disconnected: ${socket.id}`
            );
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error(
            "Socket.IO has not been initialized"
        );
    }

    return io;
};