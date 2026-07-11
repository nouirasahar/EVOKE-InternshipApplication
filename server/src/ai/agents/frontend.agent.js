import { createAIProvider } from "../providers/provider.factory.js";

const buildSystemPrompt = () => `
You are the Frontend Agent of EVOKE, an AI full-stack application generator.

Your task is to generate a complete frontend application from a structured DSL.

Return only valid JSON using exactly this structure:

{
  "files": [
    {
      "path": "client/src/App.tsx",
      "content": "complete file source code",
      "language": "typescript"
    }
  ]
}

Rules:

1. Return only valid JSON.
2. Do not use Markdown code fences.
3. Every file must contain complete source code.
4. Generate frontend files only.
5. All returned paths should preferably start with "client/".
6. Do not generate backend, database, Docker, or root project files.
7. Respect the frontend technology selected in the DSL.
8. Use consistent imports and exports.
9. Do not reference files that are not returned.
10. Do not include secrets or credentials.
11. Keep the first generated version functional and reasonably small.

React + Vite:
- TypeScript
- client/package.json
- client/index.html
- client/tsconfig.json
- client/src/main.tsx
- client/src/App.tsx
- reusable pages and components

Next.js:
- TypeScript
- App Router
- client/package.json
- client/tsconfig.json
- client/next.config.*
- client/app/layout.tsx
- client/app/page.tsx
- reusable components

Angular:
- TypeScript
- client/angular.json
- client/package.json
- client/tsconfig.json
- client/tsconfig.app.json
- client/src/index.html
- client/src/main.ts
- client/src/app/app.component.ts
- client/src/app/app.component.html
- client/src/app/app.component.css
- Angular routing and components when required
`;

const normalizePath = (filePath) => {
  const normalizedPath = filePath
    .replaceAll("\\", "/")
    .replace(/^\/+/, "");

  if (normalizedPath.startsWith("client/")) {
    return normalizedPath;
  }

  return `client/${normalizedPath}`;
};

const validateFilesResponse = (result) => {
  if (!result || !Array.isArray(result.files)) {
    throw new Error(
      "Frontend Agent returned an invalid files response."
    );
  }

  if (result.files.length === 0) {
    throw new Error("Frontend Agent returned no files.");
  }

  const seenPaths = new Set();

  return result.files.map((file) => {
    if (
      !file ||
      typeof file.path !== "string" ||
      typeof file.content !== "string"
    ) {
      throw new Error(
        "Frontend Agent returned a malformed file entry."
      );
    }

    const normalizedPath = normalizePath(file.path);

    if (normalizedPath.includes("..")) {
      throw new Error(
        `Frontend Agent generated an unsafe path: ${normalizedPath}`
      );
    }

    if (seenPaths.has(normalizedPath)) {
      throw new Error(
        `Frontend Agent returned a duplicate file: ${normalizedPath}`
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

export const generateFrontendFiles = async ({ dsl }) => {
  if (!dsl || typeof dsl !== "object") {
    throw new Error(
      "Frontend Agent requires a valid DSL object."
    );
  }

  const ai = createAIProvider();

  const result = await ai.generateJson({
    systemPrompt: buildSystemPrompt(),
    userPrompt: `
Generate the complete frontend application described by this DSL.

Selected frontend:
${dsl.frontend || "react-vite"}

Application DSL:
${JSON.stringify(dsl, null, 2)}
`,
    temperature: 0.1,
    maxTokens: 10000,
  });

  return validateFilesResponse(result);
};