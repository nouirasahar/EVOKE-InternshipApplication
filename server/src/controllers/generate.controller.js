import Project from "../models/Project.js";
import { generateDsl } from "../ai/agents/dsl.agent.js";
import { generateFrontendFiles } from "../ai/agents/frontend.agent.js";
import { generateBackendFiles } from "../ai/agents/backend.agent.js";
import { generateDatabaseFiles } from "../ai/agents/database.agent.js";
import {
  validateGeneratedProject,
  applyValidationFixes,
} from "../ai/agents/validation.agent.js";
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
  const generatedFilesByPath = new Map(
    generatedFiles.map((file) => [file.path, file])
  );

  const mergedFiles = scaffoldFiles.map((file) => {
    return generatedFilesByPath.get(file.path) || file;
  });

  const scaffoldPaths = new Set(
    scaffoldFiles.map((file) => file.path)
  );

  for (const file of generatedFiles) {
    if (!scaffoldPaths.has(file.path)) {
      mergedFiles.push(file);
    }
  }

  return mergedFiles.sort((firstFile, secondFile) =>
    firstFile.path.localeCompare(secondFile.path)
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

    const backendFiles = await generateBackendFiles({
      dsl,
    });

    const databaseFiles = await generateDatabaseFiles({
      dsl,
    });

    const generatedProject = await generateProject(dsl);

    const aiGeneratedFiles = [
      ...frontendFiles,
      ...backendFiles,
      ...databaseFiles,
    ];

    const mergedFiles = mergeFiles(
      generatedProject.files,
      aiGeneratedFiles
    );

    const validationResult =
      await validateGeneratedProject({
        dsl,
        files: mergedFiles,
      });

    const finalFiles = applyValidationFixes(
      mergedFiles,
      validationResult.fixedFiles
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
      framework:
        dsl.frontend || selectedFrontend,
      backend:
        dsl.backend || selectedBackend,
      database:
        dsl.database || selectedDatabase,
      status: "generated",
      pipelineStatus:
        validationResult.valid
          ? "completed"
          : "completed_with_warnings",
      generatedPath:
        generatedProject.projectPath,
      files: finalFiles,
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
          name: "Backend Agent",
          status: "completed",
          progress: 100,
          logs: [
            `Generated ${backendFiles.length} backend files using ${
              dsl.backend || selectedBackend
            }.`,
          ],
          output: {
            filesCount: backendFiles.length,
            files: backendFiles.map(
              (file) => file.path
            ),
          },
        },
        {
          name: "Database Agent",
          status: "completed",
          progress: 100,
          logs: [
            `Generated ${databaseFiles.length} database files using ${
              dsl.database || selectedDatabase
            }.`,
          ],
          output: {
            filesCount: databaseFiles.length,
            files: databaseFiles.map(
              (file) => file.path
            ),
          },
        },
        {
          name: "Validation Agent",
          status: validationResult.valid
            ? "completed"
            : "warning",
          progress: 100,
          logs: [
            validationResult.summary,
            `Validation score: ${validationResult.score}/100`,
            `Issues detected: ${validationResult.issues.length}`,
            `Files corrected: ${validationResult.fixedFiles.length}`,
          ],
          output: {
            score: validationResult.score,
            valid: validationResult.valid,
            issues: validationResult.issues,
            correctedFiles:
              validationResult.fixedFiles.map(
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
            "Frontend, backend, and database files merged with the scaffold.",
            "Validation corrections applied before persistence.",
          ],
          output: {
            projectName:
              generatedProject.projectName,
            projectPath:
              generatedProject.projectPath,
            scaffoldFilesCount:
              generatedProject.files.length,
            frontendFilesCount:
              frontendFiles.length,
            backendFilesCount:
              backendFiles.length,
            databaseFilesCount:
              databaseFiles.length,
            correctedFilesCount:
              validationResult.fixedFiles.length,
            validationScore:
              validationResult.score,
            finalFilesCount:
              finalFiles.length,
          },
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message:
        "Application generated, validated, and saved successfully.",
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