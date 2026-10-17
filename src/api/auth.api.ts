import apiClient from "@/lib/apiClient";
import type { TRegisterForm } from "@/validation";

export function userLogin(payload: { email: string; password: string }) {
  return apiClient("/auth/login", { method: "POST", body: payload });
}
export function userLogout() {
  return apiClient("/auth/logout", { method: "POST" });
}

export function userRegister(payload: Omit<TRegisterForm, "confirmPassword">) {
  return apiClient("/auth/register", { method: "POST", body: payload });
}

export function googleLogin() {
  return apiClient("/auth/google", { method: "GET" });
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "ADMIN" | "COURIER" | "CUSTOMER";
  avatarUrl?: string | null;
  isVerified?: boolean;
}

export interface IGetMeResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IUser;
}

export function getMe(): Promise<IGetMeResponse> {
  return apiClient<IGetMeResponse>("/users/me");
}

export function resetPassword(payload: {
  email: string;
  otp: string;
  newPassword: string;
}) {
  return apiClient("/auth/reset-password", { method: "POST", body: payload });
}

export function forgotPassword(payload: { email: string }) {
  return apiClient("/auth/forgot-password", { method: "POST", body: payload });
}

export function googleOAuth(payload: { idToken: string }) {
  return apiClient("/auth/google", { method: "POST", body: payload });
}

export interface IVerifyEmailResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user?: IUser;
  };
}

export function verifyCustomerEmail(payload: { email: string; otp: string }) {
  return apiClient<IVerifyEmailResponse>("/auth/verify-customer-email", {
    method: "POST",
    body: payload,
  });
}
