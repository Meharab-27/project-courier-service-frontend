import apiClient from "@/lib/apiClient";
import type { IHub } from "./courier.api";

export interface ICalculatePricePayload {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  isFragile: boolean;
  originHubId?: string;
  destinationHubId?: string;
}

export interface IPriceBreakdown {
  actualWeightKg: number;
  volumetricWeightKg: number;
  chargeableWeightKg: number;
  baseFare: number;
  extraWeightFare: number;
  surcharge: number;
  totalCost: number;
  isSameZone?: boolean;
  currency?: string;
  originZone?: string;
  destinationZone?: string;
}

export interface ICalculatePriceResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IPriceBreakdown;
}

export interface ICreateShipmentPayload {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverEmail?: string;
  originHubId: string;
  destinationHubId: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  isFragile: boolean;
  parcelTitle?: string;
  parcelType?: string;
  notes?: string;
  totalCost?: number;
  chargeableWeightKg?: number;
}

export interface IShipmentStatusLog {
  id?: string;
  shipmentId?: string;
  fromStatus?: string | null;
  toStatus: string;
  remarks?: string | null;
  createdAt: string;
  performedBy?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

export interface IShipmentData {
  id: string;
  trackingId?: string;
  trackingNumber?: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverEmail?: string;
  originHubId: string;
  destinationHubId: string;
  originHub?: IHub | null;
  destinationHub?: IHub | null;
  weightKg: number;
  chargeableWeightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  totalCost: number;
  status: string;
  isFragile?: boolean;
  parcelTitle?: string;
  parcelType?: string;
  notes?: string;
  deliveryNotes?: string;
  paymentStatus?: "PAYMENT_PENDING" | "PAID" | "UNPAID" | "PENDING" | "FAILED";
  deliveryOtp?: string | null;
  statusLogs?: IShipmentStatusLog[];
  paymentUrl?: string | null;
  stripeSessionUrl?: string | null;
  checkoutUrl?: string | null;
  clientSecret?: string | null;
  courierId?: string | null;
  courierName?: string | null;
  courier?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateShipmentResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IShipmentData;
}

export interface IGetShipmentResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IShipmentData;
}

export interface IGetAllShipmentsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IShipmentData[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function calculateShipmentPrice(
  payload: ICalculatePricePayload,
): Promise<ICalculatePriceResponse> {
  return apiClient<ICalculatePriceResponse>("/shipments/calculate-price", {
    method: "POST",
    body: payload,
  });
}

export function createShipment(
  payload: ICreateShipmentPayload,
): Promise<ICreateShipmentResponse> {
  return apiClient<ICreateShipmentResponse>("/shipments/create-shipment", {
    method: "POST",
    body: payload,
  });
}

export function getShipmentById(id: string): Promise<IGetShipmentResponse> {
  return apiClient<IGetShipmentResponse>(`/shipments/${id}`, {
    method: "GET",
  });
}

export interface IGetAllShipmentsParams {
  page?: number;
  limit?: number;
  status?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function getAllShipments(
  params?: string | IGetAllShipmentsParams,
): Promise<IGetAllShipmentsResponse> {
  let queryString = "";
  if (typeof params === "string") {
    queryString = params ? `?searchTerm=${encodeURIComponent(params)}` : "";
  } else if (params && typeof params === "object") {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.status && params.status !== "All" && params.status !== "ALL") {
      searchParams.set("status", params.status);
    }
    if (params.searchTerm) searchParams.set("searchTerm", params.searchTerm);
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    const qs = searchParams.toString();
    queryString = qs ? `?${qs}` : "";
  }

  return apiClient<IGetAllShipmentsResponse>(
    `/shipments/get-all-shipments${queryString}`,
    {
      method: "GET",
    },
  );
}

export interface IUpdateReceiverPayload {
  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  deliveryNotes?: string;
}

export function updateShipment(
  id: string,
  payload: IUpdateReceiverPayload,
): Promise<IGetShipmentResponse> {
  return apiClient<IGetShipmentResponse>(`/shipments/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function cancelShipment(id: string): Promise<IGetShipmentResponse> {
  return apiClient<IGetShipmentResponse>(`/shipments/${id}/cancel`, {
    method: "POST",
  });
}

export function deleteShipment(
  id: string,
): Promise<{ success: boolean; statusCode: number; message: string }> {
  return apiClient<{ success: boolean; statusCode: number; message: string }>(
    `/shipments/${id}`,
    {
      method: "DELETE",
    },
  );
}

export function getMyShipments(): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  data: IShipmentData[];
}> {
  return apiClient("/shipments/my-shipments", {
    method: "GET",
  }).catch(() => {
    return apiClient("/shipments", {
      method: "GET",
    });
  });
}

export function createStripePaymentSession(shipmentId: string): Promise<{
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    url?: string;
    sessionUrl?: string;
    checkoutUrl?: string;
    paymentUrl?: string;
    stripeSessionUrl?: string;
    clientSecret?: string;
    sessionId?: string;
  };
  checkoutUrl?: string;
  url?: string;
}> {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const body: Record<string, unknown> = {
    shipmentId,
    successUrl: origin
      ? `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&shipment_id=${shipmentId}`
      : undefined,
    cancelUrl: origin
      ? `${origin}/payment/cancel?shipment_id=${shipmentId}`
      : undefined,
    redirectUrl: origin
      ? `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&shipment_id=${shipmentId}`
      : undefined,
    clientUrl: origin || undefined,
  };

  for (const key of Object.keys(body)) {
    if (body[key] === undefined) {
      delete body[key];
    }
  }

  return apiClient("/payments/initiate", {
    method: "POST",
    body,
  }).catch(() => {
    return apiClient("/payments/create-checkout-session", {
      method: "POST",
      body,
    });
  });
}

export interface IAssignCourierPayload {
  courierId: string;
}

export function assignCourier(
  shipmentId: string,
  payload: IAssignCourierPayload,
): Promise<IGetShipmentResponse> {
  return apiClient<IGetShipmentResponse>(
    `/shipments/${shipmentId}/assign-courier`,
    {
      method: "POST",
      body: payload,
    },
  );
}

export interface IUpdateCourierStatusPayload {
  status: "PICKED_UP" | "IN_HUB_TRANSIT" | "OUT_FOR_DELIVERY" | "FAILED_DELIVERY";
  remarks?: string;
}

export interface IVerifyDeliveryOtpPayload {
  otp: string;
  podSignatureUrl?: string;
  podImageUrl?: string;
  remarks?: string;
}

export function updateCourierStatus(
  shipmentId: string,
  payload: IUpdateCourierStatusPayload,
): Promise<IGetShipmentResponse> {
  return apiClient<IGetShipmentResponse>(
    `/shipments/${shipmentId}/courier-status`,
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export function verifyDeliveryOtp(
  shipmentId: string,
  payload: IVerifyDeliveryOtpPayload,
): Promise<IGetShipmentResponse> {
  return apiClient<IGetShipmentResponse>(
    `/shipments/${shipmentId}/verify-delivery-otp`,
    {
      method: "POST",
      body: payload,
    },
  );
}

export function getPublicTracking(
  trackingNumber: string,
): Promise<IGetShipmentResponse> {
  return apiClient<IGetShipmentResponse>(
    `/shipments/track/${encodeURIComponent(trackingNumber)}`,
    {
      method: "GET",
    },
  );
}

