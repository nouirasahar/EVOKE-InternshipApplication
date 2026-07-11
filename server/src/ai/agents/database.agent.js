import { createAIProvider } from "../providers/provider.factory.js";

const buildSystemPrompt = () => `
You are the Database Agent of EVOKE, an AI full-stack application generator.

Your task is to generate the persistence layer from a structured application DSL.

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

General rules:

1. Return only valid JSON.
2. Do not use Markdown code fences.
3. Generate only files inside the database/ directory.
4. Respect the database technology selected in the DSL.
5. Generate complete files, not fragments or placeholders.
6. Model every relevant entity defined in the DSL.
7. Include appropriate relationships between entities.
8. Include indexes for commonly queried and unique fields.
9. Include timestamps where appropriate.
10. Do not include secrets or real credentials.
11. Do not reference files that are not returned.
12. Keep names consistent with the frontend and backend agents.
13. Include realistic development seed data when appropriate.
14. Add a concise database README explaining setup and structure.

MongoDB rules:

- Generate database/models/*.model.js using Mongoose.
- Use JavaScript ES modules.
- Add validation, defaults, references, indexes, and timestamps.
- Generate database/seed.js.
- Generate database/README.md.
- Avoid duplicating models already generated under server/ unless the
  database layer is explicitly intended to be independent.

PostgreSQL rules:

- Generate database/schema.sql.
- Use primary keys, foreign keys, constraints, indexes, and timestamps.
- Generate database/seed.sql.
- Generate database/README.md.

MySQL rules:

- Generate database/schema.sql.
- Use compatible MySQL syntax.
- Add primary keys, foreign keys, constraints, indexes, and timestamps.
- Generate database/seed.sql.
- Generate database/README.md.
`;

const normalizePath = (filePath) => {
  return filePath.replaceAll("\\", "/").replace(/^\/+/, "");
};

const validateFilesResponse = (result) => {
  if (!result || !Array.isArray(result.files)) {
    throw new Error(
      "Database Agent returned an invalid files response."
    );
  }

  if (result.files.length === 0) {
    throw new Error("Database Agent returned no files.");
  }

  const seenPaths = new Set();

  return result.files.map((file) => {
    if (
      !file ||
      typeof file.path !== "string" ||
      typeof file.content !== "string"
    ) {
      throw new Error(
        "Database Agent returned a malformed file entry."
      );
    }

    const normalizedPath = normalizePath(file.path);

    if (!normalizedPath.startsWith("database/")) {
      throw new Error(
        `Database Agent generated a file outside database/: ${normalizedPath}`
      );
    }

    if (normalizedPath.includes("..")) {
      throw new Error(
        `Database Agent generated an unsafe path: ${normalizedPath}`
      );
    }

    if (seenPaths.has(normalizedPath)) {
      throw new Error(
        `Database Agent returned a duplicate file: ${normalizedPath}`
      );
    }

    seenPaths.add(normalizedPath);

    return {
      path: normalizedPath,
      content: file.content,
      language: file.language || "text",
    };
  });
};

export const generateDatabaseFiles = async ({ dsl }) => {
  if (!dsl || typeof dsl !== "object") {
    throw new Error(
      "Database Agent requires a valid DSL object."
    );
  }

  const ai = createAIProvider();

  const result = await ai.generateJson({
    systemPrompt: buildSystemPrompt(),
    userPrompt: `
Generate the complete database layer described by this DSL.

Selected database:
${dsl.database || "mongodb"}

Application DSL:
${JSON.stringify(dsl, null, 2)}
`,
    temperature: 0.1,
    maxTokens: 8000,
  });

  return validateFilesResponse(result);
};