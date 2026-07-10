import express from "express";
import {
  getMyProjects,
  getProjectById,
} from "../controllers/project.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getMyProjects);

router.get("/:id", protect, getProjectById);

export default router;