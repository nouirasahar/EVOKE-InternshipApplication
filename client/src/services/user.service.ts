import { apiRequest } from "./api";

export const getCurrentUser = async () => {
  return apiRequest("/auth/me", { method: "GET" });
};

export const updateCurrentUser = async (fullName: string) => {
  return apiRequest("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ fullName }),
  });
};

export const deleteCurrentUser = async () => {
  return apiRequest("/users/me", {
    method: "DELETE",
  });
};