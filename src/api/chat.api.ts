import { apiClient } from "@/lib/apiClient";

export interface IChatHub {
  id: string;
  name: string;
  code: string;
  zone: string;
  address: string;
  contactNo: string;
  latitude: number | null;
  longitude: number | null;
}

export interface ISendChatMessagePayload {
  message: string;
  sessionId?: string;
}

export interface IChatResponseData {
  sessionId: string;
  answer: string;
  hubs: IChatHub[];
}

export interface IChatHistoryItem {
  role: "human" | "ai";
  content: string;
}

export interface IChatHistoryData {
  sessionId: string;
  history: IChatHistoryItem[];
}

export interface IApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/**
 * Public Endpoint: Send user message to Bilingual RAG Chatbot (Redis multi-turn memory)
 * POST /api/v1/chat/message
 */
export const sendChatMessageApi = async (
  payload: ISendChatMessagePayload,
): Promise<IApiResponse<IChatResponseData>> => {
  return await apiClient<IApiResponse<IChatResponseData>>("/chat/message", {
    method: "POST",
    body: payload,
  });
};

/**
 * Public Endpoint: Retrieve conversation history for a given session
 * GET /api/v1/chat/history/:sessionId
 */
export const getChatHistoryApi = async (
  sessionId: string,
): Promise<IApiResponse<IChatHistoryData>> => {
  return await apiClient<IApiResponse<IChatHistoryData>>(
    `/chat/history/${sessionId}`,
    {
      method: "GET",
    },
  );
};

/**
 * Public Endpoint: Clear session history from Redis cache
 * DELETE /api/v1/chat/history/:sessionId
 */
export const clearChatHistoryApi = async (
  sessionId: string,
): Promise<IApiResponse<{ sessionId: string; cleared: boolean }>> => {
  return await apiClient<IApiResponse<{ sessionId: string; cleared: boolean }>>(
    `/chat/history/${sessionId}`,
    {
      method: "DELETE",
    },
  );
};

