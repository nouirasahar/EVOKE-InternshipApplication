import express from "express";
import { testAIProvider } from "../controllers/ai-test.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, testAIProvider);

export default router;