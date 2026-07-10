import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectRoutes from "./routes/project.routes.js";
import { connectDB } from "./config/database.js";
import generateRoutes from "./routes/generate.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import transcriptionRoutes from "./routes/transcription.routes.js";
import aiTestRoutes from "./routes/ai-test.routes.js";
dotenv.config();

connectDB();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "EVOKE Backend is running 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai-test", aiTestRoutes);

app.use("/api/transcription", transcriptionRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});