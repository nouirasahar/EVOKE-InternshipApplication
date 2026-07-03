import { Route } from "react-router-dom";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";

export const authRoutes = [
  <Route key="login" path="/login" element={<LoginPage />} />,
  <Route key="signup" path="/signup" element={<SignupPage />} />,
  <Route key="verify" path="/verify-email" element={<VerifyEmailPage />} />,
  <Route key="forgot" path="/forgot-password" element={<ForgotPasswordPage />} />,
  <Route key="reset" path="/reset-password" element={<ResetPasswordPage />} />,
];
