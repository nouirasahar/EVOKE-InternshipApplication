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

const DEFAULT_FRONTEND = "react-vite";
const DEFAULT_BACKEND = "express";
const DEFAULT_DATABASE = "mongodb";

const buildProjectTitle = (
  projectName,
  dsl,
  prompt
) => {
  return (
    projectName?.trim() ||
    dsl?.app?.name ||
    dsl?.projectName ||
    prompt.slice(0, 50).trim() ||
    "Untitled EVOKE Project"
  );
};

const normalizeFilePath = (filePath) => {
  return String(filePath || "")
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/");
};

const normalizeFiles = (files) => {
  if (!Array.isArray(files)) {
    return [];
  }

  return files.map((file) => ({
    path: normalizeFilePath(file.path),
    content:
      typeof file.content === "string"
        ? file.content
        : "",
    language:
      typeof file.language === "string"
        ? file.language
        : "plaintext",
  }));
};

const mergeFiles = (
  scaffoldFiles,
  generatedFiles
) => {
  const filesByPath = new Map();

  for (const file of normalizeFiles(scaffoldFiles)) {
    if (!file.path) {
      continue;
    }

    filesByPath.set(file.path, file);
  }

  /*
   * AI-generated files override scaffold files when both
   * use the same path.
   */
  for (const file of normalizeFiles(generatedFiles)) {
    if (!file.path) {
      continue;
    }

    filesByPath.set(file.path, file);
  }

  return [...filesByPath.values()].sort(
    (firstFile, secondFile) =>
      firstFile.path.localeCompare(
        secondFile.path
      )
  );
};

const measureExecution = async (callback) => {
  const startedAt = Date.now();
  const result = await callback();

  return {
    result,
    executionTimeMs:
      Date.now() - startedAt,
  };
};

export const generateApplication = async (
  req,
  res
) => {
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

    const finalPrompt = String(
      prompt || transcript || ""
    ).trim();

    if (finalPrompt.length < 5) {
      return res.status(400).json({
        success: false,
        message:
          "Prompt is required and must contain at least 5 characters.",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication is required to generate a project.",
      });
    }

    const selectedFrontend =
      frontend || DEFAULT_FRONTEND;

    const selectedBackend =
      backend || DEFAULT_BACKEND;

    const selectedDatabase =
      database || DEFAULT_DATABASE;

    /*
     * Step 1: Generate the application blueprint.
     */
    const dslExecution =
      await measureExecution(() =>
        generateDsl({
          prompt: finalPrompt,
          projectName,
          frontend: selectedFrontend,
          backend: selectedBackend,
          database: selectedDatabase,
        })
      );

    const dsl = dslExecution.result;

    /*
     * Step 2: Generate independent application layers in parallel.
     *
     * This reduces total generation time because the frontend,
     * backend, and database agents only depend on the DSL.
     */
    const [
      frontendExecution,
      backendExecution,
      databaseExecution,
      scaffoldExecution,
    ] = await Promise.all([
      measureExecution(() =>
        generateFrontendFiles({
          dsl,
        })
      ),

      measureExecution(() =>
        generateBackendFiles({
          dsl,
        })
      ),

      measureExecution(() =>
        generateDatabaseFiles({
          dsl,
        })
      ),

      measureExecution(() =>
        generateProject(dsl)
      ),
    ]);

    const frontendFiles =
      frontendExecution.result;

    const backendFiles =
      backendExecution.result;

    const databaseFiles =
      databaseExecution.result;

    const generatedProject =
      scaffoldExecution.result;

    const aiGeneratedFiles = [
      ...frontendFiles,
      ...backendFiles,
      ...databaseFiles,
    ];

    /*
     * Step 3: Merge scaffold and AI-generated files.
     */
    const mergedFiles = mergeFiles(
      generatedProject.files,
      aiGeneratedFiles
    );

    /*
     * Step 4: Run deterministic and AI-assisted validation.
     */
    const validationExecution =
      await measureExecution(() =>
        validateGeneratedProject({
          dsl,
          files: mergedFiles,
        })
      );

    const validationResult =
      validationExecution.result;

    /*
     * Step 5: Apply targeted validation corrections.
     */
    const finalFiles = applyValidationFixes(
      mergedFiles,
      validationResult.fixedFiles || []
    );

    const pipelineStatus =
      validationResult.valid
        ? "completed"
        : "completed_with_warnings";

    const project = await Project.create({
      owner: req.user.id,

      title: buildProjectTitle(
        projectName,
        dsl,
        finalPrompt
      ),

      prompt: finalPrompt,

      transcript:
        transcript?.trim() || null,

      source:
        source === "voice"
          ? "voice"
          : "text",

      language:
        language || null,

      dsl,

      framework:
        dsl.frontend ||
        selectedFrontend,

      backend:
        dsl.backend ||
        selectedBackend,

      database:
        dsl.database ||
        selectedDatabase,

      status: "generated",

      pipelineStatus,

      generatedPath:
        generatedProject.projectPath,

      files: finalFiles,

      agents: [
        {
          name: "DSL Agent",
          status: "completed",
          progress: 100,
          executionTimeMs:
            dslExecution.executionTimeMs,
          logs: [
            "Application requirements were converted into a structured DSL.",
            `Selected frontend: ${
              dsl.frontend ||
              selectedFrontend
            }.`,
            `Selected backend: ${
              dsl.backend ||
              selectedBackend
            }.`,
            `Selected database: ${
              dsl.database ||
              selectedDatabase
            }.`,
          ],
          output: dsl,
        },

        {
          name: "Frontend Agent",
          status: "completed",
          progress: 100,
          executionTimeMs:
            frontendExecution.executionTimeMs,
          logs: [
            `Generated ${frontendFiles.length} frontend files.`,
            `Provider route: UI.`,
            `Framework: ${
              dsl.frontend ||
              selectedFrontend
            }.`,
          ],
          output: {
            framework:
              dsl.frontend ||
              selectedFrontend,
            filesCount:
              frontendFiles.length,
            files: frontendFiles.map(
              (file) => file.path
            ),
          },
        },

        {
          name: "Backend Agent",
          status: "completed",
          progress: 100,
          executionTimeMs:
            backendExecution.executionTimeMs,
          logs: [
            `Generated ${backendFiles.length} backend files.`,
            `Provider route: BACKEND.`,
            `Framework: ${
              dsl.backend ||
              selectedBackend
            }.`,
          ],
          output: {
            framework:
              dsl.backend ||
              selectedBackend,
            filesCount:
              backendFiles.length,
            files: backendFiles.map(
              (file) => file.path
            ),
          },
        },

        {
          name: "Database Agent",
          status: "completed",
          progress: 100,
          executionTimeMs:
            databaseExecution.executionTimeMs,
          logs: [
            `Generated ${databaseFiles.length} database files.`,
            `Provider route: DATABASE.`,
            `Database: ${
              dsl.database ||
              selectedDatabase
            }.`,
          ],
          output: {
            database:
              dsl.database ||
              selectedDatabase,
            filesCount:
              databaseFiles.length,
            files: databaseFiles.map(
              (file) => file.path
            ),
          },
        },

        {
          name: "Validation Agent",
          status:
            validationResult.valid
              ? "completed"
              : "warning",
          progress: 100,
          executionTimeMs:
            validationExecution.executionTimeMs,
          logs: [
            validationResult.summary,
            `Validation score: ${validationResult.score}/100.`,
            `Total issues: ${
              validationResult.metrics
                ?.totalIssues ??
              validationResult.issues
                ?.length ??
              0
            }.`,
            `Errors: ${
              validationResult.metrics
                ?.errors ?? 0
            }.`,
            `Warnings: ${
              validationResult.metrics
                ?.warnings ?? 0
            }.`,
            `Unresolved errors: ${
              validationResult.metrics
                ?.unresolvedErrors ?? 0
            }.`,
            `Corrected files: ${
              validationResult.metrics
                ?.correctedFiles ??
              validationResult.fixedFiles
                ?.length ??
              0
            }.`,
          ],
          output: {
            valid:
              validationResult.valid,
            score:
              validationResult.score,
            summary:
              validationResult.summary,
            issues:
              validationResult.issues || [],
            metrics:
              validationResult.metrics || {
                totalIssues:
                  validationResult.issues
                    ?.length || 0,
                errors: 0,
                warnings: 0,
                info: 0,
                unresolvedErrors: 0,
                correctedFiles:
                  validationResult
                    .fixedFiles
                    ?.length || 0,
              },
            correctedFiles:
              (
                validationResult.fixedFiles ||
                []
              ).map(
                (file) => file.path
              ),
          },
        },

        {
          name: "Generator Agent",
          status: "completed",
          progress: 100,
          executionTimeMs:
            scaffoldExecution.executionTimeMs,
          logs: [
            "Base project scaffold generated successfully.",
            "Frontend, backend, and database files were merged.",
            "AI-generated files replaced matching scaffold files.",
            "Validation corrections were applied before persistence.",
            `Final project contains ${finalFiles.length} files.`,
          ],
          output: {
            projectName:
              generatedProject.projectName,

            projectPath:
              generatedProject.projectPath,

            scaffoldFilesCount:
              generatedProject.files
                ?.length || 0,

            frontendFilesCount:
              frontendFiles.length,

            backendFilesCount:
              backendFiles.length,

            databaseFilesCount:
              databaseFiles.length,

            mergedFilesCount:
              mergedFiles.length,

            correctedFilesCount:
              validationResult
                .fixedFiles
                ?.length || 0,

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
        validationResult.valid
          ? "Application generated, validated, and saved successfully."
          : "Application generated and saved with validation warnings.",
      project: {
        _id: project._id,
        title: project.title,
        prompt: project.prompt,
        status: project.status,
        pipelineStatus:
          project.pipelineStatus,
        framework: project.framework,
        backend: project.backend,
        database: project.database,
        generatedPath:
          project.generatedPath,
        validation: {
          valid:
            validationResult.valid,
          score:
            validationResult.score,
          issuesCount:
            validationResult.issues
              ?.length || 0,
          correctedFilesCount:
            validationResult.fixedFiles
              ?.length || 0,
        },
        filesCount:
          finalFiles.length,
        createdAt:
          project.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "===== GENERATE ERROR ====="
    );
    console.error(error);
    console.error(
      "=========================="
    );

    const isProviderRateLimit =
      error?.status === 429 ||
      error?.status === 413 ||
      error?.code ===
        "rate_limit_exceeded";

    const isProviderConnectionError =
      error?.name ===
        "APIConnectionError" ||
      error?.cause?.code ===
        "ETIMEDOUT" ||
      error?.message ===
        "Connection error.";

    if (isProviderRateLimit) {
      return res.status(429).json({
        success: false,
        message:
          "The AI provider rate limit was reached. Please wait briefly and retry.",
        error:
          error.message,
      });
    }

    if (isProviderConnectionError) {
      return res.status(503).json({
        success: false,
        message:
          "An AI provider is temporarily unavailable. Please retry shortly.",
        error:
          error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Application generation failed.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown internal server error.",
    });
  }
};