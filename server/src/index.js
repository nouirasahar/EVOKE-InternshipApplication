import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectRoutes from "./routes/project.routes.js";
import { connectDB } from "./config/database.js";
import generateRoutes from "./routes/generate.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "EVOKE Backend is running 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});