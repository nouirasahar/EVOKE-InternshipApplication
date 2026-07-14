import Project from "../models/Project.js";

import {
  orchestrateGeneration,
} from "../ai/orchestrator/generation.orchestrator.js";

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

const normalizeSource = (source) => {
  return source === "voice"
    ? "voice"
    : "text";
};

const isRateLimitError = (error) => {
  const status = Number(
    error?.status ||
      error?.response?.status ||
      error?.error?.code
  );

  const code =
    error?.code ||
    error?.cause?.code ||
    error?.error?.code ||
    error?.error?.error?.code;

  const message = String(
    error?.message || ""
  ).toLowerCase();

  return (
    status === 413 ||
    status === 429 ||
    code === "rate_limit_exceeded" ||
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("tokens per minute")
  );
};

const isProviderConnectionError = (error) => {
  const code =
    error?.code ||
    error?.cause?.code ||
    error?.error?.code;

  const message = String(
    error?.message || ""
  ).toLowerCase();

  return (
    error?.name === "APIConnectionError" ||
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "EAI_AGAIN" ||
    code === "ENETUNREACH" ||
    message.includes("connection error") ||
    message.includes("fetch failed") ||
    message.includes("timed out") ||
    message.includes("timeout") ||
    message.includes("temporarily unavailable")
  );
};

const serializeError = (error) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown internal server error.";
  }
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
    } = req.body || {};

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
      String(
        frontend || DEFAULT_FRONTEND
      ).trim();

    const selectedBackend =
      String(
        backend || DEFAULT_BACKEND
      ).trim();

    const selectedDatabase =
      String(
        database || DEFAULT_DATABASE
      ).trim();

    /*
     * The orchestrator now owns:
     *
     * - DSL generation
     * - frontend generation
     * - backend generation
     * - database generation
     * - scaffold generation
     * - retries
     * - provider fallback
     * - execution tracking
     * - file merging
     * - deterministic validation
     * - AI validation
     * - validation fixes
     */
    const orchestrationResult =
      await orchestrateGeneration({
        prompt: finalPrompt,
        projectName:
          projectName?.trim() || undefined,
        frontend: selectedFrontend,
        backend: selectedBackend,
        database: selectedDatabase,
      });

    if (
      !orchestrationResult ||
      typeof orchestrationResult !== "object"
    ) {
      throw new Error(
        "The generation orchestrator returned an invalid result."
      );
    }

    if (
      !orchestrationResult.dsl ||
      typeof orchestrationResult.dsl !==
        "object"
    ) {
      throw new Error(
        "The generation orchestrator did not return a valid DSL."
      );
    }

    if (
      !Array.isArray(
        orchestrationResult.files
      )
    ) {
      throw new Error(
        "The generation orchestrator did not return a valid files array."
      );
    }

    const dsl = orchestrationResult.dsl;

    const validationResult =
      orchestrationResult.validationResult || {
        valid: false,
        score: 0,
        summary:
          "Validation result was unavailable.",
        issues: [],
        fixedFiles: [],
        metrics: {},
      };

    const project = await Project.create({
      owner: req.user.id,

      title: buildProjectTitle(
        projectName,
        dsl,
        finalPrompt
      ),

      prompt: finalPrompt,

      transcript:
        typeof transcript === "string" &&
        transcript.trim()
          ? transcript.trim()
          : null,

      source: normalizeSource(source),

      language:
        typeof language === "string" &&
        language.trim()
          ? language.trim()
          : null,

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

      pipelineStatus:
        orchestrationResult.pipelineStatus ||
        (validationResult.valid
          ? "completed"
          : "completed_with_warnings"),

      generatedPath:
        orchestrationResult.generatedPath ||
        orchestrationResult
          .generatedProject?.projectPath ||
        null,

      files:
        orchestrationResult.files,

      agents: Array.isArray(
        orchestrationResult.agents
      )
        ? orchestrationResult.agents
        : [],
    });

    const issues =
      Array.isArray(
        validationResult.issues
      )
        ? validationResult.issues
        : [];

    const fixedFiles =
      Array.isArray(
        validationResult.fixedFiles
      )
        ? validationResult.fixedFiles
        : [];

    return res.status(201).json({
      success: true,

      message: validationResult.valid
        ? "Application generated, validated, and saved successfully."
        : "Application generated and saved with validation warnings.",

      project: {
        _id: project._id,
        title: project.title,
        prompt: project.prompt,
        status: project.status,
        pipelineStatus:
          project.pipelineStatus,

        framework:
          project.framework,

        backend:
          project.backend,

        database:
          project.database,

        generatedPath:
          project.generatedPath,

        filesCount:
          orchestrationResult.files.length,

        agentsCount:
          orchestrationResult.agents
            ?.length || 0,

        validation: {
          valid:
            validationResult.valid === true,

          score:
            Number(
              validationResult.score || 0
            ),

          summary:
            validationResult.summary ||
            "Validation completed.",

          issuesCount:
            issues.length,

          correctedFilesCount:
            fixedFiles.length,

          metrics:
            validationResult.metrics || {},
        },

        metrics:
          orchestrationResult.metrics || {},

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

    const errorMessage =
      serializeError(error);

    if (isRateLimitError(error)) {
      return res.status(429).json({
        success: false,
        message:
          "The AI provider rate limit was reached. Please wait briefly and retry.",
        error: errorMessage,
      });
    }

    if (
      isProviderConnectionError(error)
    ) {
      return res.status(503).json({
        success: false,
        message:
          "An AI provider is temporarily unavailable. EVOKE could not complete the generation.",
        error: errorMessage,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Application generation failed.",
      error: errorMessage,
    });
  }
};