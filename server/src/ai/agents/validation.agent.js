import path from "path";
import { createAIProvider } from "../providers/provider.factory.js";

const MAX_FILES_PER_VALIDATION = 80;
const MAX_CONTENT_LENGTH_PER_FILE = 14000;

const buildSystemPrompt = () => `
You are the Validation Agent of EVOKE, an AI full-stack application generator.

You receive:

- an application DSL;
- frontend files;
- backend files;
- database files;
- project configuration files.

Your responsibility is to validate the complete generated project and fix
cross-layer inconsistencies.

Return only valid JSON using exactly this structure:

{
  "valid": true,
  "score": 100,
  "summary": "Concise validation summary",
  "issues": [
    {
      "severity": "error",
      "category": "imports",
      "file": "client/src/App.tsx",
      "message": "Description of the problem",
      "suggestion": "How the problem should be fixed"
    }
  ],
  "fixedFiles": [
    {
      "path": "client/src/App.tsx",
      "content": "complete corrected file content",
      "language": "typescript"
    }
  ]
}

Rules:

1. Return only valid JSON.
2. Do not use Markdown code fences.
3. Do not return partial file fragments.
4. Every item in fixedFiles must contain the complete corrected file.
5. Do not modify a file unless a correction is necessary.
6. Do not remove requested features.
7. Respect the technologies selected in the DSL.
8. Preserve the existing architecture whenever possible.
9. Do not generate files outside client/, server/, database/, docker/, or
   approved project-root configuration files.
10. Never include secrets or real credentials.
11. Keep frontend, backend, and database naming consistent.
12. Verify that frontend API calls correspond to backend routes.
13. Verify that backend models and database schemas use consistent fields.
14. Verify that imported local files exist.
15. Verify that package.json files contain required dependencies.
16. Verify environment-variable usage and .env.example declarations.
17. Verify that authentication-related files are mutually consistent.
18. Detect duplicate file paths and unsafe paths.
19. Use severity values only from:
    - error
    - warning
    - info
20. Use these categories when appropriate:
    - imports
    - dependencies
    - routes
    - entities
    - database
    - authentication
    - environment
    - syntax
    - security
    - architecture
    - configuration
21. valid must be false when at least one unresolved error remains.
22. score must be an integer between 0 and 100.
23. If no correction is necessary, return an empty fixedFiles array.
`;

const normalizePath = (filePath) => {
  return filePath
    .replaceAll("\\", "/")
    .replace(/^\/+/, "");
};

const detectLanguage = (filePath) => {
  const fileName = path.basename(filePath).toLowerCase();
  const extension = path.extname(filePath).toLowerCase();

  if (
    fileName === ".env" ||
    fileName === ".env.example" ||
    extension === ".properties"
  ) {
    return "plaintext";
  }

  const languages = {
    ".js": "javascript",
    ".jsx": "javascript",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".json": "json",
    ".html": "html",
    ".css": "css",
    ".scss": "scss",
    ".md": "markdown",
    ".sql": "sql",
    ".java": "java",
    ".xml": "xml",
    ".yml": "yaml",
    ".yaml": "yaml",
  };

  return languages[extension] || "text";
};

const validateInputFiles = (files) => {
  if (!Array.isArray(files)) {
    throw new Error(
      "Validation Agent requires an array of generated files."
    );
  }

  if (files.length === 0) {
    throw new Error(
      "Validation Agent cannot validate an empty project."
    );
  }

  const seenPaths = new Set();

  return files.map((file) => {
    if (
      !file ||
      typeof file.path !== "string" ||
      typeof file.content !== "string"
    ) {
      throw new Error(
        "Validation Agent received a malformed file entry."
      );
    }

    const normalizedPath = normalizePath(file.path);

    if (!normalizedPath) {
      throw new Error(
        "Validation Agent received a file with an empty path."
      );
    }

    if (
      normalizedPath.includes("../") ||
      normalizedPath.includes("..\\")
    ) {
      throw new Error(
        `Validation Agent received an unsafe path: ${normalizedPath}`
      );
    }

    if (seenPaths.has(normalizedPath)) {
      throw new Error(
        `Duplicate generated file detected: ${normalizedPath}`
      );
    }

    seenPaths.add(normalizedPath);

    return {
      path: normalizedPath,
      content: file.content,
      language:
        file.language || detectLanguage(normalizedPath),
    };
  });
};

const createValidationPayload = (files) => {
  return files
    .slice(0, MAX_FILES_PER_VALIDATION)
    .map((file) => ({
      path: file.path,
      language: file.language,
      content:
        file.content.length > MAX_CONTENT_LENGTH_PER_FILE
          ? `${file.content.slice(
              0,
              MAX_CONTENT_LENGTH_PER_FILE
            )}\n\n/* Content truncated for validation */`
          : file.content,
    }));
};

const validateIssue = (issue) => {
  const allowedSeverities = new Set([
    "error",
    "warning",
    "info",
  ]);

  if (!issue || typeof issue !== "object") {
    return null;
  }

  return {
    severity: allowedSeverities.has(issue.severity)
      ? issue.severity
      : "warning",
    category:
      typeof issue.category === "string"
        ? issue.category
        : "architecture",
    file:
      typeof issue.file === "string"
        ? normalizePath(issue.file)
        : null,
    message:
      typeof issue.message === "string"
        ? issue.message
        : "Unspecified validation issue.",
    suggestion:
      typeof issue.suggestion === "string"
        ? issue.suggestion
        : "",
  };
};

const validateFixedFiles = (
  fixedFiles,
  originalFilePaths
) => {
  if (!Array.isArray(fixedFiles)) {
    return [];
  }

  const allowedRootFiles = new Set([
    "package.json",
    "README.md",
    ".env.example",
    "docker-compose.yml",
    "docker-compose.yaml",
    "evoke.dsl.json",
  ]);

  const seenPaths = new Set();

  return fixedFiles.map((file) => {
    if (
      !file ||
      typeof file.path !== "string" ||
      typeof file.content !== "string"
    ) {
      throw new Error(
        "Validation Agent returned a malformed fixed file."
      );
    }

    const normalizedPath = normalizePath(file.path);

    const isAllowedDirectory =
      normalizedPath.startsWith("client/") ||
      normalizedPath.startsWith("server/") ||
      normalizedPath.startsWith("database/") ||
      normalizedPath.startsWith("docker/");

    const isAllowedRootFile =
      allowedRootFiles.has(normalizedPath);

    if (
      !isAllowedDirectory &&
      !isAllowedRootFile
    ) {
      throw new Error(
        `Validation Agent returned a file outside the allowed project structure: ${normalizedPath}`
      );
    }

    if (normalizedPath.includes("..")) {
      throw new Error(
        `Validation Agent returned an unsafe path: ${normalizedPath}`
      );
    }

    if (seenPaths.has(normalizedPath)) {
      throw new Error(
        `Validation Agent returned a duplicate fixed file: ${normalizedPath}`
      );
    }

    seenPaths.add(normalizedPath);

    return {
      path: normalizedPath,
      content: file.content,
      language:
        file.language || detectLanguage(normalizedPath),
      isNewFile: !originalFilePaths.has(normalizedPath),
    };
  });
};

const normalizeValidationResult = (
  result,
  originalFiles
) => {
  if (!result || typeof result !== "object") {
    throw new Error(
      "Validation Agent returned an invalid response."
    );
  }

  const originalFilePaths = new Set(
    originalFiles.map((file) => file.path)
  );

  const issues = Array.isArray(result.issues)
    ? result.issues
        .map(validateIssue)
        .filter(Boolean)
    : [];

  const fixedFiles = validateFixedFiles(
    result.fixedFiles,
    originalFilePaths
  );

  const unresolvedErrors = issues.filter(
    (issue) => issue.severity === "error"
  ).length;

  const rawScore = Number(result.score);
  const score = Number.isFinite(rawScore)
    ? Math.max(0, Math.min(100, Math.round(rawScore)))
    : Math.max(0, 100 - unresolvedErrors * 15);

  return {
    valid:
      typeof result.valid === "boolean"
        ? result.valid
        : unresolvedErrors === 0,
    score,
    summary:
      typeof result.summary === "string"
        ? result.summary
        : "Project validation completed.",
    issues,
    fixedFiles,
  };
};

export const applyValidationFixes = (
  projectFiles,
  fixedFiles
) => {
  const fixedFileMap = new Map(
    fixedFiles.map((file) => [
      file.path,
      {
        path: file.path,
        content: file.content,
        language: file.language,
      },
    ])
  );

  const finalFiles = projectFiles.map((file) => {
    return fixedFileMap.get(file.path) || file;
  });

  const existingPaths = new Set(
    projectFiles.map((file) => file.path)
  );

  for (const fixedFile of fixedFiles) {
    if (!existingPaths.has(fixedFile.path)) {
      finalFiles.push({
        path: fixedFile.path,
        content: fixedFile.content,
        language: fixedFile.language,
      });
    }
  }

  return finalFiles.sort((firstFile, secondFile) =>
    firstFile.path.localeCompare(secondFile.path)
  );
};

export const validateGeneratedProject = async ({
  dsl,
  files,
}) => {
  if (!dsl || typeof dsl !== "object") {
    throw new Error(
      "Validation Agent requires a valid DSL object."
    );
  }

  const normalizedFiles = validateInputFiles(files);
  const validationPayload =
    createValidationPayload(normalizedFiles);

  const ai = createAIProvider();

  const result = await ai.generateJson({
    systemPrompt: buildSystemPrompt(),
    userPrompt: `
Validate this generated full-stack application.

Application DSL:

${JSON.stringify(dsl, null, 2)}

Generated files:

${JSON.stringify(validationPayload, null, 2)}

Check cross-layer consistency and return only the required JSON response.
`,
    temperature: 0,
    maxTokens: 10000,
  });

  return normalizeValidationResult(
    result,
    normalizedFiles
  );
};