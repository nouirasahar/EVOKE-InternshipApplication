import Project from "../models/Project.js";
import { generateDsl } from "../ai/agents/dsl.agent.js";
import { generateProject } from "../services/generator.service.js";

const buildProjectTitle = (projectName, dsl, prompt) => {
  return (
    projectName?.trim() ||
    dsl?.app?.name ||
    dsl?.projectName ||
    prompt.slice(0, 50) ||
    "Untitled EVOKE Project"
  );
};

export const generateApplication = async (req, res) => {
  try {
    const {
      projectName,
      prompt,
      transcript,
      source,
      language,
      frontend,
      backend,
      database,
    } = req.body;

    const finalPrompt = prompt || transcript;

    if (!finalPrompt || finalPrompt.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required and must contain at least 5 characters.",
      });
    }

  const dsl = await generateDsl({
    prompt: finalPrompt,
    projectName,
    frontend: frontend || "react-vite",
    backend: backend || "express",
    database: database || "mongodb",
    });

    const generatedProject = await generateProject(dsl);

    const project = await Project.create({
      owner: req.user.id,
      title: buildProjectTitle(projectName, dsl, finalPrompt),
      prompt: finalPrompt,
      transcript: transcript || null,
      source: source || "text",
      language: language || null,
      dsl,
      framework: dsl.frontend,
      backend: dsl.backend,
      database: dsl.database,
      status: "generated",
      pipelineStatus: "completed",
      generatedPath: generatedProject.projectPath,
      files: generatedProject.files,
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
          output: {
            projectName: generatedProject.projectName,
            projectPath: generatedProject.projectPath,
            filesCount: generatedProject.files.length,
          },
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Application generated and saved successfully.",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};