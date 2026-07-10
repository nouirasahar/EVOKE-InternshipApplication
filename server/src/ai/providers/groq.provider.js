import Groq from "groq-sdk";
import { AIProvider } from "./ai-provider.js";

export class GroqProvider extends AIProvider {
  constructor() {
    super();

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing in the server environment.");
    }

    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    this.model =
      process.env.GROQ_LLM_MODEL || "llama-3.3-70b-versatile";
  }

  async generateText({
    systemPrompt,
    userPrompt,
    temperature = 0.2,
    maxTokens = 4096,
  }) {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature,
      max_completion_tokens: maxTokens,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty response.");
    }

    return content;
  }

  async generateJson({
    systemPrompt,
    userPrompt,
    temperature = 0.1,
    maxTokens = 4096,
  }) {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature,
      max_completion_tokens: maxTokens,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty JSON response.");
    }

    try {
      return JSON.parse(content);
    } catch {
      throw new Error("Groq returned invalid JSON.");
    }
  }
}