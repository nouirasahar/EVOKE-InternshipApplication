import { API_URL } from "./api";
import { getToken, logout } from "@/utils/token";

export const transcribeAudio = async (audioBlob: Blob) => {
  const token = getToken();

  const formData = new FormData();
  formData.append("audio", audioBlob, "voice.webm");

  const response = await fetch(`${API_URL}/transcription`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await response.json();

  if (response.status === 401) {
    logout();
    window.location.href = "/login";
    throw new Error("Session expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Transcription failed.");
  }

  return data;
};