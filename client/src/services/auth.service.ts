import { apiRequest } from "./api";
import { saveToken, saveUser } from "../utils/token";
export const signup = async (data: {
  fullName: string;
  email: string;
  password: string;
}) => {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const login = async (data: {
  email: string;
  password: string;
}) => {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  saveToken(response.token);
  saveUser(response.user);
  return response;
};

export const forgotPassword = async (email: string) => {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (token: string, password: string) => {
  return apiRequest(`/auth/reset-password/${token}`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
};

export const verifyEmail = async (token: string) => {
  return apiRequest(`/auth/verify/${token}`, {
    method: "GET",
  });
};