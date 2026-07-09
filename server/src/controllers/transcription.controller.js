import fs from "fs-extra";
import { transcribeAudio } from "../services/transcription.service.js";

export const transcribeVoice = async (req, res) => {
  try {
    console.log("Transcription request received.");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required.",
      });
    }

    console.log("Audio file received:", {
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    const text = await transcribeAudio(req.file.path);

    await fs.remove(req.file.path);

    return res.status(200).json({
      success: true,
      text,
    });
  } catch (error) {
    console.error("Transcription error:", error);

    if (req.file?.path) {
      await fs.remove(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: "Transcription failed.",
      error: error.message,
    });
  }
};