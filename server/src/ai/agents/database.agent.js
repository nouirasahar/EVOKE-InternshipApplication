import path from "path";
import {
  getProviderForAgent,
} from "../providers/provider.factory.js";

const MAX_DATABASE_FILES = 35;
const MAX_FILE_SIZE = 80_000;

const DATABASE_FILES_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["files"],
  properties: {
    files: {
      type: "array",
      minItems: 1,
      maxItems: MAX_DATABASE_FILES,
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
You are the Database Agent of EVOKE, a professional AI full-stack application generator.

Your responsibility is to transform the supplied application DSL into a complete,
consistent, secure, and implementation-ready persistence layer.

Return only valid JSON using exactly this structure:

{
  "files": [
    {
      "path": "database/schema.sql",
      "content": "complete file content",
      "language": "sql"
    }
  ]
}

GENERAL OUTPUT RULES

1. Return only valid JSON.
2. Never return Markdown code fences.
3. Generate database files only.
4. Every returned path must be inside database/.
5. Generate complete files, not fragments or placeholders.
6. Never return TODO comments or unfinished sections.
7. Respect the selected database technology exactly.
8. Model every relevant entity defined in the DSL.
9. Keep names consistent with the DSL, frontend, and backend layers.
10. Do not include secrets, credentials, tokens, or real connection strings.
11. Do not reference files that are not returned.
12. Return no more than ${MAX_DATABASE_FILES} files.
13. Keep the first version compact but fully usable.

DATA MODEL QUALITY

For every entity:

- include a primary identifier;
- include required and optional fields correctly;
- include timestamps where appropriate;
- include unique constraints where the DSL indicates uniqueness;
- include indexes for frequently queried fields;
- include relationships and references;
- include validation rules;
- use sensible defaults;
- use consistent naming conventions.

RELATIONSHIP RULES

- Use one-to-one, one-to-many, and many-to-many relations appropriately.
- Prevent circular or contradictory relationships.
- Keep relation names consistent with backend models and API resources.
- Use cascade behavior only when it is safe and justified.
- Avoid orphan records where appropriate.

SECURITY AND INTEGRITY

- Never store plaintext passwords.
- Use fields suitable for hashed credentials when authentication is enabled.
- Add uniqueness constraints for email or username fields when appropriate.
- Use soft-delete fields only if the domain clearly benefits from them.
- Add validation and integrity constraints.
- Do not seed real secrets or personally identifiable data.

MONGODB REQUIREMENTS

When database is mongodb:

- use Mongoose;
- use JavaScript ES modules;
- generate database/models/*.model.js;
- add Schema validation;
- add defaults, refs, indexes, and timestamps;
- add unique indexes where appropriate;
- generate database/seed.js;
- generate database/README.md;
- generate database/indexes.md or database/indexes.js when useful;
- use ObjectId references consistently;
- avoid duplicating server models unless the architecture explicitly requires
  an independent database package.

POSTGRESQL REQUIREMENTS

When database is postgresql:

- generate database/schema.sql;
- use PostgreSQL-compatible syntax;
- use UUID or BIGSERIAL primary keys consistently;
- add foreign keys, constraints, indexes, and timestamps;
- add junction tables for many-to-many relationships;
- generate database/seed.sql;
- generate database/README.md;
- generate database/migrations/001_initial.sql when appropriate;
- use CHECK constraints and enums where useful.

MYSQL REQUIREMENTS

When database is mysql:

- generate database/schema.sql;
- use MySQL-compatible syntax;
- use AUTO_INCREMENT or UUID consistently;
- add primary keys, foreign keys, indexes, and timestamps;
- add junction tables for many-to-many relationships;
- generate database/seed.sql;
- generate database/README.md;
- generate database/migrations/001_initial.sql when appropriate;
- use suitable MySQL data types and engine settings.

SEED DATA REQUIREMENTS

- Generate realistic but clearly fictional development data.
- Keep seed data small.
- Preserve referential integrity.
- Never include passwords in plaintext.
- Use placeholder password hashes if authentication is required.
- Ensure seed scripts are repeatable when possible.

README REQUIREMENTS

The database README should include:

- selected database technology;
- generated structure;
- setup instructions;
- migration instructions;
- seed instructions;
- environment variables required;
- schema overview;
- relationship summary;
- indexing notes.

FINAL SELF-CHECK

Before responding, verify:

- every file path is inside database/;
- every local import target exists;
- all JSON files are valid JSON;
- all SQL files use the correct dialect;
- all Mongoose models use valid ES module syntax;
- all relations reference valid entities;
- all required entities from the DSL are represented;
- seed data matches the generated schema;
- no duplicate paths exist;
- no unfinished placeholders remain.
`;

const normalizePath = (filePath) => {
  const normalizedPath = String(filePath || "")
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/");

  if (!normalizedPath) {
    throw new Error(
      "Database Agent returned an empty file path."
    );
  }

  if (
    normalizedPath === ".." ||
    normalizedPath.startsWith("../") ||
    normalizedPath.includes("/../")
  ) {
    throw new Error(
      `Database Agent generated an unsafe path: ${normalizedPath}`
    );
  }

  if (normalizedPath.startsWith("database/")) {
    return normalizedPath;
  }

  return `database/${normalizedPath}`;
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
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".ts": "typescript",
    ".json": "json",
    ".sql": "sql",
    ".md": "markdown",
    ".yml": "yaml",
    ".yaml": "yaml",
    ".prisma": "prisma",
  };

  return languages[extension] || "plaintext";
};

const validateFilesResponse = (result) => {
  if (!result || typeof result !== "object") {
    throw new Error(
      "Database Agent returned an invalid response."
    );
  }

  if (!Array.isArray(result.files)) {
    throw new Error(
      "Database Agent response does not contain a files array."
    );
  }

  if (result.files.length === 0) {
    throw new Error(
      "Database Agent returned no files."
    );
  }

  if (result.files.length > MAX_DATABASE_FILES) {
    throw new Error(
      `Database Agent returned too many files: ${result.files.length}. Maximum allowed: ${MAX_DATABASE_FILES}.`
    );
  }

  const seenPaths = new Set();

  return result.files.map((file, index) => {
    if (!file || typeof file !== "object") {
      throw new Error(
        `Database Agent returned an invalid file at index ${index}.`
      );
    }

    if (typeof file.path !== "string") {
      throw new Error(
        `Database Agent returned a file without a valid path at index ${index}.`
      );
    }

    if (typeof file.content !== "string") {
      throw new Error(
        `Database Agent returned a file without valid content: ${file.path}`
      );
    }

    const normalizedPath = normalizePath(file.path);

    if (!normalizedPath.startsWith("database/")) {
      throw new Error(
        `Database Agent generated a file outside database/: ${normalizedPath}`
      );
    }

    if (seenPaths.has(normalizedPath)) {
      throw new Error(
        `Database Agent returned a duplicate file: ${normalizedPath}`
      );
    }

    if (file.content.length > MAX_FILE_SIZE) {
      throw new Error(
        `Database Agent returned an excessively large file: ${normalizedPath}`
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

const ensureRequiredDatabaseFiles = (
  files,
  database
) => {
  const paths = new Set(
    files.map((file) => file.path)
  );

  const requiredByDatabase = {
    mongodb: [
      "database/README.md",
      "database/seed.js",
    ],
    postgresql: [
      "database/schema.sql",
      "database/seed.sql",
      "database/README.md",
    ],
    mysql: [
      "database/schema.sql",
      "database/seed.sql",
      "database/README.md",
    ],
  };

  const requiredFiles =
    requiredByDatabase[database] || [];

  const missingFiles = requiredFiles.filter(
    (requiredPath) => !paths.has(requiredPath)
  );

  if (missingFiles.length > 0) {
    throw new Error(
      `Database Agent omitted required files for ${database}: ${missingFiles.join(
        ", "
      )}`
    );
  }

  if (database === "mongodb") {
    const hasModelFile = files.some(
      (file) =>
        file.path.startsWith("database/models/") &&
        file.path.endsWith(".model.js")
    );

    if (!hasModelFile) {
      throw new Error(
        "Database Agent omitted MongoDB model files under database/models/."
      );
    }
  }

  return files;
};

const createDatabaseContext = (dsl) => {
  return {
    projectName: dsl.projectName,
    description: dsl.description,
    database: dsl.database,
    authentication: dsl.authentication,
    entities: dsl.entities,
    api: dsl.api,
    features: dsl.features,
  };
};

export const generateDatabaseFiles = async ({
  dsl,
}) => {
  if (!dsl || typeof dsl !== "object") {
    throw new Error(
      "Database Agent requires a valid DSL object."
    );
  }

  const selectedDatabase =
    String(dsl.database || "mongodb").toLowerCase();

  const allowedDatabases = new Set([
    "mongodb",
    "postgresql",
    "mysql",
  ]);

  if (!allowedDatabases.has(selectedDatabase)) {
    throw new Error(
      `Unsupported database technology: ${selectedDatabase}`
    );
  }

  const ai = getProviderForAgent("database");

  const result = await ai.generateJson({
    systemPrompt: buildSystemPrompt(),
    userPrompt: `
Generate the complete persistence layer described below.

SELECTED DATABASE

${selectedDatabase}

APPLICATION DATABASE CONTEXT

${JSON.stringify(createDatabaseContext(dsl), null, 2)}

Return the complete database implementation as the required JSON files response.
`,
    temperature: 0.1,
    maxTokens: 6500,
    schema: DATABASE_FILES_SCHEMA,
  });

  const validatedFiles =
    validateFilesResponse(result);

  return ensureRequiredDatabaseFiles(
    validatedFiles,
    selectedDatabase
  );
};