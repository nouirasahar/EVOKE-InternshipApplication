import express from "express";
import { generateApplication } from "../controllers/generate.controller.js";

const router = express.Router();

router.post("/", generateApplication);

export default router;