import { GroqProvider } from "./groq.provider.js";

export const createAIProvider = () => {
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();

  switch (provider) {
    case "groq":
      return new GroqProvider();

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
};