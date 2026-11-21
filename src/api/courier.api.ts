import apiClient from "@/lib/apiClient";

export type { IHub, IHubsResponse } from "./hub.api";
export { getAllHubs } from "./hub.api";

export interface ICourierProfile {
  id: string;
  userId: string;
  hubId: string;
  vehicleType: "BICYCLE" | "MOTORBIKE" | "VAN" | "TRUCK";
  vehicleNumber: string;
  drivingLicense?: string | null;
  drivingLicenseUrl?: string | null;
  nidCardUrl?: string | null;
  currentZone: string;
  isAvailable?: boolean;
  maxCapacityKg: number;
  activeDeliveries?: number;
  createdAt?: string;
  updatedAt?: string;
  hub?: {
    id: string;
    name: string;
    code: string;
    zone: string;
    address?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    status?: string;
  };
}

export interface ISetupCourierProfilePayload {
  userId?: string;
  hubId: string;
  vehicleType: "BICYCLE" | "MOTORBIKE" | "VAN" | "TRUCK";
  vehicleNumber: string;
  drivingLicense?: string | null;
  drivingLicenseUrl?: string | null;
  nidCardUrl?: string | null;
  currentZone: string;
  isAvailable?: boolean;
  maxCapacityKg: number;
}

export function setupCourierProfile(
  payload: FormData | ISetupCourierProfilePayload | Record<string, unknown>,
): Promise<{
  success: boolean;
  message: string;
  data: ICourierProfile;
}> {
  return apiClient("/courier/profile", {
    method: "POST",
    body: payload,
  });
}

export function getMyCourierProfile(): Promise<{
  success: boolean;
  message: string;
  data: ICourierProfile;
}> {
  return apiClient("/courier/profile/me", { method: "GET" });
}
