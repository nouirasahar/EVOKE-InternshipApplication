import express from "express";
import { getMyProjects } from "../controllers/project.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getMyProjects);

export default router;