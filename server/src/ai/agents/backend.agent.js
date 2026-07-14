import path from "path";
import {
  getProviderForAgent,
} from "../providers/provider.factory.js";

const MAX_BACKEND_FILES = 55;
const MAX_FILE_SIZE = 100_000;

const BACKEND_FILES_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["files"],
  properties: {
    files: {
      type: "array",
      minItems: 1,
      maxItems: MAX_BACKEND_FILES,
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
You are the Backend Agent of EVOKE, a professional AI-powered full-stack
application generator.

Your responsibility is to transform the supplied application DSL into a
complete, coherent, secure, maintainable, and runnable backend application.

Return only valid JSON using exactly this structure:

{
  "files": [
    {
      "path": "server/src/index.js",
      "content": "complete source code",
      "language": "javascript"
    }
  ]
}

GENERAL OUTPUT RULES

1. Return only valid JSON.
2. Never return Markdown code fences.
3. Generate backend files only.
4. Every returned path must be inside server/.
5. Generate complete files, not fragments.
6. Never use placeholders such as:
   - TODO
   - implementation here
   - add logic later
   - omitted for brevity
7. Never reference a local file that is not included in the response.
8. Never import an external package that is absent from server/package.json.
9. Respect the selected backend technology exactly.
10. Respect the selected database technology exactly.
11. Implement the entities, APIs, authentication, and features in the DSL.
12. Keep naming consistent with the DSL and generated database layer.
13. Do not include API keys, passwords, tokens, or real credentials.
14. Return no more than ${MAX_BACKEND_FILES} files.
15. Keep the initial implementation compact but fully functional.

ARCHITECTURE REQUIREMENTS

Use a professional layered architecture appropriate for the selected framework.

For a conventional REST backend, separate responsibilities into:

- configuration;
- models or entities;
- repositories when appropriate;
- services;
- controllers;
- routes;
- middleware or guards;
- validators or DTOs;
- utilities;
- centralized error handling.

Avoid:

- placing all application logic in one file;
- mixing HTTP logic with persistence logic;
- duplicated business logic;
- controllers that directly implement complex database operations;
- unsafe global state;
- silent error swallowing;
- hardcoded configuration values.

API REQUIREMENTS

For every API endpoint in the DSL:

- generate a matching backend route;
- use the exact HTTP method;
- keep resource paths consistent;
- implement the requested purpose;
- return appropriate status codes;
- return consistent JSON response shapes;
- validate request parameters, query values, and bodies;
- handle missing resources;
- handle duplicate-resource conflicts where relevant;
- protect authenticated endpoints;
- avoid exposing sensitive fields.

Use standard status codes where appropriate:

- 200 for successful reads and updates;
- 201 for successful creation;
- 204 for successful deletion without a body;
- 400 for invalid input;
- 401 for missing or invalid authentication;
- 403 for authorization failures;
- 404 for missing resources;
- 409 for conflicts;
- 500 only for unexpected server failures.

AUTHENTICATION AND AUTHORIZATION

When authentication is enabled:

- generate registration and login endpoints;
- hash passwords using a secure password-hashing library;
- never return password hashes;
- generate token-based authentication where suitable;
- create authentication middleware or guards;
- protect routes identified by the DSL;
- validate authorization headers safely;
- handle expired and invalid tokens;
- provide an authenticated-user endpoint when useful;
- support roles only when requested by the product specification;
- do not hardcode JWT secrets;
- declare required secrets in server/.env.example.

SECURITY REQUIREMENTS

- Validate all external input.
- Avoid unsafe object spreading from request bodies.
- Prevent mass-assignment vulnerabilities.
- Use environment variables for secrets and connection strings.
- Configure CORS explicitly.
- Add secure HTTP headers when appropriate.
- Avoid leaking internal stack traces in production responses.
- Add request limits where appropriate.
- Sanitize or constrain user-provided query values.
- Do not generate insecure default credentials.
- Never log passwords, access tokens, or secrets.
- Use parameterized queries for SQL technologies.
- Use safe query construction for MongoDB.
- Avoid arbitrary code execution, shell execution, and unsafe file paths.

ERROR HANDLING

Generate centralized error handling.

The backend should:

- distinguish operational errors from unexpected errors;
- preserve useful development diagnostics;
- return sanitized production responses;
- handle unknown routes;
- avoid duplicated try/catch boilerplate when the framework provides a cleaner
  mechanism;
- use a consistent response format.

ENVIRONMENT CONFIGURATION

Generate server/.env.example.

Include only variables that are actually used, such as:

- PORT;
- DATABASE_URL or MONGODB_URI;
- JWT_SECRET;
- JWT_EXPIRES_IN;
- CLIENT_URL;
- NODE_ENV.

Never include real values or credentials.

PACKAGE MANAGEMENT

- Generate a complete package or build configuration.
- Include every imported external dependency.
- Exclude unused dependencies.
- Use compatible dependency versions.
- Include development and production scripts.
- Include linting or type-checking scripts where suitable.
- Ensure package configuration files contain valid syntax.

DATABASE CONSISTENCY

The backend must remain consistent with the selected database:

MongoDB:
- use Mongoose when Express or NestJS is selected, unless the DSL specifies
  another supported data layer;
- use ObjectId references consistently;
- handle duplicate-key errors;
- enable timestamps where suitable;
- exclude password fields by default.

PostgreSQL:
- use a coherent SQL ORM or query strategy;
- use parameterized queries;
- keep table and column names consistent;
- implement relationships and transactions where required.

MySQL:
- use MySQL-compatible packages and syntax;
- use parameterized queries;
- keep table and column names consistent;
- implement transactions for multi-step writes where required.

EXPRESS REQUIREMENTS

When backend is express:

- use JavaScript ES modules;
- generate server/package.json;
- include "type": "module";
- generate server/src/index.js;
- generate server/src/app.js when useful;
- generate server/src/config/;
- generate server/src/controllers/;
- generate server/src/services/;
- generate server/src/routes/;
- generate server/src/middlewares/;
- generate server/src/models/ when models belong to the backend;
- generate server/src/validators/ when useful;
- generate server/src/utils/ when useful;
- use dotenv;
- use Express routers;
- add JSON parsing;
- configure CORS;
- add centralized error handling;
- add a not-found handler;
- add a health endpoint;
- use async error handling safely;
- use Mongoose for MongoDB when selected.

NESTJS REQUIREMENTS

When backend is nestjs:

- use TypeScript;
- generate server/package.json;
- generate server/tsconfig.json;
- generate server/nest-cli.json;
- generate server/src/main.ts;
- generate server/src/app.module.ts;
- use modules, controllers, services, DTOs, entities or schemas, and guards;
- use class-validator and class-transformer;
- use ConfigModule;
- use appropriate database integration;
- generate authentication guards when required;
- keep module imports consistent;
- avoid referencing undeclared modules.

SPRING BOOT REQUIREMENTS

When backend is spring-boot:

- use Java;
- generate server/pom.xml;
- generate a conventional Maven project;
- generate the application entry point;
- generate controllers;
- generate services;
- generate repositories;
- generate entities;
- generate DTOs;
- generate exception handling;
- generate validation annotations;
- generate security configuration when authentication is required;
- generate application.properties or application.yml;
- use environment placeholders for secrets and connection strings;
- keep package names consistent;
- use Spring Data for persistence.

TESTING REQUIREMENTS

Generate a small but useful test foundation when practical:

- health endpoint test;
- service or controller test for one major resource;
- authentication test when authentication is enabled.

Do not generate a large test suite that prevents the main application from
fitting within the response limit.

DOCUMENTATION REQUIREMENTS

Generate server/README.md containing:

- selected backend technology;
- project structure;
- setup instructions;
- environment variables;
- development command;
- production build or start command;
- API overview;
- authentication summary;
- database integration summary.

FINAL SELF-CHECK

Before responding, verify:

- every path is inside server/;
- every local import target exists;
- every external import is declared as a dependency;
- all JSON files contain valid JSON;
- all JavaScript or TypeScript imports use consistent module syntax;
- every DSL API endpoint has an implementation;
- authenticated routes are protected;
- every referenced model or entity exists;
- environment variables are documented;
- no duplicate paths exist;
- no unfinished placeholders remain;
- the application has a valid startup entry point.
`;

const normalizePath = (filePath) => {
  const normalizedPath = String(filePath || "")
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/");

  if (!normalizedPath) {
    throw new Error(
      "Backend Agent returned an empty file path."
    );
  }

  if (
    normalizedPath === ".." ||
    normalizedPath.startsWith("../") ||
    normalizedPath.includes("/../")
  ) {
    throw new Error(
      `Backend Agent generated an unsafe path: ${normalizedPath}`
    );
  }

  if (normalizedPath.startsWith("server/")) {
    return normalizedPath;
  }

  return `server/${normalizedPath}`;
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
    ".java": "java",
    ".xml": "xml",
    ".yml": "yaml",
    ".yaml": "yaml",
    ".md": "markdown",
    ".sql": "sql",
  };

  return languages[extension] || "plaintext";
};

const validateFilesResponse = (result) => {
  if (!result || typeof result !== "object") {
    throw new Error(
      "Backend Agent returned an invalid response."
    );
  }

  if (!Array.isArray(result.files)) {
    throw new Error(
      "Backend Agent response does not contain a files array."
    );
  }

  if (result.files.length === 0) {
    throw new Error(
      "Backend Agent returned no files."
    );
  }

  if (result.files.length > MAX_BACKEND_FILES) {
    throw new Error(
      `Backend Agent returned too many files: ${result.files.length}. Maximum allowed: ${MAX_BACKEND_FILES}.`
    );
  }

  const seenPaths = new Set();

  return result.files.map((file, index) => {
    if (!file || typeof file !== "object") {
      throw new Error(
        `Backend Agent returned an invalid file at index ${index}.`
      );
    }

    if (typeof file.path !== "string") {
      throw new Error(
        `Backend Agent returned a file without a valid path at index ${index}.`
      );
    }

    if (typeof file.content !== "string") {
      throw new Error(
        `Backend Agent returned a file without valid content: ${file.path}`
      );
    }

    const normalizedPath = normalizePath(file.path);

    if (!normalizedPath.startsWith("server/")) {
      throw new Error(
        `Backend Agent generated a file outside server/: ${normalizedPath}`
      );
    }

    if (seenPaths.has(normalizedPath)) {
      throw new Error(
        `Backend Agent returned a duplicate file: ${normalizedPath}`
      );
    }

    if (file.content.length > MAX_FILE_SIZE) {
      throw new Error(
        `Backend Agent returned an excessively large file: ${normalizedPath}`
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
    };
  });
};

const ensureFileExists = (
  paths,
  possiblePaths,
  description,
  backend
) => {
  const exists = possiblePaths.some((filePath) =>
    paths.has(filePath)
  );

  if (!exists) {
    throw new Error(
      `Backend Agent omitted ${description} for ${backend}. Expected one of: ${possiblePaths.join(
        ", "
      )}`
    );
  }
};

const ensureRequiredBackendFiles = (
  files,
  backend
) => {
  const paths = new Set(
    files.map((file) => file.path)
  );

  if (backend === "express") {
    ensureFileExists(
      paths,
      ["server/package.json"],
      "package.json",
      backend
    );

    ensureFileExists(
      paths,
      [
        "server/src/index.js",
        "server/src/index.mjs",
        "server/src/server.js",
      ],
      "an application entry point",
      backend
    );

    ensureFileExists(
      paths,
      ["server/.env.example"],
      "an environment example",
      backend
    );
  }

  if (backend === "nestjs") {
    ensureFileExists(
      paths,
      ["server/package.json"],
      "package.json",
      backend
    );

    ensureFileExists(
      paths,
      ["server/src/main.ts"],
      "the NestJS entry point",
      backend
    );

    ensureFileExists(
      paths,
      ["server/src/app.module.ts"],
      "the root NestJS module",
      backend
    );

    ensureFileExists(
      paths,
      ["server/tsconfig.json"],
      "TypeScript configuration",
      backend
    );
  }

  if (backend === "spring-boot") {
    ensureFileExists(
      paths,
      ["server/pom.xml"],
      "Maven configuration",
      backend
    );

    const hasApplicationEntry = files.some(
      (file) =>
        file.path.startsWith("server/src/main/java/") &&
        file.path.endsWith("Application.java")
    );

    if (!hasApplicationEntry) {
      throw new Error(
        "Backend Agent omitted the Spring Boot application entry point."
      );
    }

    ensureFileExists(
      paths,
      [
        "server/src/main/resources/application.properties",
        "server/src/main/resources/application.yml",
        "server/src/main/resources/application.yaml",
      ],
      "Spring Boot application configuration",
      backend
    );
  }

  return files;
};

const validatePackageJson = (files, backend) => {
  if (backend === "spring-boot") {
    return files;
  }

  const packageFile = files.find(
    (file) => file.path === "server/package.json"
  );

  if (!packageFile) {
    return files;
  }

  try {
    const packageJson = JSON.parse(packageFile.content);

    if (
      !packageJson.scripts ||
      typeof packageJson.scripts !== "object"
    ) {
      throw new Error(
        "server/package.json must define scripts."
      );
    }

    if (backend === "express") {
      if (packageJson.type !== "module") {
        throw new Error(
          'Express server/package.json must contain "type": "module".'
        );
      }

      if (
        !packageJson.scripts.start &&
        !packageJson.scripts.dev
      ) {
        throw new Error(
          "Express server/package.json must define a start or dev script."
        );
      }
    }

    if (backend === "nestjs") {
      if (!packageJson.scripts.start) {
        throw new Error(
          "NestJS server/package.json must define a start script."
        );
      }
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        "Backend Agent returned an invalid server/package.json."
      );
    }

    throw error;
  }

  return files;
};

const createBackendContext = (dsl) => ({
  projectName: dsl.projectName,
  description: dsl.description,
  backend: dsl.backend,
  database: dsl.database,
  authentication: dsl.authentication,
  entities: dsl.entities,
  api: dsl.api,
  features: dsl.features,
});

export const generateBackendFiles = async ({
  dsl,
  aiProvider = null,
}) => {
  if (!dsl || typeof dsl !== "object") {
    throw new Error(
      "Backend Agent requires a valid DSL object."
    );
  }

  const selectedBackend = String(
    dsl.backend || "express"
  )
    .trim()
    .toLowerCase();

  const allowedBackends = new Set([
    "express",
    "nestjs",
    "spring-boot",
  ]);

  if (!allowedBackends.has(selectedBackend)) {
    throw new Error(
      `Unsupported backend technology: ${selectedBackend}`
    );
  }

  const ai =
  aiProvider ||
  getProviderForAgent("backend");

  const result = await ai.generateJson({
    systemPrompt: buildSystemPrompt(),
    userPrompt: `
Generate the complete backend application described below.

SELECTED BACKEND

${selectedBackend}

SELECTED DATABASE

${dsl.database || "mongodb"}

APPLICATION BACKEND CONTEXT

${JSON.stringify(createBackendContext(dsl), null, 2)}

Return the complete backend implementation as the required JSON files response.
`,
    temperature: 0.1,
    maxTokens: 8192,
    schema: BACKEND_FILES_SCHEMA,
  });

  const validatedFiles =
    validateFilesResponse(result);

  ensureRequiredBackendFiles(
    validatedFiles,
    selectedBackend
  );

  validatePackageJson(
    validatedFiles,
    selectedBackend
  );

  return validatedFiles;
};