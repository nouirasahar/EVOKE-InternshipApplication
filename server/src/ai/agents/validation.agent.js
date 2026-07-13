import path from "path";
import {
  getProviderForAgent,
} from "../providers/provider.factory.js";

const MAX_PROJECT_FILES = 150;
const MAX_AI_FILES = 24;
const MAX_AI_CONTENT_PER_FILE = 2800;
const MAX_FIXED_FILES = 15;
const MAX_FIXED_FILE_SIZE = 100_000;

const VALIDATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "valid",
    "score",
    "summary",
    "issues",
    "fixedFiles",
  ],
  properties: {
    valid: {
      type: "boolean",
    },
    score: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },
    summary: {
      type: "string",
    },
    issues: {
      type: "array",
      maxItems: 50,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "severity",
          "category",
          "file",
          "message",
          "suggestion",
          "resolved",
        ],
        properties: {
          severity: {
            type: "string",
            enum: ["error", "warning", "info"],
          },
          category: {
            type: "string",
          },
          file: {
            anyOf: [
              {
                type: "string",
              },
              {
                type: "null",
              },
            ],
          },
          message: {
            type: "string",
          },
          suggestion: {
            type: "string",
          },
          resolved: {
            type: "boolean",
          },
        },
      },
    },
    fixedFiles: {
      type: "array",
      maxItems: MAX_FIXED_FILES,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["path", "content", "language"],
        properties: {
          path: {
            type: "string",
          },
          content: {
            type: "string",
          },
          language: {
            type: "string",
          },
        },
      },
    },
  },
};

const buildSystemPrompt = () => `
You are the Validation and Repair Agent of EVOKE, a professional AI-powered
full-stack application generator.

You receive:

- the application DSL;
- a project file manifest;
- deterministic validation diagnostics;
- selected high-value source files.

Your responsibility is to identify cross-layer inconsistencies and return
targeted corrections only when necessary.

Return only valid JSON using this exact structure:

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
      "suggestion": "How to correct it",
      "resolved": false
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

GENERAL RULES

1. Return only valid JSON.
2. Never use Markdown code fences.
3. Do not return partial file fragments.
4. Every fixedFiles item must contain the complete corrected file.
5. Do not modify files unnecessarily.
6. Preserve requested product features.
7. Respect the technologies selected in the DSL.
8. Preserve the existing architecture whenever possible.
9. Never include secrets or real credentials.
10. Never invent a correction without sufficient source context.
11. When source context is insufficient, report an issue but do not fabricate a
    fixed file.
12. Return no more than ${MAX_FIXED_FILES} corrected files.

CROSS-LAYER CHECKS

Verify:

- frontend API calls match backend routes;
- backend entities match database models and schemas;
- authentication routes and middleware are consistent;
- protected frontend routes match backend authorization behavior;
- environment variables are declared in .env.example files;
- package dependencies match imported packages;
- route names, entity names, and field names remain consistent;
- generated entry points and startup scripts agree;
- backend database configuration matches the selected database;
- API response shapes are usable by the frontend;
- required pages, entities, endpoints, and features from the DSL are represented.

CODE CONSISTENCY CHECKS

Check:

- missing local import targets;
- duplicate routes;
- invalid or inconsistent module syntax;
- invalid package.json configuration;
- missing dependencies;
- unsafe authentication patterns;
- password exposure;
- incorrect environment-variable usage;
- incompatible framework configuration;
- incomplete startup files;
- obvious syntax defects visible in the supplied source.

ISSUE RULES

Use only these severities:

- error
- warning
- info

Suggested categories:

- imports
- dependencies
- routes
- entities
- database
- authentication
- authorization
- environment
- syntax
- security
- architecture
- configuration
- build
- consistency

Set resolved=true only when one of the returned fixed files actually resolves the
reported issue.

VALIDITY RULES

- valid must be false when an unresolved error remains.
- score must be an integer from 0 to 100.
- Do not mark the project valid merely because no obvious issue was found.
- Incorporate deterministic diagnostics into the final assessment.
- If no correction is necessary, return an empty fixedFiles array.
`;

const normalizePath = (filePath) => {
  const normalizedPath = String(filePath || "")
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/");

  if (!normalizedPath) {
    throw new Error(
      "Validation Agent received an empty file path."
    );
  }

  if (
    normalizedPath === ".." ||
    normalizedPath.startsWith("../") ||
    normalizedPath.includes("/../")
  ) {
    throw new Error(
      `Validation Agent received an unsafe path: ${normalizedPath}`
    );
  }

  return normalizedPath;
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
    ".prisma": "prisma",
  };

  return languages[extension] || "plaintext";
};

const getLayer = (filePath) => {
  if (filePath.startsWith("client/")) {
    return "frontend";
  }

  if (filePath.startsWith("server/")) {
    return "backend";
  }

  if (filePath.startsWith("database/")) {
    return "database";
  }

  if (filePath.startsWith("docker/")) {
    return "infrastructure";
  }

  return "root";
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

  if (files.length > MAX_PROJECT_FILES) {
    throw new Error(
      `Validation Agent received too many files: ${files.length}. Maximum supported: ${MAX_PROJECT_FILES}.`
    );
  }

  const seenPaths = new Set();

  return files.map((file, index) => {
    if (!file || typeof file !== "object") {
      throw new Error(
        `Validation Agent received an invalid file at index ${index}.`
      );
    }

    if (
      typeof file.path !== "string" ||
      typeof file.content !== "string"
    ) {
      throw new Error(
        `Validation Agent received a malformed file at index ${index}.`
      );
    }

    const normalizedPath = normalizePath(file.path);

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
        typeof file.language === "string" &&
        file.language.trim()
          ? file.language.trim()
          : detectLanguage(normalizedPath),
      layer: getLayer(normalizedPath),
    };
  });
};

const createIssue = ({
  severity,
  category,
  file = null,
  message,
  suggestion = "",
  resolved = false,
}) => ({
  severity,
  category,
  file,
  message,
  suggestion,
  resolved,
  source: "deterministic",
});

const validateJsonFiles = (files) => {
  const issues = [];

  for (const file of files) {
    if (!file.path.endsWith(".json")) {
      continue;
    }

    try {
      JSON.parse(file.content);
    } catch (error) {
      issues.push(
        createIssue({
          severity: "error",
          category: "syntax",
          file: file.path,
          message: `Invalid JSON: ${error.message}`,
          suggestion:
            "Correct the JSON syntax before building the project.",
        })
      );
    }
  }

  return issues;
};

const extractExternalImports = (content) => {
  const imports = new Set();

  const patterns = [
    /from\s+["']([^"'./][^"']*)["']/g,
    /import\s+["']([^"'./][^"']*)["']/g,
    /require\(\s*["']([^"'./][^"']*)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    let match;

    while ((match = pattern.exec(content)) !== null) {
      const packageName = match[1].startsWith("@")
        ? match[1].split("/").slice(0, 2).join("/")
        : match[1].split("/")[0];

      imports.add(packageName);
    }
  }

  return imports;
};

const validatePackageDependencies = (files) => {
  const issues = [];

  const layers = [
    {
      root: "client/",
      packagePath: "client/package.json",
    },
    {
      root: "server/",
      packagePath: "server/package.json",
    },
  ];

  for (const layer of layers) {
    const packageFile = files.find(
      (file) => file.path === layer.packagePath
    );

    if (!packageFile) {
      continue;
    }

    let packageJson;

    try {
      packageJson = JSON.parse(packageFile.content);
    } catch {
      continue;
    }

    const declaredDependencies = new Set([
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {}),
    ]);

    const usedDependencies = new Set();

    for (const file of files) {
      if (
        !file.path.startsWith(layer.root) ||
        !/\.(js|jsx|mjs|cjs|ts|tsx)$/.test(file.path)
      ) {
        continue;
      }

      for (const dependency of extractExternalImports(
        file.content
      )) {
        usedDependencies.add(dependency);
      }
    }

    const ignoredRuntimeModules = new Set([
      "fs",
      "path",
      "url",
      "crypto",
      "http",
      "https",
      "stream",
      "util",
      "events",
      "buffer",
      "os",
      "child_process",
      "assert",
      "node:fs",
      "node:path",
      "node:url",
      "node:crypto",
    ]);

    for (const dependency of usedDependencies) {
      if (
        ignoredRuntimeModules.has(dependency) ||
        dependency.startsWith("node:")
      ) {
        continue;
      }

      if (!declaredDependencies.has(dependency)) {
        issues.push(
          createIssue({
            severity: "error",
            category: "dependencies",
            file: layer.packagePath,
            message: `Package "${dependency}" is imported but is not declared.`,
            suggestion: `Add "${dependency}" to the appropriate dependencies section.`,
          })
        );
      }
    }
  }

  return issues;
};

const resolveLocalImportCandidates = (
  importerPath,
  importPath
) => {
  const importerDirectory = path.posix.dirname(importerPath);
  const resolvedBase = path.posix.normalize(
    path.posix.join(importerDirectory, importPath)
  );

  return [
    resolvedBase,
    `${resolvedBase}.js`,
    `${resolvedBase}.jsx`,
    `${resolvedBase}.mjs`,
    `${resolvedBase}.cjs`,
    `${resolvedBase}.ts`,
    `${resolvedBase}.tsx`,
    `${resolvedBase}.json`,
    `${resolvedBase}/index.js`,
    `${resolvedBase}/index.jsx`,
    `${resolvedBase}/index.ts`,
    `${resolvedBase}/index.tsx`,
  ];
};

const extractLocalImports = (content) => {
  const imports = [];
  const pattern =
    /(?:from\s+|import\s+|require\(\s*)["'](\.{1,2}\/[^"']+)["']/g;

  let match;

  while ((match = pattern.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
};

const validateLocalImports = (files) => {
  const issues = [];
  const filePaths = new Set(
    files.map((file) => file.path)
  );

  for (const file of files) {
    if (
      !/\.(js|jsx|mjs|cjs|ts|tsx)$/.test(file.path)
    ) {
      continue;
    }

    for (const importPath of extractLocalImports(
      file.content
    )) {
      const candidates = resolveLocalImportCandidates(
        file.path,
        importPath
      );

      const targetExists = candidates.some(
        (candidate) => filePaths.has(candidate)
      );

      if (!targetExists) {
        issues.push(
          createIssue({
            severity: "error",
            category: "imports",
            file: file.path,
            message: `Local import "${importPath}" does not resolve to a generated file.`,
            suggestion:
              "Generate the missing file or correct the import path.",
          })
        );
      }
    }
  }

  return issues;
};

const extractUsedEnvironmentVariables = (content) => {
  const names = new Set();

  const patterns = [
    /process\.env\.([A-Z0-9_]+)/g,
    /import\.meta\.env\.([A-Z0-9_]+)/g,
  ];

  for (const pattern of patterns) {
    let match;

    while ((match = pattern.exec(content)) !== null) {
      names.add(match[1]);
    }
  }

  return names;
};

const extractDeclaredEnvironmentVariables = (content) => {
  const names = new Set();

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(
      /^\s*([A-Z][A-Z0-9_]*)\s*=/
    );

    if (match) {
      names.add(match[1]);
    }
  }

  return names;
};

const validateEnvironmentVariables = (files) => {
  const issues = [];

  const layers = [
    {
      root: "client/",
      envPath: "client/.env.example",
    },
    {
      root: "server/",
      envPath: "server/.env.example",
    },
  ];

  for (const layer of layers) {
    const usedVariables = new Set();

    for (const file of files) {
      if (!file.path.startsWith(layer.root)) {
        continue;
      }

      for (const variable of extractUsedEnvironmentVariables(
        file.content
      )) {
        usedVariables.add(variable);
      }
    }

    if (usedVariables.size === 0) {
      continue;
    }

    const envFile = files.find(
      (file) => file.path === layer.envPath
    );

if (!envFile) {
      issues.push(
        createIssue({
          severity: "warning",
          category: "environment",
          file: layer.envPath,
          message: `${layer.envPath} is missing although environment variables are used.`,
          suggestion:
            "Generate an .env.example file containing every required environment variable.",
        })
      );

      continue;
    }

    const declaredVariables =
      extractDeclaredEnvironmentVariables(
        envFile.content
      );

    for (const variable of usedVariables) {
      if (!declaredVariables.has(variable)) {
        issues.push(
          createIssue({
            severity: "warning",
            category: "environment",
            file: layer.envPath,
            message: `Environment variable "${variable}" is used but not declared in ${layer.envPath}.`,
            suggestion: `Add ${variable}= to ${layer.envPath}.`,
          })
        );
      }
    }
  }

  return issues;
};

const validateRequiredEntryPoints = (
  files,
  dsl
) => {
  const issues = [];
  const paths = new Set(
    files.map((file) => file.path)
  );

  const frontend = String(
    dsl.frontend || "react-vite"
  ).toLowerCase();

  const backend = String(
    dsl.backend || "express"
  ).toLowerCase();

  if (frontend === "react-vite") {
    const requiredFiles = [
      "client/package.json",
      "client/index.html",
      "client/src/main.tsx",
      "client/src/App.tsx",
    ];

    for (const requiredFile of requiredFiles) {
      if (!paths.has(requiredFile)) {
        issues.push(
          createIssue({
            severity: "error",
            category: "configuration",
            file: requiredFile,
            message: `Required React/Vite file is missing: ${requiredFile}.`,
            suggestion:
              "Generate the missing React/Vite project file.",
          })
        );
      }
    }
  }

  if (frontend === "nextjs") {
    const requiredFiles = [
      "client/package.json",
      "client/app/layout.tsx",
      "client/app/page.tsx",
    ];

    for (const requiredFile of requiredFiles) {
      if (!paths.has(requiredFile)) {
        issues.push(
          createIssue({
            severity: "error",
            category: "configuration",
            file: requiredFile,
            message: `Required Next.js file is missing: ${requiredFile}.`,
            suggestion:
              "Generate the missing Next.js application file.",
          })
        );
      }
    }
  }

  if (frontend === "angular") {
    const requiredFiles = [
      "client/package.json",
      "client/angular.json",
      "client/src/main.ts",
      "client/src/index.html",
    ];

    for (const requiredFile of requiredFiles) {
      if (!paths.has(requiredFile)) {
        issues.push(
          createIssue({
            severity: "error",
            category: "configuration",
            file: requiredFile,
            message: `Required Angular file is missing: ${requiredFile}.`,
            suggestion:
              "Generate the missing Angular project file.",
          })
        );
      }
    }
  }

  if (backend === "express") {
    if (!paths.has("server/package.json")) {
      issues.push(
        createIssue({
          severity: "error",
          category: "configuration",
          file: "server/package.json",
          message:
            "The Express package.json file is missing.",
          suggestion:
            "Generate server/package.json with the required dependencies and scripts.",
        })
      );
    }

    const expressEntryPoints = [
      "server/src/index.js",
      "server/src/index.mjs",
      "server/src/server.js",
      "server/src/app.js",
    ];

    const hasExpressEntryPoint =
      expressEntryPoints.some((entryPoint) =>
        paths.has(entryPoint)
      );

    if (!hasExpressEntryPoint) {
      issues.push(
        createIssue({
          severity: "error",
          category: "configuration",
          file: null,
          message:
            "No Express application entry point was generated.",
          suggestion:
            "Generate server/src/index.js or another valid Express entry point.",
        })
      );
    }
  }

  if (backend === "nestjs") {
    const requiredFiles = [
      "server/package.json",
      "server/src/main.ts",
      "server/src/app.module.ts",
      "server/tsconfig.json",
    ];

    for (const requiredFile of requiredFiles) {
      if (!paths.has(requiredFile)) {
        issues.push(
          createIssue({
            severity: "error",
            category: "configuration",
            file: requiredFile,
            message: `Required NestJS file is missing: ${requiredFile}.`,
            suggestion:
              "Generate the missing NestJS project file.",
          })
        );
      }
    }
  }

  if (backend === "spring-boot") {
    if (!paths.has("server/pom.xml")) {
      issues.push(
        createIssue({
          severity: "error",
          category: "configuration",
          file: "server/pom.xml",
          message:
            "The Spring Boot Maven configuration is missing.",
          suggestion:
            "Generate server/pom.xml.",
        })
      );
    }

    const hasSpringEntryPoint = files.some(
      (file) =>
        file.path.startsWith(
          "server/src/main/java/"
        ) &&
        file.path.endsWith("Application.java")
    );

    if (!hasSpringEntryPoint) {
      issues.push(
        createIssue({
          severity: "error",
          category: "configuration",
          file: null,
          message:
            "No Spring Boot application entry point was generated.",
          suggestion:
            "Generate a Java class ending in Application.java with @SpringBootApplication.",
        })
      );
    }
  }

  return issues;
};

const validateDslCoverage = (files, dsl) => {
  const issues = [];

  const searchableContent = files
    .map(
      (file) =>
        `${file.path}\n${file.content}`
    )
    .join("\n")
    .toLowerCase();

  const entities = Array.isArray(dsl.entities)
    ? dsl.entities
    : [];

  for (const entity of entities) {
    const entityName = String(
      entity?.name || ""
    ).trim();

    if (!entityName) {
      continue;
    }

    if (
      !searchableContent.includes(
        entityName.toLowerCase()
      )
    ) {
      issues.push(
        createIssue({
          severity: "warning",
          category: "entities",
          file: null,
          message: `Entity "${entityName}" does not appear in the generated project files.`,
          suggestion:
            "Generate the corresponding frontend, backend, or database implementation.",
        })
      );
    }
  }

  const apiEndpoints = Array.isArray(dsl.api)
    ? dsl.api
    : [];

  for (const endpoint of apiEndpoints) {
    const endpointPath = String(
      endpoint?.path || ""
    ).trim();

    if (!endpointPath) {
      continue;
    }

    if (
      !searchableContent.includes(
        endpointPath.toLowerCase()
      )
    ) {
      issues.push(
        createIssue({
          severity: "warning",
          category: "routes",
          file: null,
          message: `DSL endpoint "${endpoint.method || "GET"} ${endpointPath}" was not found in the generated files.`,
          suggestion:
            "Generate or correct the matching frontend service and backend route.",
        })
      );
    }
  }

  return issues;
};

const validateAuthenticationSafety = (
  files,
  dsl
) => {
  const issues = [];

  if (!dsl.authentication) {
    return issues;
  }

  const joinedContent = files
    .map((file) => file.content)
    .join("\n");

  const passwordExposurePatterns = [
    /password\s*:\s*user\.password/gi,
    /res\.json\([^)]*password/gi,
    /console\.log\([^)]*password/gi,
  ];

  for (const pattern of passwordExposurePatterns) {
    if (pattern.test(joinedContent)) {
      issues.push(
        createIssue({
          severity: "error",
          category: "security",
          file: null,
          message:
            "The generated backend may expose or log password information.",
          suggestion:
            "Remove password fields from API responses and logs.",
        })
      );

      break;
    }
  }

  const hasPasswordHashing =
    /bcrypt|argon2|scrypt/i.test(joinedContent);

  if (!hasPasswordHashing) {
    issues.push(
      createIssue({
        severity: "error",
        category: "authentication",
        file: null,
        message:
          "Authentication is enabled, but no password-hashing implementation was detected.",
        suggestion:
          "Use bcrypt, Argon2, or another secure password-hashing mechanism.",
      })
    );
  }

  const hasAuthMiddleware =
    /authorization|bearer|jwt\.verify|authguard|authenticationfilter/i.test(
      joinedContent
    );

  if (!hasAuthMiddleware) {
    issues.push(
      createIssue({
        severity: "warning",
        category: "authentication",
        file: null,
        message:
          "Authentication is enabled, but no route-protection mechanism was detected.",
        suggestion:
          "Generate authentication middleware or guards for protected routes.",
      })
    );
  }

  return issues;
};

const runDeterministicValidation = ({
  files,
  dsl,
}) => {
  return [
    ...validateJsonFiles(files),
    ...validatePackageDependencies(files),
    ...validateLocalImports(files),
    ...validateEnvironmentVariables(files),
    ...validateRequiredEntryPoints(
      files,
      dsl
    ),
    ...validateDslCoverage(files, dsl),
    ...validateAuthenticationSafety(
      files,
      dsl
    ),
  ];
};

const getFilePriority = (file) => {
  const highPriorityFiles = new Set([
    "client/package.json",
    "client/src/App.tsx",
    "client/src/main.tsx",
    "client/app/layout.tsx",
    "client/app/page.tsx",
    "server/package.json",
    "server/src/index.js",
    "server/src/app.js",
    "server/src/main.ts",
    "server/src/app.module.ts",
    "server/pom.xml",
    "database/schema.sql",
    "database/README.md",
    "database/seed.js",
    "database/seed.sql",
    ".env.example",
    "client/.env.example",
    "server/.env.example",
  ]);

  if (highPriorityFiles.has(file.path)) {
    return 100;
  }

  if (
    /controller|service|route|middleware|guard|model|schema|entity/i.test(
      file.path
    )
  ) {
    return 80;
  }

  if (
    /\.(tsx|ts|jsx|js|java|sql|json)$/.test(
      file.path
    )
  ) {
    return 60;
  }

  return 20;
};

const createProjectManifest = (files) => {
  return files.map((file) => ({
    path: file.path,
    language: file.language,
    layer: file.layer,
    size: file.content.length,
  }));
};

const createAiValidationPayload = (
  files,
  deterministicIssues
) => {
  const issueFilePaths = new Set(
    deterministicIssues
      .map((issue) => issue.file)
      .filter(Boolean)
  );

  const selectedFiles = [...files]
    .sort((firstFile, secondFile) => {
      const firstPriority =
        getFilePriority(firstFile) +
        (issueFilePaths.has(firstFile.path)
          ? 100
          : 0);

      const secondPriority =
        getFilePriority(secondFile) +
        (issueFilePaths.has(secondFile.path)
          ? 100
          : 0);

      return secondPriority - firstPriority;
    })
    .slice(0, MAX_AI_FILES)
    .map((file) => ({
      path: file.path,
      language: file.language,
      content:
        file.content.length >
        MAX_AI_CONTENT_PER_FILE
          ? `${file.content.slice(
              0,
              MAX_AI_CONTENT_PER_FILE
            )}\n\n/* Content truncated for AI validation */`
          : file.content,
    }));

  return {
    manifest: createProjectManifest(files),
    deterministicIssues:
      deterministicIssues.map(
        ({
          severity,
          category,
          file,
          message,
          suggestion,
          resolved,
        }) => ({
          severity,
          category,
          file,
          message,
          suggestion,
          resolved,
        })
      ),
    selectedFiles,
  };
};

const normalizeIssue = (issue) => {
  const allowedSeverities = new Set([
    "error",
    "warning",
    "info",
  ]);

  if (!issue || typeof issue !== "object") {
    return null;
  }

  return {
    severity: allowedSeverities.has(
      issue.severity
    )
      ? issue.severity
      : "warning",
    category:
      typeof issue.category === "string" &&
      issue.category.trim()
        ? issue.category.trim()
        : "architecture",
    file:
      typeof issue.file === "string" &&
      issue.file.trim()
        ? normalizePath(issue.file)
        : null,
    message:
      typeof issue.message === "string" &&
      issue.message.trim()
        ? issue.message.trim()
        : "Unspecified validation issue.",
    suggestion:
      typeof issue.suggestion === "string"
        ? issue.suggestion.trim()
        : "",
    resolved:
      typeof issue.resolved === "boolean"
        ? issue.resolved
        : false,
    source: "ai",
  };
};

const validateFixedFiles = (
  fixedFiles,
  originalFilePaths
) => {
  if (!Array.isArray(fixedFiles)) {
    return [];
  }

  if (
    fixedFiles.length > MAX_FIXED_FILES
  ) {
    throw new Error(
      `Validation Agent returned too many fixed files: ${fixedFiles.length}.`
    );
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

  return fixedFiles.map((file, index) => {
    if (
      !file ||
      typeof file !== "object" ||
      typeof file.path !== "string" ||
      typeof file.content !== "string"
    ) {
      throw new Error(
        `Validation Agent returned a malformed fixed file at index ${index}.`
      );
    }

    const normalizedPath = normalizePath(
      file.path
    );

    const isAllowedDirectory =
      normalizedPath.startsWith("client/") ||
      normalizedPath.startsWith("server/") ||
      normalizedPath.startsWith(
        "database/"
      ) ||
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

    if (seenPaths.has(normalizedPath)) {
      throw new Error(
        `Validation Agent returned a duplicate fixed file: ${normalizedPath}`
      );
    }

    if (
      file.content.length >
      MAX_FIXED_FILE_SIZE
    ) {
      throw new Error(
        `Validation Agent returned an excessively large fixed file: ${normalizedPath}`
      );
    }

    seenPaths.add(normalizedPath);

    return {
      path: normalizedPath,
      content: file.content,
      language:
        typeof file.language === "string" &&
        file.language.trim()
          ? file.language.trim()
          : detectLanguage(normalizedPath),
      isNewFile:
        !originalFilePaths.has(
          normalizedPath
        ),
    };
  });
};

const deduplicateIssues = (issues) => {
  const issueMap = new Map();

  for (const issue of issues) {
    const key = [
      issue.severity,
      issue.category,
      issue.file || "",
      issue.message,
    ].join("|");

    if (!issueMap.has(key)) {
      issueMap.set(key, issue);
    }
  }

  return [...issueMap.values()];
};

const calculateValidationScore = (
  issues,
  aiScore
) => {
  const penalties = {
    error: 15,
    warning: 5,
    info: 1,
  };

  const unresolvedPenalty = issues.reduce(
    (total, issue) => {
      if (issue.resolved) {
        return total;
      }

      return (
        total +
        (penalties[issue.severity] || 0)
      );
    },
    0
  );

  const deterministicScore = Math.max(
    0,
    100 - unresolvedPenalty
  );

  if (!Number.isFinite(Number(aiScore))) {
    return deterministicScore;
  }

  const normalizedAiScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(Number(aiScore))
    )
  );

  return Math.round(
    deterministicScore * 0.65 +
      normalizedAiScore * 0.35
  );
};

const normalizeValidationResult = ({
  aiResult,
  deterministicIssues,
  originalFiles,
}) => {
  const originalFilePaths = new Set(
    originalFiles.map(
      (file) => file.path
    )
  );

  const aiIssues = Array.isArray(
    aiResult?.issues
  )
    ? aiResult.issues
        .map(normalizeIssue)
        .filter(Boolean)
    : [];

  const fixedFiles = validateFixedFiles(
    aiResult?.fixedFiles,
    originalFilePaths
  );

  const fixedPaths = new Set(
    fixedFiles.map((file) => file.path)
  );

  const combinedIssues = deduplicateIssues([
    ...deterministicIssues,
    ...aiIssues,
  ]).map((issue) => {
    if (
      issue.file &&
      fixedPaths.has(issue.file)
    ) {
      return {
        ...issue,
        resolved: true,
      };
    }

    return issue;
  });

  const unresolvedErrors =
    combinedIssues.filter(
      (issue) =>
        issue.severity === "error" &&
        !issue.resolved
    );

  const score = calculateValidationScore(
    combinedIssues,
    aiResult?.score
  );

  return {
    valid:
      unresolvedErrors.length === 0 &&
      score >= 70,
    score,
    summary:
      typeof aiResult?.summary ===
        "string" &&
      aiResult.summary.trim()
        ? aiResult.summary.trim()
        : `Validation completed with ${combinedIssues.length} issue(s).`,
    issues: combinedIssues,
    fixedFiles,
    metrics: {
      totalIssues:
        combinedIssues.length,
      errors: combinedIssues.filter(
        (issue) =>
          issue.severity === "error"
      ).length,
      warnings: combinedIssues.filter(
        (issue) =>
          issue.severity === "warning"
      ).length,
      info: combinedIssues.filter(
        (issue) =>
          issue.severity === "info"
      ).length,
      unresolvedErrors:
        unresolvedErrors.length,
      correctedFiles:
        fixedFiles.length,
    },
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

  const finalFiles = projectFiles.map(
    (file) =>
      fixedFileMap.get(file.path) || file
  );

  const existingPaths = new Set(
    projectFiles.map(
      (file) => file.path
    )
  );

  for (const fixedFile of fixedFiles) {
    if (
      !existingPaths.has(fixedFile.path)
    ) {
      finalFiles.push({
        path: fixedFile.path,
        content: fixedFile.content,
        language: fixedFile.language,
      });
    }
  }

  return finalFiles.sort(
    (firstFile, secondFile) =>
      firstFile.path.localeCompare(
        secondFile.path
      )
  );
};

export const validateGeneratedProject =
  async ({ dsl, files }) => {
    if (
      !dsl ||
      typeof dsl !== "object"
    ) {
      throw new Error(
        "Validation Agent requires a valid DSL object."
      );
    }

    const normalizedFiles =
      validateInputFiles(files);

    const deterministicIssues =
      runDeterministicValidation({
        files: normalizedFiles,
        dsl,
      });

    const aiPayload =
      createAiValidationPayload(
        normalizedFiles,
        deterministicIssues
      );

    const ai =
      getProviderForAgent("validation");

    let aiResult = {
      valid: false,
      score: 0,
      summary:
        "AI validation was not completed.",
      issues: [],
      fixedFiles: [],
    };

    try {
      aiResult = await ai.generateJson({
        systemPrompt:
          buildSystemPrompt(),
        userPrompt: `
Validate this generated full-stack application.

APPLICATION DSL

${JSON.stringify(dsl, null, 2)}

PROJECT MANIFEST

${JSON.stringify(
  aiPayload.manifest,
  null,
  2
)}

DETERMINISTIC DIAGNOSTICS

${JSON.stringify(
  aiPayload.deterministicIssues,
  null,
  2
)}

SELECTED SOURCE FILES

${JSON.stringify(
  aiPayload.selectedFiles,
  null,
  2
)}

Review cross-layer consistency and return only the required JSON response.
`,
        temperature: 0,
        maxTokens: 4500,
        schema: VALIDATION_SCHEMA,
      });
    } catch (error) {
      console.error(
        "[Validation Agent] AI review failed:",
        error.message
      );

      aiResult = {
        valid: false,
        score: 0,
        summary:
          "The deterministic validation completed, but the AI review was unavailable.",
        issues: [
          {
            severity: "warning",
            category: "validation",
            file: null,
            message:
              "The AI validation service could not complete the review.",
            suggestion:
              "Retry validation later. Deterministic diagnostics remain available.",
            resolved: false,
          },
        ],
        fixedFiles: [],
      };
    }

    return normalizeValidationResult({
      aiResult,
      deterministicIssues,
      originalFiles: normalizedFiles,
    });
  };