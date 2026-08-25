import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth/auth.routes";
import emergencyRoutes from "./routes/emergency/emergency.routes";
import responderRoutes from "./routes/responder/responder.routes";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/emergencies", emergencyRoutes);
app.use("/api/responders", responderRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});