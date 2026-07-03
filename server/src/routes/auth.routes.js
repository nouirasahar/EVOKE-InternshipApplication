import express from "express";
import { signup, login, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { verifyEmail } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/verify/:token", verifyEmail);

export default router;