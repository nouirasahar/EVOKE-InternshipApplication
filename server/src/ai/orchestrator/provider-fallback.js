import {
  getProviderByName,
} from "../providers/provider.factory.js";

import {
  isRetryableError,
  withRetry,
} from "./retry.policy.js";

const normalizeProviderName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeAgentType = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_");

export const getConfiguredProviderName = (
  agentType
) => {
  const normalizedAgentType =
    normalizeAgentType(agentType);

  return normalizeProviderName(
    process.env[
      `AI_PROVIDER_${normalizedAgentType}`
    ] ||
      process.env.AI_PROVIDER_DEFAULT ||
      "groq"
  );
};

export const getFallbackProviderName = (
  primaryProviderName
) => {
  const configuredFallback =
    normalizeProviderName(
      process.env.AI_PROVIDER_FALLBACK
    );

  if (
    configuredFallback &&
    configuredFallback !==
      primaryProviderName
  ) {
    return configuredFallback;
  }

  if (primaryProviderName === "gemini") {
    return "groq";
  }

  if (primaryProviderName === "groq") {
    return "gemini";
  }

  return null;
};

const shouldUseFallback = (error) => {
  const status = Number(
    error?.status ||
      error?.response?.status
  );

  /*
   * Do not use another provider for local validation,
   * malformed inputs, or application code errors.
   */
  if (
    status >= 400 &&
    status < 500 &&
    status !== 408 &&
    status !== 429
  ) {
    return false;
  }

  return isRetryableError(error);
};

export const executeWithProviderFallback =
  async ({
    agentType,
    execute,
    tracker,
    trackerAgentName,
    primaryProviderName,
    fallbackProviderName,
    retries = 1,
  }) => {
    if (typeof execute !== "function") {
      throw new Error(
        "executeWithProviderFallback requires an execute function."
      );
    }

    const primaryName =
      normalizeProviderName(
        primaryProviderName ||
          getConfiguredProviderName(
            agentType
          )
      );

    const fallbackName =
      normalizeProviderName(
        fallbackProviderName ||
          getFallbackProviderName(
            primaryName
          )
      );

    const runProvider = async (
      providerName
    ) => {
      const provider =
        getProviderByName(providerName);

      return withRetry(
        () =>
          execute({
            provider,
            providerName,
          }),
        {
          retries,
          onRetry: ({
            attempt,
            nextAttempt,
            delayMs,
            error,
          }) => {
            tracker?.addLog(
              trackerAgentName,
              `${providerName} attempt ${attempt} failed: ${error.message}`
            );

            tracker?.addLog(
              trackerAgentName,
              `Retrying with ${providerName} in ${delayMs} ms (attempt ${nextAttempt}).`
            );
          },
        }
      );
    };

    try {
      tracker?.addLog(
        trackerAgentName,
        `Primary provider: ${primaryName}.`
      );

      const result =
        await runProvider(primaryName);

      return {
        result,
        providerName: primaryName,
        fallbackUsed: false,
      };
    } catch (primaryError) {
      if (
        !fallbackName ||
        fallbackName === primaryName ||
        !shouldUseFallback(primaryError)
      ) {
        throw primaryError;
      }

      tracker?.addLog(
        trackerAgentName,
        `${primaryName} failed after retries. Switching to ${fallbackName}.`
      );

      const result =
        await runProvider(fallbackName);

      return {
        result,
        providerName: fallbackName,
        fallbackUsed: true,
        primaryError:
          primaryError.message,
      };
    }
  };