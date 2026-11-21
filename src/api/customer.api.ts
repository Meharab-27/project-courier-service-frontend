import apiClient from "@/lib/apiClient";
import type { IUser } from "./auth.api";

export interface ICustomer {
  id: string;
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  zone?: string;
  postalCode?: string;
  defaultPickupAddress?: string;
  defaultDeliveryAddress?: string;
  defaultAddress?: string;
  alternatePhone?: string;
  totalOrders?: number;
  user?: IUser;
  createdAt?: string;
  updatedAt?: string;
}

export interface IGetCustomerMeResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ICustomer;
}

export function getCustomerMe(): Promise<IGetCustomerMeResponse> {
  return apiClient<IGetCustomerMeResponse>("/customers/me", {
    method: "GET",
  });
}

export interface IUpdateCustomerPayload {
  defaultAddress?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  alternatePhone?: string;
}

export function updateCustomerMe(
  payload: IUpdateCustomerPayload,
): Promise<IGetCustomerMeResponse> {
  return apiClient<IGetCustomerMeResponse>("/customers/me", {
    method: "PATCH",
    body: payload,
  });
}

export interface IGetAllCustomersResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ICustomer[];
}

export function getAllCustomers(params?: {
  city?: string;
  district?: string;
  searchTerm?: string;
}): Promise<IGetAllCustomersResponse> {
  const searchParams = new URLSearchParams();
  if (params?.city && params.city !== "ALL")
    searchParams.set("city", params.city);
  if (params?.district && params.district !== "ALL")
    searchParams.set("district", params.district);
  if (params?.searchTerm) searchParams.set("searchTerm", params.searchTerm);
  const qs = searchParams.toString();
  return apiClient<IGetAllCustomersResponse>(
    `/customers${qs ? `?${qs}` : ""}`,
    {
      method: "GET",
    },
  );
}

export function getCustomerById(id: string): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  data: ICustomer;
}> {
  return apiClient<{
    success: boolean;
    statusCode: number;
    message: string;
    data: ICustomer;
  }>(`/customers/${id}`, { method: "GET" });
}

export function deleteCustomer(id: string): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
}> {
  return apiClient<{
    success: boolean;
    statusCode: number;
    message: string;
  }>(`/customers/${id}`, { method: "DELETE" });
}
