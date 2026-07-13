import { GoogleGenAI } from "@google/genai";
import { AIProvider } from "../base/ai-provider.js";

export class GeminiProvider extends AIProvider {
  constructor() {
    super();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is missing in the server environment."
      );
    }

    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    this.model =
      process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  }

  async generateText({
    systemPrompt,
    userPrompt,
    temperature = 0.2,
    maxTokens = 6000,
  }) {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const content = response.text;

    if (!content) {
      throw new Error("Gemini returned an empty response.");
    }

    return content;
  }

  async generateJson({
    systemPrompt,
    userPrompt,
    temperature = 0.1,
    maxTokens = 6000,
    schema,
  }) {
    const config = {
      systemInstruction: systemPrompt,
      temperature,
      maxOutputTokens: maxTokens,
      responseMimeType: "application/json",
      ...(schema
        ? {
            responseJsonSchema: schema,
          }
        : {}),
    };

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: userPrompt,
      config,
    });

    const content = response.text;

    if (!content) {
      throw new Error(
        "Gemini returned an empty JSON response."
      );
    }

    try {
      return JSON.parse(content);
    } catch {
      throw new Error("Gemini returned invalid JSON.");
    }
  }
}
