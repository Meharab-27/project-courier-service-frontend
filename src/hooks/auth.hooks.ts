import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteUser,
  forgotPassword,
  getMe,
  getUserById,
  getUsers,
  googleOAuth,
  type IUpdateUserPayload,
  resetPassword,
  updateUserMe,
  userLogin,
  userLogout,
  userRegister,
  verifyCustomerEmail,
} from "@/api";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userLogin,
    onSuccess: (res: { data?: { accessToken?: string } }) => {
      if (res?.data?.accessToken && typeof window !== "undefined") {
        localStorage.setItem("accessToken", res.data.accessToken);
      }
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.refetchQueries({ queryKey: ["user"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userLogout,
    onSuccess: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.clear();
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userRegister,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useGetMe() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getMe,
    retry: false,
  });
}

export function useUpdateUserMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IUpdateUserPayload) => updateUserMe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["customer-me"] });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  });
}

export function useGoogleOAuth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: googleOAuth,
    onSuccess: (res: { data?: { accessToken?: string } }) => {
      if (res?.data?.accessToken && typeof window !== "undefined") {
        localStorage.setItem("accessToken", res.data.accessToken);
      }
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.refetchQueries({ queryKey: ["user"] });
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}

export function useVerifyCustomerEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyCustomerEmail,
    onSuccess: (res: { data?: { accessToken?: string } }) => {
      if (res?.data?.accessToken && typeof window !== "undefined") {
        localStorage.setItem("accessToken", res.data.accessToken);
      }
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.refetchQueries({ queryKey: ["user"] });
    },
  });
}

export function useGetUsers(params?: { role?: string; searchTerm?: string }) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
    staleTime: 60 * 1000,
  });
}

export function useGetUserById(id?: string) {
  return useQuery({
    queryKey: ["user-detail", id],
    queryFn: () => getUserById(id as string),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useGetCouriers(searchTerm?: string) {
  return useQuery({
    queryKey: ["users", "couriers", searchTerm],
    queryFn: () => getUsers({ role: "COURIER", searchTerm }),
    retry: 1,
  });
}
