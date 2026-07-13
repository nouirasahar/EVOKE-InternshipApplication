import {
  getProviderForAgent,
} from "../providers/provider.factory.js";

const DSL_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "projectName",
    "description",
    "frontend",
    "backend",
    "database",
    "authentication",
    "pages",
    "entities",
    "api",
    "features",
  ],
  properties: {
    projectName: {
      type: "string",
    },
    description: {
      type: "string",
    },
    frontend: {
      type: "string",
    },
    backend: {
      type: "string",
    },
    database: {
      type: "string",
    },
    authentication: {
      type: "boolean",
    },
    pages: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "route", "purpose"],
        properties: {
          name: {
            type: "string",
          },
          route: {
            type: "string",
          },
          purpose: {
            type: "string",
          },
        },
      },
    },
    entities: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "fields"],
        properties: {
          name: {
            type: "string",
          },
          fields: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "name",
                "type",
                "required",
              ],
              properties: {
                name: {
                  type: "string",
                },
                type: {
                  type: "string",
                },
                required: {
                  type: "boolean",
                },
                unique: {
                  type: "boolean",
                },
                default: {},
                relation: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
    api: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "method",
          "path",
          "purpose",
        ],
        properties: {
          method: {
            type: "string",
          },
          path: {
            type: "string",
          },
          purpose: {
            type: "string",
          },
          authenticationRequired: {
            type: "boolean",
          },
          entity: {
            type: "string",
          },
        },
      },
    },
    features: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
};

const normalizeProjectName = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const normalizeRoute = (value) => {
  const route = String(value || "").trim();

  if (!route) {
    return "/";
  }

  return route.startsWith("/")
    ? route
    : `/${route}`;
};

const normalizeApiMethod = (value) => {
  const method = String(value || "GET")
    .trim()
    .toUpperCase();

  const allowedMethods = new Set([
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
  ]);

  return allowedMethods.has(method)
    ? method
    : "GET";
};

const validateDsl = ({
  dsl,
  requestedProjectName,
  requestedFrontend,
  requestedBackend,
  requestedDatabase,
}) => {
  if (!dsl || typeof dsl !== "object") {
    throw new Error(
      "DSL Agent returned an invalid response."
    );
  }

  const normalizedProjectName =
    normalizeProjectName(
      requestedProjectName ||
        dsl.projectName ||
        "evoke-generated-app"
    );

  const pages = Array.isArray(dsl.pages)
    ? dsl.pages.map((page, index) => ({
        name:
          typeof page?.name === "string" &&
          page.name.trim()
            ? page.name.trim()
            : `Page ${index + 1}`,
        route: normalizeRoute(page?.route),
        purpose:
          typeof page?.purpose === "string"
            ? page.purpose.trim()
            : "",
      }))
    : [];

  const entities = Array.isArray(dsl.entities)
    ? dsl.entities.map((entity, index) => ({
        name:
          typeof entity?.name === "string" &&
          entity.name.trim()
            ? entity.name.trim()
            : `Entity${index + 1}`,
        fields: Array.isArray(entity?.fields)
          ? entity.fields.map((field, fieldIndex) => ({
              name:
                typeof field?.name === "string" &&
                field.name.trim()
                  ? field.name.trim()
                  : `field${fieldIndex + 1}`,
              type:
                typeof field?.type === "string" &&
                field.type.trim()
                  ? field.type.trim()
                  : "string",
              required:
                typeof field?.required === "boolean"
                  ? field.required
                  : false,
              unique:
                typeof field?.unique === "boolean"
                  ? field.unique
                  : false,
              ...(field?.default !== undefined
                ? {
                    default: field.default,
                  }
                : {}),
              ...(typeof field?.relation === "string" &&
              field.relation.trim()
                ? {
                    relation:
                      field.relation.trim(),
                  }
                : {}),
            }))
          : [],
      }))
    : [];

  const api = Array.isArray(dsl.api)
    ? dsl.api.map((endpoint) => ({
        method: normalizeApiMethod(
          endpoint?.method
        ),
        path: normalizeRoute(endpoint?.path),
        purpose:
          typeof endpoint?.purpose === "string"
            ? endpoint.purpose.trim()
            : "",
        authenticationRequired:
          typeof endpoint?.authenticationRequired ===
          "boolean"
            ? endpoint.authenticationRequired
            : false,
        ...(typeof endpoint?.entity === "string" &&
        endpoint.entity.trim()
          ? {
              entity: endpoint.entity.trim(),
            }
          : {}),
      }))
    : [];

  const features = Array.isArray(dsl.features)
    ? [
        ...new Set(
          dsl.features
            .filter(
              (feature) =>
                typeof feature === "string"
            )
            .map((feature) => feature.trim())
            .filter(Boolean)
        ),
      ]
    : [];

  return {
    projectName: normalizedProjectName,
    description:
      typeof dsl.description === "string" &&
      dsl.description.trim()
        ? dsl.description.trim()
        : "Application generated by EVOKE.",
    frontend:
      requestedFrontend ||
      dsl.frontend ||
      "react-vite",
    backend:
      requestedBackend ||
      dsl.backend ||
      "express",
    database:
      requestedDatabase ||
      dsl.database ||
      "mongodb",
    authentication:
      typeof dsl.authentication === "boolean"
        ? dsl.authentication
        : false,
    pages,
    entities,
    api,
    features,
  };
};

export const generateDsl = async ({
  prompt,
  projectName,
  frontend,
  backend,
  database,
}) => {
  if (
    typeof prompt !== "string" ||
    prompt.trim().length < 5
  ) {
    throw new Error(
      "DSL Agent requires a valid user prompt."
    );
  }

  const selectedFrontend =
    frontend || "react-vite";
  const selectedBackend =
    backend || "express";
  const selectedDatabase =
    database || "mongodb";

  const ai = getProviderForAgent("dsl");

  const result = await ai.generateJson({
    systemPrompt: `
You are the DSL Agent of EVOKE, a professional AI full-stack application generator.

Your responsibility is to transform a natural-language product request into a strict, implementation-ready application blueprint.

Return only valid JSON.

The blueprint must include:

- a normalized project name;
- a concise product description;
- the exact selected frontend, backend, and database technologies;
- whether authentication is required;
- all major application pages;
- all relevant data entities and fields;
- all required API endpoints;
- all important product features.

Rules:

1. Respect the selected technologies exactly.
2. Do not replace the chosen frontend, backend, or database.
3. Do not add explanations outside the JSON.
4. Keep naming consistent across pages, entities, and API routes.
5. Use plural REST resource paths where appropriate.
6. Use realistic entities and fields for the requested domain.
7. Add authentication only when explicitly requested or clearly necessary.
8. Include login and registration pages when authentication is enabled.
9. Include CRUD endpoints for managed entities when appropriate.
10. Include authenticationRequired for protected API endpoints.
11. Include entity names on API entries when the route belongs to a specific entity.
12. Avoid duplicate pages, entities, endpoints, and features.
13. Keep the blueprint complete but reasonably small.
14. Use only these HTTP methods:
    GET, POST, PUT, PATCH, DELETE.
15. Use route paths beginning with "/".
16. Use data types such as:
    string, number, boolean, date, array, object, reference.
`,
    userPrompt: `
PROJECT CONFIGURATION

Project name:
${projectName || "Not provided"}

Frontend:
${selectedFrontend}

Backend:
${selectedBackend}

Database:
${selectedDatabase}

USER REQUEST

${prompt.trim()}

Generate the complete application blueprint.
`,
    temperature: 0.1,
    maxTokens: 3500,
    schema: DSL_SCHEMA,
  });

  return validateDsl({
    dsl: result,
    requestedProjectName: projectName,
    requestedFrontend: selectedFrontend,
    requestedBackend: selectedBackend,
    requestedDatabase: selectedDatabase,
  });
};