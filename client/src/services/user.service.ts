import { apiRequest } from "./api";

export const getCurrentUser = async () => {
  return apiRequest("/auth/me", {
    method: "GET",
  });
};