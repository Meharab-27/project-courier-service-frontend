import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteCustomer,
  getAllCustomers,
  getCustomerById,
  getCustomerMe,
  type IUpdateCustomerPayload,
  updateCustomerMe,
} from "@/api";

export function useGetCustomerMe() {
  return useQuery({
    queryKey: ["customer-me"],
    queryFn: getCustomerMe,
    retry: false,
    staleTime: 60 * 1000,
  });
}

export function useGetAllCustomers(params?: {
  city?: string;
  district?: string;
  searchTerm?: string;
}) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => getAllCustomers(params),
    staleTime: 60 * 1000,
  });
}

export function useGetCustomerById(id?: string) {
  return useQuery({
    queryKey: ["customer-detail", id],
    queryFn: () => getCustomerById(id as string),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateCustomerMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IUpdateCustomerPayload) => updateCustomerMe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-me"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
