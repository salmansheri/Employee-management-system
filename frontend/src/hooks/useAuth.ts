import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMeOptions, logoutMutation, loginMutation } from '../client/@tanstack/react-query.gen';
import { useAuthStore } from '../store/useAuthStore';

export function useMeQuery() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    ...getMeOptions(),
    enabled: isAuthenticated,
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...logoutMutation(),
    onSuccess: () => {
      queryClient.clear();
    }
  });
}

export function useLoginMutation() {
  const { setAuth } = useAuthStore();
  return useMutation({
    ...loginMutation(),
    onSuccess: (data) => {
      const token = data?.accessToken;
      if (token) {
        setAuth(token);
      }
    }
  });
}
