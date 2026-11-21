import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllHubs, getMyCourierProfile, setupCourierProfile } from "@/api";

export { useGetHubs } from "./hub.hooks";

export function useSubmitCourierProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setupCourierProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courier-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useGetMyCourierProfile() {
  return useQuery({
    queryKey: ["courier-profile"],
    queryFn: getMyCourierProfile,
    retry: false,
  });
}
