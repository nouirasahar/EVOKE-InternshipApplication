import { createDslFromPrompt } from "../services/dsl.service.js";
import { generateProject } from "../services/generator.service.js";
export const generateApplication = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required and must contain at least 5 characters."
      });
    }

    const dsl = createDslFromPrompt(prompt);

    const projectPath = await generateProject(dsl);

    return res.status(200).json({
      success: true,
      message: "Application generated successfully.",
      projectPath,
      dsl
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message
    });
  }
};