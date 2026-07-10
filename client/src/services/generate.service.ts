import { apiRequest } from "./api";

export type GenerateApplicationPayload = {
  projectName?: string;
  prompt: string;
  transcript?: string;
  source: "voice" | "text";
  language?: string;
  frontend: string;
  backend: string;
  database: string;
};

export const generateApplication = async (
  payload: GenerateApplicationPayload
) => {
  return apiRequest("/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};