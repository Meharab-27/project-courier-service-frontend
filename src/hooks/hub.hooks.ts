import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createHub,
  getAllHubs,
  getHubById,
  type ICreateHubPayload,
  type IGetHubsParams,
  type IUpdateHubPayload,
  updateHub,
} from "@/api/hub.api";

/**
 * Hook to retrieve all hubs with optional filters/pagination
 */
export function useGetHubs(params?: IGetHubsParams) {
  return useQuery({
    queryKey: ["hubs", params],
    queryFn: () => getAllHubs(params),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to retrieve a single hub by its ID
 */
export function useGetHubById(id?: string) {
  return useQuery({
    queryKey: ["hub", id],
    queryFn: () => getHubById(id as string),
    enabled: Boolean(id),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to create a new hub (POST /api/v1/hubs/create)
 */
export function useCreateHub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ICreateHubPayload) => createHub(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubs"] });
    },
  });
}

/**
 * Hook to update an existing hub (PATCH /api/v1/hubs/:id)
 */
export function useUpdateHub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IUpdateHubPayload }) =>
      updateHub(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hubs"] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ["hub", variables.id] });
      }
    },
  });
}
