import fs from "fs/promises";

const GROQ_TRANSCRIPTION_URL =
  "https://api.groq.com/openai/v1/audio/transcriptions";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, options, timeoutMs = 45000) => {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

export const transcribeAudio = async (filePath) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing in .env.");
  }

  const audioBuffer = await fs.readFile(filePath);

  const audioBlob = new Blob([audioBuffer], {
    type: "audio/webm",
  });

  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const formData = new FormData();

      formData.append("file", audioBlob, "voice.webm");
      formData.append(
        "model",
        process.env.GROQ_STT_MODEL || "whisper-large-v3-turbo"
      );

      const response = await fetchWithTimeout(
        GROQ_TRANSCRIPTION_URL,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: formData,
        },
        45000
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Audio transcription failed.");
      }

      return data.text;
    } catch (error) {
      lastError = error;

      if (attempt < 3) {
        await sleep(1500 * attempt);
      }
    }
  }

  throw new Error(
    `Groq transcription failed after 3 attempts: ${
      lastError?.message || "Network timeout"
    }`
  );
};