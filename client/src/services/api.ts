import { getToken, logout } from "@/utils/token";

export const API_URL = "http://localhost:5000/api";

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (response.status === 401) {
    logout();
    window.location.href = "/login";
    throw new Error("Session expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};