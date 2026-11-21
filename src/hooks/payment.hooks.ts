import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPaymentById, initiatePayment, verifyPaymentSession } from "@/api";

export function useInitiatePayment() {
  return useMutation({
    mutationFn: initiatePayment,
  });
}

export function useGetPayment(id?: string) {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => getPaymentById(id as string),
    enabled: Boolean(id),
    retry: 1,
  });
}

export function useVerifyPaymentSession(sessionIdOrId?: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["payment-verify", sessionIdOrId],
    queryFn: async () => {
      const res = await verifyPaymentSession(sessionIdOrId as string);
      // Invalidate relevant shipment & payment queries across dashboard
      queryClient.invalidateQueries({ queryKey: ["shipment"] });
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["my-shipments"] });
      queryClient.invalidateQueries({ queryKey: ["payment"] });
      return res;
    },
    enabled: Boolean(sessionIdOrId),
    retry: 2,
    staleTime: 1000 * 30,
  });
}
