import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getMyNotificationsOptions, 
  getMyUnreadCountOptions, 
  markAsReadMutation, 
  markAllAsReadMutation,
  getMyNotificationsQueryKey,
  getMyUnreadCountQueryKey
} from '../client/@tanstack/react-query.gen';
import { useAuthStore } from '../store/useAuthStore';

export function useNotificationsQuery() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    ...getMyNotificationsOptions(),
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });
}

export function useUnreadCountQuery() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    ...getMyUnreadCountOptions(),
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });
}

export function useMarkReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...markAsReadMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getMyNotificationsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getMyUnreadCountQueryKey() });
    }
  });
}

export function useMarkAllReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...markAllAsReadMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getMyNotificationsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getMyUnreadCountQueryKey() });
    }
  });
}
