import apiClient from "@/lib/apiClient";

export interface IHub {
  id: string;
  name: string;
  code: string;
  address: string;
  zone: string;
  contactNo?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface IHubsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IHub[];
}

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
  maxCapacityKg: number;
  hub?: {
    id: string;
    name: string;
    code: string;
    zone: string;
  };
}

export function getAllHubs(): Promise<IHubsResponse> {
  return apiClient<IHubsResponse>("/hubs", { method: "GET" });
}

export function setupCourierProfile(formData: FormData): Promise<{
  success: boolean;
  message: string;
  data: ICourierProfile;
}> {
  return apiClient("/courier/profile", {
    method: "POST",
    body: formData,
  });
}

export function getMyCourierProfile(): Promise<{
  success: boolean;
  message: string;
  data: ICourierProfile;
}> {
  return apiClient("/courier/profile/me", { method: "GET" });
}
