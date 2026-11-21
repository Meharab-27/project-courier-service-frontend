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

import type { ICourierProfile } from "./courier.api";

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "ADMIN" | "COURIER" | "CUSTOMER";
  status?: string;
  avatarUrl?: string | null;
  isVerified?: boolean;
  courierProfile?: ICourierProfile | null;
}

export interface IGetUsersResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IUser[];
}

export function getUsers(params?: {
  role?: string;
  searchTerm?: string;
}): Promise<IGetUsersResponse> {
  const searchParams = new URLSearchParams();
  if (params?.role && params.role !== "ALL")
    searchParams.set("role", params.role);
  if (params?.searchTerm) searchParams.set("searchTerm", params.searchTerm);
  const qs = searchParams.toString();
  return apiClient<IGetUsersResponse>(`/users${qs ? `?${qs}` : ""}`, {
    method: "GET",
  });
}

export function getUserById(id: string): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  data: IUser;
}> {
  return apiClient<{
    success: boolean;
    statusCode: number;
    message: string;
    data: IUser;
  }>(`/users/${id}`, { method: "GET" });
}

export function deleteUser(id: string): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
}> {
  return apiClient<{
    success: boolean;
    statusCode: number;
    message: string;
  }>(`/users/${id}`, { method: "DELETE" });
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

export interface IUpdateUserPayload {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

export function updateUserMe(
  payload: IUpdateUserPayload,
): Promise<IGetMeResponse> {
  return apiClient<IGetMeResponse>("/users/me", {
    method: "PATCH",
    body: payload,
  });
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

export function refreshToken() {
  return apiClient<{
    success: boolean;
    statusCode: number;
    message: string;
    data: { accessToken: string };
  }>("/auth/refresh-token", {
    method: "POST",
  });
}
