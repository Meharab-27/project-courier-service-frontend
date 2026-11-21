import apiClient from "@/lib/apiClient";
import type { IShipmentData } from "./shipment.api";

export interface IPaymentData {
  id: string;
  shipmentId: string;
  amount: number;
  currency?: string;
  status: "PAYMENT_PENDING" | "PAID" | "COMPLETED" | "FAILED" | "CANCELLED";
  paymentMethod?: string;
  transactionId?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  checkoutUrl?: string;
  shipment?: IShipmentData;
  createdAt?: string;
  updatedAt?: string;
}

export interface IInitiatePaymentPayload {
  shipmentId: string;
  successUrl?: string;
  cancelUrl?: string;
  redirectUrl?: string;
  clientUrl?: string;
}

export interface IInitiatePaymentResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  data: {
    checkoutUrl?: string;
    url?: string;
    sessionUrl?: string;
    paymentUrl?: string;
    stripeSessionUrl?: string;
    paymentId?: string;
    sessionId?: string;
    shipmentId?: string;
    amount?: number;
  };
  checkoutUrl?: string;
  url?: string;
}

/**
 * Universal helper that extracts the Stripe checkout redirection URL from
 * any backend response format (data.url, data.checkoutUrl, data.sessionUrl, or top-level url).
 */
export function extractPaymentCheckoutUrl(res: unknown): string | undefined {
  if (!res) return undefined;
  if (typeof res === "string" && res.startsWith("http")) return res;
  const anyRes = res as Record<string, any>;
  if (typeof anyRes.data === "string" && anyRes.data.startsWith("http")) {
    return anyRes.data;
  }
  const data = (anyRes.data && typeof anyRes.data === "object" ? anyRes.data : {}) as Record<string, any>;
  return (
    data.checkoutUrl ||
    data.url ||
    data.sessionUrl ||
    data.paymentUrl ||
    data.stripeSessionUrl ||
    anyRes.checkoutUrl ||
    anyRes.url ||
    anyRes.sessionUrl ||
    undefined
  );
}

export interface IGetPaymentResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IPaymentData;
}

export function initiatePayment(
  payload: IInitiatePaymentPayload,
): Promise<IInitiatePaymentResponse> {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const requestBody: Record<string, unknown> = {
    shipmentId: payload.shipmentId,
    // Add dynamic URLs so Stripe redirects back to the current deployed domain (e.g. Vercel)
    successUrl:
      payload.successUrl ||
      (origin
        ? `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&shipment_id=${payload.shipmentId}`
        : undefined),
    cancelUrl:
      payload.cancelUrl ||
      (origin
        ? `${origin}/payment/cancel?shipment_id=${payload.shipmentId}`
        : undefined),
    redirectUrl:
      payload.redirectUrl ||
      (origin
        ? `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&shipment_id=${payload.shipmentId}`
        : undefined),
    clientUrl: payload.clientUrl || origin || undefined,
  };

  // Remove undefined fields
  for (const key of Object.keys(requestBody)) {
    if (requestBody[key] === undefined) {
      delete requestBody[key];
    }
  }

  return apiClient<IInitiatePaymentResponse>("/payments/initiate", {
    method: "POST",
    body: requestBody,
  });
}

export function getPaymentById(id: string): Promise<IGetPaymentResponse> {
  return apiClient<IGetPaymentResponse>(`/payments/${id}`, {
    method: "GET",
  });
}

export function verifyPaymentSession(
  sessionIdOrId: string,
): Promise<IGetPaymentResponse> {
  return apiClient<IGetPaymentResponse>(
    `/payments/verify/${encodeURIComponent(sessionIdOrId)}`,
    {
      method: "GET",
    },
  ).catch(() => {
    return apiClient<IGetPaymentResponse>(
      `/payments/${encodeURIComponent(sessionIdOrId)}`,
      {
        method: "GET",
      },
    );
  });
}

