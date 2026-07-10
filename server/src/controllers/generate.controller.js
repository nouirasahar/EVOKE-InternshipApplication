import Project from "../models/Project.js";
import { generateDsl } from "../ai/agents/dsl.agent.js";
import { generateFrontendFiles } from "../ai/agents/frontend.agent.js";
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

const mergeFiles = (scaffoldFiles, generatedFiles) => {
  const generatedPaths = new Set(
    generatedFiles.map((file) => file.path)
  );

  return [
    ...scaffoldFiles.filter(
      (file) => !generatedPaths.has(file.path)
    ),
    ...generatedFiles,
  ];
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
        message:
          "Prompt is required and must contain at least 5 characters.",
      });
    }

    const selectedFrontend = frontend || "react-vite";
    const selectedBackend = backend || "express";
    const selectedDatabase = database || "mongodb";

    const dsl = await generateDsl({
      prompt: finalPrompt,
      projectName,
      frontend: selectedFrontend,
      backend: selectedBackend,
      database: selectedDatabase,
    });

    const frontendFiles = await generateFrontendFiles({
      dsl,
    });

    const generatedProject = await generateProject(dsl);

    const mergedFiles = mergeFiles(
      generatedProject.files,
      frontendFiles
    );

    const project = await Project.create({
      owner: req.user.id,
      title: buildProjectTitle(
        projectName,
        dsl,
        finalPrompt
      ),
      prompt: finalPrompt,
      transcript: transcript || null,
      source: source || "text",
      language: language || null,
      dsl,
      framework: dsl.frontend || selectedFrontend,
      backend: dsl.backend || selectedBackend,
      database: dsl.database || selectedDatabase,
      status: "generated",
      pipelineStatus: "completed",
      generatedPath: generatedProject.projectPath,
      files: mergedFiles,
      agents: [
        {
          name: "DSL Agent",
          status: "completed",
          progress: 100,
          logs: [
            "DSL generated successfully from the user prompt.",
          ],
          output: dsl,
        },
        {
          name: "Frontend Agent",
          status: "completed",
          progress: 100,
          logs: [
            `Generated ${frontendFiles.length} frontend files using ${
              dsl.frontend || selectedFrontend
            }.`,
          ],
          output: {
            filesCount: frontendFiles.length,
            files: frontendFiles.map(
              (file) => file.path
            ),
          },
        },
        {
          name: "Generator Agent",
          status: "completed",
          progress: 100,
          logs: [
            "Base project scaffold generated successfully.",
            "Frontend agent files merged with scaffold files.",
          ],
          output: {
            projectName:
              generatedProject.projectName,
            projectPath:
              generatedProject.projectPath,
            scaffoldFilesCount:
              generatedProject.files.length,
            finalFilesCount: mergedFiles.length,
          },
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message:
        "Application generated and saved successfully.",
      project,
    });
  } catch (error) {
    console.error("===== GENERATE ERROR =====");
    console.error(error);
    console.error("==========================");

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};