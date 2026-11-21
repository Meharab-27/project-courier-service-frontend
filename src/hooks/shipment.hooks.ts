import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignCourier,
  calculateShipmentPrice,
  cancelShipment,
  createShipment,
  createStripePaymentSession,
  deleteShipment,
  getAllShipments,
  getMyShipments,
  getShipmentById,
  type IGetAllShipmentsParams,
  type IUpdateReceiverPayload,
  type IUpdateCourierStatusPayload,
  type IVerifyDeliveryOtpPayload,
  updateShipment,
  updateCourierStatus,
  verifyDeliveryOtp,
  getPublicTracking,
} from "@/api";

export function useCalculatePrice() {
  return useMutation({
    mutationFn: calculateShipmentPrice,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
}

export function useGetShipment(id?: string) {
  return useQuery({
    queryKey: ["shipment", id],
    queryFn: () => getShipmentById(id as string),
    enabled: Boolean(id),
    retry: 1,
  });
}

export function useGetAllShipments(params?: string | IGetAllShipmentsParams) {
  return useQuery({
    queryKey: ["shipments", "all", params],
    queryFn: () => getAllShipments(params),
    retry: 1,
  });
}

export function useGetMyShipments() {
  return useQuery({
    queryKey: ["shipments", "my"],
    queryFn: getMyShipments,
    retry: 1,
  });
}

export function useCreateStripePayment() {
  return useMutation({
    mutationFn: createStripePaymentSession,
  });
}

export function useUpdateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: IUpdateReceiverPayload;
    }) => updateShipment(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipment", variables.id] });
    },
  });
}

export function useCancelShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelShipment(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipment", id] });
    },
  });
}

export function useDeleteShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteShipment(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipment", id] });
    },
  });
}

export function useAssignCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      shipmentId,
      courierId,
    }: {
      shipmentId: string;
      courierId: string;
    }) => assignCourier(shipmentId, { courierId }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({
        queryKey: ["shipment", variables.shipmentId],
      });
    },
  });
}

export function useUpdateCourierStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      shipmentId,
      payload,
    }: {
      shipmentId: string;
      payload: IUpdateCourierStatusPayload;
    }) => updateCourierStatus(shipmentId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({
        queryKey: ["shipment", variables.shipmentId],
      });
    },
  });
}

export function useVerifyDeliveryOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      shipmentId,
      payload,
    }: {
      shipmentId: string;
      payload: IVerifyDeliveryOtpPayload;
    }) => verifyDeliveryOtp(shipmentId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({
        queryKey: ["shipment", variables.shipmentId],
      });
    },
  });
}

export function useGetPublicTracking(trackingNumber?: string) {
  return useQuery({
    queryKey: ["shipment", "public-track", trackingNumber],
    queryFn: () => getPublicTracking(trackingNumber as string),
    enabled: Boolean(trackingNumber && trackingNumber.trim()),
    retry: 1,
  });
}

