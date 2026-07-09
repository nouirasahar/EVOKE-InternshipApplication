import express from "express";
import multer from "multer";
import { transcribeVoice } from "../controllers/transcription.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/audio/",
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

router.post("/", protect, upload.single("audio"), transcribeVoice);

export default router;