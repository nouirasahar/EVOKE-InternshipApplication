import {
  generateDsl,
} from "../agents/dsl.agent.js";

import {
  generateFrontendFiles,
} from "../agents/frontend.agent.js";

import {
  generateBackendFiles,
} from "../agents/backend.agent.js";

import {
  generateDatabaseFiles,
} from "../agents/database.agent.js";

import {
  applyValidationFixes,
  validateGeneratedProject,
} from "../agents/validation.agent.js";

import {
  generateProject,
} from "../../services/generator.service.js";

import {
  createExecutionTracker,
} from "./execution-tracker.js";

import {
  executeWithProviderFallback,
} from "./provider-fallback.js";

const normalizeFilePath = (filePath) =>
  String(filePath || "")
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/");

const normalizeFiles = (files) => {
  if (!Array.isArray(files)) {
    return [];
  }

  return files
    .map((file) => ({
      path: normalizeFilePath(
        file.path
      ),
      content:
        typeof file.content ===
        "string"
          ? file.content
          : "",
      language:
        typeof file.language ===
        "string"
          ? file.language
          : "plaintext",
    }))
    .filter((file) => file.path);
};

const mergeFiles = (
  scaffoldFiles,
  generatedFiles
) => {
  const filesByPath = new Map();

  for (const file of normalizeFiles(
    scaffoldFiles
  )) {
    filesByPath.set(file.path, file);
  }

  /*
   * Agent-generated files override scaffold files.
   */
  for (const file of normalizeFiles(
    generatedFiles
  )) {
    filesByPath.set(file.path, file);
  }

  return Array.from(
    filesByPath.values()
  ).sort((firstFile, secondFile) =>
    firstFile.path.localeCompare(
      secondFile.path
    )
  );
};

const runAiAgent = async ({
  tracker,
  trackerAgentName,
  agentType,
  execute,
}) => {
  return executeWithProviderFallback({
    agentType,
    tracker,
    trackerAgentName,
    retries: 1,
    execute,
  });
};

export const orchestrateGeneration =
  async ({
    prompt,
    projectName,
    frontend = "react-vite",
    backend = "express",
    database = "mongodb",
  }) => {
    const tracker =
      createExecutionTracker();

    /*
     * STEP 1 — DSL
     */
    const dslExecution =
      await tracker.run(
        "DSL Agent",
        async () => {
          return runAiAgent({
            tracker,
            trackerAgentName:
              "DSL Agent",
            agentType: "dsl",

            execute: ({
              provider,
            }) =>
              generateDsl({
                prompt,
                projectName,
                frontend,
                backend,
                database,
                aiProvider: provider,
              }),
          });
        },
        {
          onSuccess: ({
            result,
            providerName,
            fallbackUsed,
          }) => ({
            logs: [
              "Application DSL generated successfully.",
              `Provider: ${providerName}.`,
              fallbackUsed
                ? "Provider fallback was used."
                : "Primary provider completed the request.",
            ],

            output: {
              ...result,
              provider:
                providerName,
              fallbackUsed,
            },
          }),
        }
      );

    const dsl = dslExecution.result;

    /*
     * STEP 2 — Generate the three layers and the
     * local scaffold in parallel.
     */
    const [
      frontendExecution,
      backendExecution,
      databaseExecution,
      generatedProject,
    ] = await Promise.all([
      tracker.run(
        "Frontend Agent",
        async () =>
          runAiAgent({
            tracker,
            trackerAgentName:
              "Frontend Agent",
            agentType: "ui",

            execute: ({
              provider,
            }) =>
              generateFrontendFiles({
                dsl,
                aiProvider:
                  provider,
              }),
          }),
        {
          onSuccess: ({
            result,
            providerName,
            fallbackUsed,
          }) => ({
            logs: [
              `Generated ${result.length} frontend files.`,
              `Provider: ${providerName}.`,
              fallbackUsed
                ? "Provider fallback was used."
                : "Primary provider completed the request.",
            ],

            output: {
              provider:
                providerName,
              fallbackUsed,
              filesCount:
                result.length,
              files: result.map(
                (file) =>
                  file.path
              ),
            },
          }),
        }
      ),

      tracker.run(
        "Backend Agent",
        async () =>
          runAiAgent({
            tracker,
            trackerAgentName:
              "Backend Agent",
            agentType: "backend",

            execute: ({
              provider,
            }) =>
              generateBackendFiles({
                dsl,
                aiProvider:
                  provider,
              }),
          }),
        {
          onSuccess: ({
            result,
            providerName,
            fallbackUsed,
          }) => ({
            logs: [
              `Generated ${result.length} backend files.`,
              `Provider: ${providerName}.`,
              fallbackUsed
                ? "Provider fallback was used."
                : "Primary provider completed the request.",
            ],

            output: {
              provider:
                providerName,
              fallbackUsed,
              filesCount:
                result.length,
              files: result.map(
                (file) =>
                  file.path
              ),
            },
          }),
        }
      ),

      tracker.run(
        "Database Agent",
        async () =>
          runAiAgent({
            tracker,
            trackerAgentName:
              "Database Agent",
            agentType: "database",

            execute: ({
              provider,
            }) =>
              generateDatabaseFiles({
                dsl,
                aiProvider:
                  provider,
              }),
          }),
        {
          onSuccess: ({
            result,
            providerName,
            fallbackUsed,
          }) => ({
            logs: [
              `Generated ${result.length} database files.`,
              `Provider: ${providerName}.`,
              fallbackUsed
                ? "Provider fallback was used."
                : "Primary provider completed the request.",
            ],

            output: {
              provider:
                providerName,
              fallbackUsed,
              filesCount:
                result.length,
              files: result.map(
                (file) =>
                  file.path
              ),
            },
          }),
        }
      ),

      tracker.run(
        "Generator Agent",
        async () =>
          generateProject(dsl),
        {
          onSuccess: (
            result
          ) => ({
            logs: [
              "Base project scaffold generated.",
            ],

            output: {
              projectName:
                result.projectName,
              projectPath:
                result.projectPath,
              filesCount:
                result.files
                  ?.length || 0,
            },
          }),
        }
      ),
    ]);

    const frontendFiles =
      frontendExecution.result;

    const backendFiles =
      backendExecution.result;

    const databaseFiles =
      databaseExecution.result;

    const generatedFiles = [
      ...frontendFiles,
      ...backendFiles,
      ...databaseFiles,
    ];

    /*
     * STEP 3 — Merge.
     */
    const mergedFiles =
      mergeFiles(
        generatedProject.files,
        generatedFiles
      );

    /*
     * STEP 4 — Validation.
     */
    const validationExecution =
      await tracker.run(
        "Validation Agent",
        async () =>
          runAiAgent({
            tracker,
            trackerAgentName:
              "Validation Agent",
            agentType:
              "validation",

            execute: ({
              provider,
            }) =>
              validateGeneratedProject({
                dsl,
                files:
                  mergedFiles,
                aiProvider:
                  provider,
              }),
          }),
        {
          onSuccess: ({
            result,
            providerName,
            fallbackUsed,
          }) => ({
            status:
              result.valid
                ? "completed"
                : "warning",

            logs: [
              result.summary,
              `Validation score: ${result.score}/100.`,
              `Issues: ${
                result.issues
                  ?.length || 0
              }.`,
              `Corrected files: ${
                result.fixedFiles
                  ?.length || 0
              }.`,
              `Provider: ${providerName}.`,
              fallbackUsed
                ? "Provider fallback was used."
                : "Primary provider completed the request.",
            ],

            output: {
              provider:
                providerName,
              fallbackUsed,
              valid:
                result.valid,
              score:
                result.score,
              issues:
                result.issues || [],
              metrics:
                result.metrics || {},
              correctedFiles:
                (
                  result.fixedFiles ||
                  []
                ).map(
                  (file) =>
                    file.path
                ),
            },
          }),
        }
      );

    const validationResult =
      validationExecution.result;

    /*
     * STEP 5 — Apply AI fixes.
     */
    const finalFiles =
      applyValidationFixes(
        mergedFiles,
        validationResult.fixedFiles ||
          []
      );

    return {
      dsl,

      generatedPath:
        generatedProject.projectPath,

      generatedProject,

      files: finalFiles,

      validationResult,

      pipelineStatus:
        validationResult.valid
          ? "completed"
          : "completed_with_warnings",

      agents:
        tracker.getAgentRecords(),

      metrics: {
        ...tracker.getPipelineMetrics(),

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

        finalFilesCount:
          finalFiles.length,

        validationScore:
          validationResult.score,
      },
    };
  };