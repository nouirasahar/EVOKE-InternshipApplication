import { Route } from "react-router-dom";

import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";

import ProfilePage from "@/pages/user/ProfilePage";
import ProjectsPage from "@/pages/user/ProjectsPage";
import ProjectWorkspacePage from "@/pages/user/ProjectWorkspacePage";
import SettingsPage from "@/pages/user/SettingsPage";

export const authRoutes = [
  <Route key="login" path="/login" element={<LoginPage />} />,
  <Route key="signup" path="/signup" element={<SignupPage />} />,
  <Route key="verify-email" path="/verify-email" element={<VerifyEmailPage />} />,
  <Route key="verify-email-token" path="/verify-email/:token" element={<VerifyEmailPage />} />,
  <Route key="forgot-password" path="/forgot-password" element={<ForgotPasswordPage />} />,
  <Route key="reset-password-token" path="/reset-password/:token" element={<ResetPasswordPage />} />,

  <Route key="profile" path="/profile" element={<ProfilePage />} />,
  <Route key="projects" path="/projects" element={<ProjectsPage />} />,
  <Route
    key="project-workspace"
    path="/projects/:id"
    element={<ProjectWorkspacePage />}
  />,
  <Route key="settings" path="/settings" element={<SettingsPage />} />,
];