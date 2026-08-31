import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth/auth.routes";
import emergencyRoutes from "./routes/emergency/emergency.routes";
import responderRoutes from "./routes/responder/responder.routes";
import adminRoutes from "./routes/admin/admin.routes";
import notificationRoutes from "./routes/notification/notification.routes";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/emergencies", emergencyRoutes);
app.use("/api/responders", responderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});