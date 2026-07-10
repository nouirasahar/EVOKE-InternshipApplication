import { createAIProvider } from "../providers/provider.factory.js";

export const generateDsl = async ({
  prompt,
  projectName,
  frontend,
  backend,
  database,
}) => {
  const ai = createAIProvider();

  return ai.generateJson({
    systemPrompt: `
You are the DSL Agent of EVOKE, an AI full-stack application generator.

Convert the user's request into a strict JSON application blueprint.

Return only valid JSON with this structure:

{
  "projectName": "string",
  "description": "string",
  "frontend": "string",
  "backend": "string",
  "database": "string",
  "authentication": true,
  "pages": [
    {
      "name": "string",
      "route": "string",
      "purpose": "string"
    }
  ],
  "entities": [
    {
      "name": "string",
      "fields": [
        {
          "name": "string",
          "type": "string",
          "required": true
        }
      ]
    }
  ],
  "api": [
    {
      "method": "GET",
      "path": "/api/example",
      "purpose": "string"
    }
  ],
  "features": ["string"]
}

Respect the selected technologies exactly.
Do not add explanations outside the JSON.
    `,
    userPrompt: `
Project name: ${projectName || "Not provided"}
Frontend: ${frontend}
Backend: ${backend}
Database: ${database}

User request:
${prompt}
    `,
    temperature: 0.1,
    maxTokens: 3000,
  });
};