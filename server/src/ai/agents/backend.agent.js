import { createAIProvider } from "../providers/provider.factory.js";

const buildSystemPrompt = () => `
You are the Backend Agent of EVOKE, an AI full-stack application generator.

Your task is to generate a complete backend implementation from a structured DSL.

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

Rules:

1. Return only valid JSON. Do not use Markdown code fences.
2. Generate only files inside the server/ directory.
3. Respect the backend technology selected in the DSL.
4. Respect the database technology selected in the DSL.
5. Generate complete files, not fragments or placeholders.
6. Implement the entities, API routes, authentication, and features described in the DSL.
7. Use a professional layered architecture when appropriate:
   - config
   - models or entities
   - controllers
   - services
   - routes
   - middlewares
   - utils
8. Generate package configuration and environment examples.
9. Do not include secrets or real credentials.
10. Do not reference files that are not returned.
11. Use consistent imports and exports.
12. Add centralized error handling.
13. Add input validation for important endpoints.
14. Keep the first version functional and reasonably small.

For Express:
- use JavaScript ES modules;
- generate server/package.json;
- generate server/src/index.js;
- use Express routers;
- use dotenv;
- add CORS and JSON parsing;
- generate database connection code;
- generate models, controllers, routes, and middleware.

For NestJS:
- use TypeScript;
- generate a conventional NestJS module structure.

For Spring Boot:
- use Java;
- generate Maven configuration;
- use controller, service, repository, entity, and configuration layers.
`;

const validateFilesResponse = (result) => {
  if (!result || !Array.isArray(result.files)) {
    throw new Error("Backend Agent returned an invalid files response.");
  }

  if (result.files.length === 0) {
    throw new Error("Backend Agent returned no files.");
  }

  return result.files.map((file) => {
    if (
      !file ||
      typeof file.path !== "string" ||
      typeof file.content !== "string"
    ) {
      throw new Error("Backend Agent returned a malformed file entry.");
    }

    const normalizedPath = file.path.replaceAll("\\", "/");

    if (!normalizedPath.startsWith("server/")) {
      throw new Error(
        `Backend Agent generated a file outside server/: ${normalizedPath}`
      );
    }

    return {
      path: normalizedPath,
      content: file.content,
      language: file.language || "text",
    };
  });
};

export const generateBackendFiles = async ({ dsl }) => {
  const ai = createAIProvider();

  const result = await ai.generateJson({
    systemPrompt: buildSystemPrompt(),
    userPrompt: `
Generate the backend application described by this DSL.

DSL:
${JSON.stringify(dsl, null, 2)}
`,
    temperature: 0.1,
    maxTokens: 10000,
  });

  return validateFilesResponse(result);
};