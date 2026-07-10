import { createAIProvider } from "../ai/providers/provider.factory.js";

export const testAIProvider = async (req, res) => {
  try {
    const ai = createAIProvider();

    const textResult = await ai.generateText({
      systemPrompt: "You are a concise software architect.",
      userPrompt:
        "Reply with one sentence confirming that the EVOKE AI provider is working.",
      temperature: 0,
      maxTokens: 100,
    });

    const jsonResult = await ai.generateJson({
      systemPrompt:
        "You are a software requirements extractor. Return only valid JSON.",
      userPrompt:
        'Analyze this request: "Build a clinic application with authentication and appointments." Return an object with projectType, authentication, and features.',
      temperature: 0,
      maxTokens: 300,
    });

    return res.status(200).json({
      success: true,
      provider: process.env.AI_PROVIDER || "groq",
      model:
        process.env.GROQ_LLM_MODEL || "llama-3.3-70b-versatile",
      textResult,
      jsonResult,
    });
  } catch (error) {
    console.error("AI provider test failed:", error);

    return res.status(500).json({
      success: false,
      message: "AI provider test failed.",
      error: error.message,
    });
  }
};