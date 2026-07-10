import { createAIProvider } from "../providers/provider.factory.js";

const buildSystemPrompt = () => `
You are the Frontend Agent of EVOKE, an AI full-stack application generator.

Your task is to generate a complete frontend application from a structured DSL.

Return only valid JSON using exactly this structure:

{
  "files": [
    {
      "path": "client/src/App.tsx",
      "content": "file source code",
      "language": "typescript"
    }
  ]
}

Rules:

1. Return only JSON. Do not use Markdown code fences.
2. Every file must contain complete, valid source code.
3. Use the frontend technology selected in the DSL.
4. For react-vite:
   - use React
   - use TypeScript
   - use Vite
   - create reusable components
   - create responsive styling
   - generate package.json
   - generate index.html
   - generate tsconfig.json
   - generate src/main.tsx
   - generate src/App.tsx
   - generate pages and components when needed
5. Do not generate backend or database files.
6. Use relative imports consistently.
7. Do not reference files that are not included in the response.
8. Do not include secrets or real credentials.
9. The application should be coherent with the pages, features, entities, and routes in the DSL.
10. Keep the first generated version functional and reasonably small.
`;

const validateFilesResponse = (result) => {
  if (!result || !Array.isArray(result.files)) {
    throw new Error("Frontend Agent returned an invalid files response.");
  }

  if (result.files.length === 0) {
    throw new Error("Frontend Agent returned no files.");
  }

  for (const file of result.files) {
    if (
      !file ||
      typeof file.path !== "string" ||
      typeof file.content !== "string"
    ) {
      throw new Error(
        "Frontend Agent returned a malformed file entry."
      );
    }

    if (!file.path.startsWith("client/")) {
      throw new Error(
        `Frontend Agent generated a file outside client/: ${file.path}`
      );
    }
  }

  return result.files.map((file) => ({
    path: file.path.replaceAll("\\", "/"),
    content: file.content,
    language: file.language || "text",
  }));
};

export const generateFrontendFiles = async ({ dsl }) => {
  const ai = createAIProvider();

  const result = await ai.generateJson({
    systemPrompt: buildSystemPrompt(),
    userPrompt: `
Generate the frontend application described by the following DSL.

DSL:
${JSON.stringify(dsl, null, 2)}
`,
    temperature: 0.1,
    maxTokens: 8000,
  });

  return validateFilesResponse(result);
};