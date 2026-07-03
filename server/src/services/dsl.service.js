import { slugify } from "../utils/slugify.js";

export const createDslFromPrompt = (prompt) => {
  const projectName = slugify(prompt).slice(0, 40) || "evoke-app";

  return {
    projectName,
    originalPrompt: prompt,
    app: {
      name: projectName,
      type: "full-stack-web-application",
      description: prompt
    },
    pages: [
      {
        name: "Dashboard",
        route: "/",
        components: ["Header", "StatsCards", "DataTable"]
      }
    ],
    entities: [
      {
        name: "Item",
        fields: [
          { name: "id", type: "string" },
          { name: "title", type: "string" },
          { name: "status", type: "string" }
        ]
      }
    ],
    features: ["create", "read", "update", "delete"]
  };
};