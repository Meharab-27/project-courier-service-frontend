import { useMutation, useQuery } from "@tanstack/react-query";
import {
  clearChatHistoryApi,
  getChatHistoryApi,
  type ISendChatMessagePayload,
  sendChatMessageApi,
} from "@/api/chat.api";

/**
 * Hook to send a message to the Bilingual RAG AI Chatbot
 */
export const useSendChatMessage = () => {
  return useMutation({
    mutationFn: (payload: ISendChatMessagePayload) =>
      sendChatMessageApi(payload),
  });
};

/**
 * Hook to clear the Redis session conversation history
 */
export const useClearChatHistory = () => {
  return useMutation({
    mutationFn: (sessionId: string) => clearChatHistoryApi(sessionId),
  });
};

// Alias for convenience matching both naming styles
export const useClearChatSession = useClearChatHistory;

/**
 * Hook to optionally fetch chat history for a session
 */
export const useGetChatHistory = (sessionId?: string) => {
  return useQuery({
    queryKey: ["chat-history", sessionId],
    queryFn: () => getChatHistoryApi(sessionId as string),
    enabled: Boolean(sessionId),
  });
};

