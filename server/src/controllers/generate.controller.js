import Project from "../models/Project.js";
import { createDslFromPrompt } from "../services/dsl.service.js";
import { generateProject } from "../services/generator.service.js";

const buildProjectTitle = (dsl, prompt) => {
  return (
    dsl?.app?.name ||
    dsl?.projectName ||
    prompt.slice(0, 50) ||
    "Untitled EVOKE Project"
  );
};

export const generateApplication = async (req, res) => {
  try {
    const { prompt, transcript, source, language } = req.body;

    const finalPrompt = prompt || transcript;

    if (!finalPrompt || finalPrompt.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required and must contain at least 5 characters.",
      });
    }

    const dsl = createDslFromPrompt(finalPrompt);

    const generatedProject = await generateProject(dsl);

    const project = await Project.create({
      owner: req.user.id,
      title: buildProjectTitle(dsl, finalPrompt),
      prompt: finalPrompt,
      transcript: transcript || null,
      source: source || "text",
      language: language || null,
      dsl,
      framework: dsl?.frontend || "react-vite",
      backend: dsl?.backend || "express",
      database: dsl?.database || "mongodb",
      status: "generated",
      pipelineStatus: "completed",
      generatedPath: generatedProject.projectPath,
      files: generatedProject.files.map((filePath) => ({
        path: filePath,
        type: "file",
        language: null,
        content: "",
      })),
      agents: [
        {
          name: "DSL Agent",
          status: "completed",
          progress: 100,
          logs: ["DSL generated from user prompt."],
          output: dsl,
        },
        {
          name: "Generator Agent",
          status: "completed",
          progress: 100,
          logs: ["Project scaffold generated successfully."],
          output: generatedProject,
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Application generated and saved successfully.",
      project: {
        _id: project._id,
       title: project.title,
       prompt: project.prompt,
       status: project.status,
       framework: project.framework,
       generatedPath: project.generatedPath,
       createdAt: project.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};