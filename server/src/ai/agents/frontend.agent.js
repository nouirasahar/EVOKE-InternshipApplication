import path from "path";
import {
  getProviderForAgent,
} from "../providers/provider.factory.js";

const MAX_FILES = 45;
const MAX_FILE_SIZE = 60_000;

const FRONTEND_FILES_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["files"],
  properties: {
    files: {
      type: "array",
      minItems: 1,
      maxItems: MAX_FILES,
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
You are the UI and Frontend Agent of EVOKE, a professional AI-powered
full-stack application generator.

Your responsibility is to transform the supplied application DSL into a
complete, coherent, visually polished, responsive, and runnable frontend.

Return only valid JSON using exactly this structure:

{
  "files": [
    {
      "path": "client/src/App.tsx",
      "content": "complete source code",
      "language": "typescript"
    }
  ]
}

GENERAL OUTPUT RULES

1. Return only valid JSON.
2. Never return Markdown code fences.
3. Every returned file must be complete and runnable.
4. Generate frontend files only.
5. Every file path must be inside client/.
6. Do not generate server/, database/, docker/, or unrelated root files.
7. Never use placeholders such as:
   - TODO
   - implementation here
   - content goes here
   - add logic later
8. Never reference a local file that is not included in the response.
9. Never import a package that is not declared in client/package.json.
10. Use consistent filenames, imports, exports, routes, and component names.
11. Do not include API keys, credentials, tokens, or secrets.
12. Keep the initial application reasonably small, but fully functional.
13. Return no more than ${MAX_FILES} files.

DESIGN QUALITY REQUIREMENTS

The generated application must look like a production-grade product, not a
basic educational demo.

Create:

- a coherent visual identity;
- a professional typography hierarchy;
- consistent spacing and sizing;
- polished cards, buttons, inputs, navigation, and empty states;
- responsive desktop, tablet, and mobile layouts;
- accessible contrast and keyboard-friendly controls;
- loading, empty, success, and error states where relevant;
- reusable layout and UI components;
- realistic sample content relevant to the requested domain.

Avoid:

- generic unstyled HTML;
- excessive gradients;
- random colors;
- oversized headings without structure;
- emoji as primary interface icons;
- duplicated components;
- inline styles unless technically necessary;
- placeholder pages containing only a title and paragraph.

ACCESSIBILITY REQUIREMENTS

- Associate every label with its form control.
- Add id and name attributes to form fields.
- Use semantic HTML elements.
- Add aria-label attributes to icon-only buttons.
- Ensure buttons use type="button" unless they submit a form.
- Provide descriptive alt text for meaningful images.
- Maintain visible keyboard focus states.

APPLICATION ARCHITECTURE

Generate reusable components when appropriate:

- application shell;
- navigation;
- header;
- sidebar;
- page layouts;
- cards;
- forms;
- tables;
- dialogs;
- feedback states;
- reusable UI primitives.

Generate pages based on the DSL.

Connect page navigation using the routing approach appropriate for the
selected frontend framework.

API INTEGRATION

When the DSL defines backend APIs:

- create a centralized API client;
- use an environment-based API URL;
- generate typed service functions where possible;
- include loading and error handling;
- do not hardcode secrets;
- keep endpoint paths consistent with the DSL.

AUTHENTICATION

When authentication is requested:

- generate login and registration interfaces;
- include protected-route behavior;
- create a clear authentication service or context;
- store tokens cautiously;
- do not include fake real credentials;
- keep the implementation consistent with the backend routes in the DSL.

REACT + VITE REQUIREMENTS

When frontend is react-vite:

- use React and TypeScript;
- use React Router when multiple pages exist;
- generate client/package.json;
- generate client/index.html;
- generate client/tsconfig.json;
- generate client/vite.config.ts when needed;
- generate client/src/main.tsx;
- generate client/src/App.tsx;
- generate client/src/styles.css;
- generate reusable pages and components;
- use functional components and hooks;
- avoid deprecated React patterns.

NEXT.JS REQUIREMENTS

When frontend is nextjs:

- use TypeScript;
- use the App Router;
- generate client/package.json;
- generate client/tsconfig.json;
- generate client/next.config.* when needed;
- generate client/app/layout.tsx;
- generate client/app/page.tsx;
- generate client/app/globals.css;
- generate reusable components;
- use client components only where required.

ANGULAR REQUIREMENTS

When frontend is angular:

- use TypeScript;
- generate client/angular.json;
- generate client/package.json;
- generate client/tsconfig.json;
- generate client/tsconfig.app.json;
- generate client/src/index.html;
- generate client/src/main.ts;
- generate client/src/styles.css;
- generate the application component;
- generate routing and feature components where needed;
- keep Angular imports and module configuration consistent.

PACKAGE MANAGEMENT RULES

- Include every external dependency used by the source code.
- Do not include unnecessary dependencies.
- Use mutually compatible dependency versions.
- Add scripts for development and production builds.
- Ensure package.json contains valid JSON.

CSS AND THEMING

- Generate a complete responsive stylesheet.
- Use CSS custom properties for key colors, spacing, and surfaces.
- Include hover, focus, active, disabled, loading, and error states.
- Prefer a restrained and professional color system.
- Ensure the layout works at narrow viewport widths.

FINAL SELF-CHECK

Before responding, verify:

- every local import target exists;
- every route component exists;
- package dependencies match imports;
- all JSON files contain valid JSON;
- all JSX and TSX tags are closed correctly;
- every generated path is inside client/;
- the application contains no unfinished placeholders.
`;

const normalizePath = (filePath) => {
  const normalizedPath = String(filePath || "")
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/");

  if (!normalizedPath) {
    throw new Error(
      "Frontend Agent returned an empty file path."
    );
  }

  if (
    normalizedPath === ".." ||
    normalizedPath.startsWith("../") ||
    normalizedPath.includes("/../")
  ) {
    throw new Error(
      `Frontend Agent generated an unsafe path: ${normalizedPath}`
    );
  }

  if (normalizedPath.startsWith("client/")) {
    return normalizedPath;
  }

  return `client/${normalizedPath}`;
};

const detectLanguage = (filePath) => {
  const fileName = path.basename(filePath).toLowerCase();
  const extension = path.extname(filePath).toLowerCase();

  if (
    fileName === ".env" ||
    fileName === ".env.example"
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
    ".xml": "xml",
    ".yml": "yaml",
    ".yaml": "yaml",
  };

  return languages[extension] || "plaintext";
};

const validateFilesResponse = (result) => {
  if (!result || typeof result !== "object") {
    throw new Error(
      "Frontend Agent returned an invalid response."
    );
  }

  if (!Array.isArray(result.files)) {
    throw new Error(
      "Frontend Agent response does not contain a files array."
    );
  }

  if (result.files.length === 0) {
    throw new Error(
      "Frontend Agent returned no files."
    );
  }

  if (result.files.length > MAX_FILES) {
    throw new Error(
      `Frontend Agent returned too many files: ${result.files.length}. Maximum allowed: ${MAX_FILES}.`
    );
  }

  const seenPaths = new Set();

  return result.files.map((file, index) => {
    if (!file || typeof file !== "object") {
      throw new Error(
        `Frontend Agent returned an invalid file at index ${index}.`
      );
    }

    if (typeof file.path !== "string") {
      throw new Error(
        `Frontend Agent returned a file without a valid path at index ${index}.`
      );
    }

    if (typeof file.content !== "string") {
      throw new Error(
        `Frontend Agent returned a file without valid content: ${file.path}`
      );
    }

    const normalizedPath = normalizePath(file.path);

    if (!normalizedPath.startsWith("client/")) {
      throw new Error(
        `Frontend Agent generated a file outside client/: ${normalizedPath}`
      );
    }

    if (seenPaths.has(normalizedPath)) {
      throw new Error(
        `Frontend Agent returned a duplicate file: ${normalizedPath}`
      );
    }

    if (file.content.length > MAX_FILE_SIZE) {
      throw new Error(
        `Frontend Agent returned an excessively large file: ${normalizedPath}`
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

const ensureRequiredFrontendFiles = (
  files,
  frontend
) => {
  const paths = new Set(
    files.map((file) => file.path)
  );

  const requiredByFramework = {
    "react-vite": [
      "client/package.json",
      "client/index.html",
      "client/src/main.tsx",
      "client/src/App.tsx",
    ],
    nextjs: [
      "client/package.json",
      "client/app/layout.tsx",
      "client/app/page.tsx",
    ],
    angular: [
      "client/package.json",
      "client/angular.json",
      "client/src/main.ts",
      "client/src/index.html",
    ],
  };

  const requiredFiles =
    requiredByFramework[frontend] || [];

  const missingFiles = requiredFiles.filter(
    (requiredPath) => !paths.has(requiredPath)
  );

  if (missingFiles.length > 0) {
    throw new Error(
      `Frontend Agent omitted required files for ${frontend}: ${missingFiles.join(
        ", "
      )}`
    );
  }

  return files;
};

export const generateFrontendFiles = async ({
  dsl,
  designSystem = null,
}) => {
  if (!dsl || typeof dsl !== "object") {
    throw new Error(
      "Frontend Agent requires a valid DSL object."
    );
  }

  const selectedFrontend =
    dsl.frontend || "react-vite";

  const ai = getProviderForAgent("ui");

  const result = await ai.generateJson({
    systemPrompt: buildSystemPrompt(),
    userPrompt: `
Generate the complete frontend application described below.

SELECTED FRONTEND

${selectedFrontend}

APPLICATION DSL

${JSON.stringify(dsl, null, 2)}

DESIGN SYSTEM

${
  designSystem
    ? JSON.stringify(designSystem, null, 2)
    : `No separate design system was supplied.

Create a coherent professional design system suitable for the application's
domain. Use a restrained color palette, consistent spacing, accessible
typography, polished interactive states, and responsive layouts.`
}

Return the complete application as the required JSON files response.
`,
    temperature: 0.2,
    maxTokens: 8192,
    schema: FRONTEND_FILES_SCHEMA,
  });

  const validatedFiles =
    validateFilesResponse(result);

  return ensureRequiredFrontendFiles(
    validatedFiles,
    selectedFrontend
  );
};