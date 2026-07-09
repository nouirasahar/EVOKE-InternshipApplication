import { apiRequest } from "./api";

export type GenerateApplicationPayload = {
  prompt: string;
  transcript?: string;
  source: "voice" | "text";
  language?: string;
};

export const generateApplication = async (
  payload: GenerateApplicationPayload
) => {
  return apiRequest("/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};