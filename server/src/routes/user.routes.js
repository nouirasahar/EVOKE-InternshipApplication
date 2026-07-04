import express from "express";
import { updateMe, deleteMe } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.patch("/me", protect, updateMe);
router.delete("/me", protect, deleteMe);

export default router;