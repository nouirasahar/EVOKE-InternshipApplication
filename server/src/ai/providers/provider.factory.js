import { GeminiProvider } from "./gemini/gemini.provider.js";
import { GroqProvider } from "./groq/groq.provider.js";

const SUPPORTED_PROVIDERS = new Set([
  "groq",
  "gemini",
]);

const providerInstances = new Map();

function normalizeProviderName(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeAgentType(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_");
}

function createProviderInstance(providerName) {
  switch (providerName) {
    case "groq":
      return new GroqProvider();

    case "gemini":
      return new GeminiProvider();

    default:
      throw new Error(
        `Unsupported AI provider: ${providerName}`
      );
  }
}

function getProviderInstance(providerName) {
  const normalizedProviderName =
    normalizeProviderName(providerName);

  if (!SUPPORTED_PROVIDERS.has(normalizedProviderName)) {
    throw new Error(
      `Unsupported AI provider: ${normalizedProviderName}`
    );
  }

  if (!providerInstances.has(normalizedProviderName)) {
    const providerInstance =
      createProviderInstance(normalizedProviderName);

    providerInstances.set(
      normalizedProviderName,
      providerInstance
    );
  }

  return providerInstances.get(normalizedProviderName);
}

export function getProviderForAgent(agentType) {
  if (!agentType || typeof agentType !== "string") {
    throw new Error(
      "A valid agent type is required."
    );
  }

  const normalizedAgentType =
    normalizeAgentType(agentType);

  const agentEnvironmentKey =
    `AI_PROVIDER_${normalizedAgentType}`;

  const configuredProvider =
    process.env[agentEnvironmentKey] ||
    process.env.AI_PROVIDER_DEFAULT ||
    process.env.AI_PROVIDER ||
    "groq";

  const providerName =
    normalizeProviderName(configuredProvider);

  console.log(
    `[AI Router] ${normalizedAgentType} → ${providerName}`
  );

  return getProviderInstance(providerName);
}

export function createAIProvider() {
  const configuredProvider =
    process.env.AI_PROVIDER_DEFAULT ||
    process.env.AI_PROVIDER ||
    "groq";

  const providerName =
    normalizeProviderName(configuredProvider);

  console.log(
    `[AI Router] DEFAULT → ${providerName}`
  );

  return getProviderInstance(providerName);
}
export const getProviderByName = (
  providerName
) => {
  return getProviderInstance(
    String(providerName || "")
      .trim()
      .toLowerCase()
  );
};
export function clearProviderCache() {
  providerInstances.clear();
}