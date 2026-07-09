import express from "express";
import { generateApplication } from "../controllers/generate.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, generateApplication);

export default router;