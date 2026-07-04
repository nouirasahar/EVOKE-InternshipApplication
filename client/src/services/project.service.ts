import { apiRequest } from "./api";

export type Project = {
  _id: string;
  title: string;
  prompt: string;
  framework: string;
  status: string;
  generatedPath?: string;
  createdAt: string;
};

export const getMyProjects = async () => {
  return apiRequest("/projects", {
    method: "GET",
  });
};