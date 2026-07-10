import { apiRequest } from "./api";

export type Project = {
  _id: string;
  title: string;
  prompt: string;
  framework: string;
  status: string;
  generatedPath?: string;
  dsl?: any;
  files?: {
    path: string;
    content: string;
    language: string;
  }[];
  createdAt: string;
  updatedAt?: string;
};

export const getMyProjects = async () => {
  return apiRequest("/projects", {
    method: "GET",
  });
};

export const getProjectById = async (id: string) => {
  return apiRequest(`/projects/${id}`, {
    method: "GET",
  });
};