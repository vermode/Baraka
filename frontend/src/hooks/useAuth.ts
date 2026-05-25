import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMe,
  signup as signupFn,
  login as loginFn,
  logout as logoutFn,
  getGetMeQueryKey,
  ApiError,
} from "@workspace/api-client-react";

export type AuthUser = Awaited<ReturnType<typeof getMe>>;

export function useAuth() {
  const qc = useQueryClient();

  const query = useQuery<AuthUser | null>({
    queryKey: getGetMeQueryKey(),
    queryFn: async () => {
      try {
        return await getMe();
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
    retry: false,
    staleTime: 30_000,
  });

  const login = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      loginFn(data),
    onSuccess: (user) => {
      qc.setQueryData(getGetMeQueryKey(), user);
    },
  });

  const signup = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; phone?: string; accountType?: "donor" | "charity" }) =>
      signupFn(data),
    onSuccess: (user) => {
      qc.setQueryData(getGetMeQueryKey(), user);
    },
  });

  const logout = useMutation({
    mutationFn: () => logoutFn(),
    onSuccess: () => {
      qc.setQueryData(getGetMeQueryKey(), null);
      qc.clear();
    },
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    login,
    signup,
    logout,
  };
}
