const DEFAULT_RETRY_OPTIONS = {
  retries: 2,
  baseDelayMs: 1200,
  maxDelayMs: 8000,
  backoffFactor: 2,
};

const RETRYABLE_STATUS_CODES = new Set([
  408,
  425,
  429,
  500,
  502,
  503,
  504,
]);

const RETRYABLE_ERROR_CODES = new Set([
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "EAI_AGAIN",
  "ENETUNREACH",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
  "rate_limit_exceeded",
]);

const sleep = (durationMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

const getNestedErrorCode = (error) => {
  return (
    error?.code ||
    error?.cause?.code ||
    error?.error?.code ||
    error?.error?.error?.code ||
    null
  );
};

export const isRetryableError = (error) => {
  const status =
    Number(error?.status) ||
    Number(error?.response?.status) ||
    Number(error?.error?.code);

  if (RETRYABLE_STATUS_CODES.has(status)) {
    return true;
  }

  const errorCode = getNestedErrorCode(error);

  if (
    errorCode &&
    RETRYABLE_ERROR_CODES.has(errorCode)
  ) {
    return true;
  }

  const message = String(
    error?.message || ""
  ).toLowerCase();

  return (
    message.includes("connection error") ||
    message.includes("fetch failed") ||
    message.includes("timed out") ||
    message.includes("timeout") ||
    message.includes("temporarily unavailable") ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  );
};

const calculateDelay = ({
  attempt,
  baseDelayMs,
  maxDelayMs,
  backoffFactor,
}) => {
  const exponentialDelay =
    baseDelayMs *
    Math.pow(backoffFactor, attempt - 1);

  const jitter =
    Math.floor(Math.random() * 350);

  return Math.min(
    exponentialDelay + jitter,
    maxDelayMs
  );
};

export const withRetry = async (
  operation,
  options = {}
) => {
  if (typeof operation !== "function") {
    throw new Error(
      "withRetry requires an operation function."
    );
  }

  const {
    retries,
    baseDelayMs,
    maxDelayMs,
    backoffFactor,
  } = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  };

  const shouldRetry =
    options.shouldRetry || isRetryableError;

  const onRetry =
    options.onRetry || (() => {});

  let lastError;

  for (
    let attempt = 1;
    attempt <= retries + 1;
    attempt += 1
  ) {
    try {
      return await operation({
        attempt,
      });
    } catch (error) {
      lastError = error;

      const hasAttemptsRemaining =
        attempt <= retries;

      if (
        !hasAttemptsRemaining ||
        !shouldRetry(error)
      ) {
        throw error;
      }

      const delayMs = calculateDelay({
        attempt,
        baseDelayMs,
        maxDelayMs,
        backoffFactor,
      });

      await onRetry({
        error,
        attempt,
        nextAttempt: attempt + 1,
        delayMs,
      });

      await sleep(delayMs);
    }
  }

  throw lastError;
};