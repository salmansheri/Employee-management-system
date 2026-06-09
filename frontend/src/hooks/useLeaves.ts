import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getMyLeaveRequestsOptions, 
  getMyWfhRequestsOptions, 
  getPendingRequestsForManager1Options, 
  getPendingRequestsForManagerOptions, 
  applyForLeaveMutation, 
  applyForWfhMutation, 
  approveLeaveMutation, 
  rejectLeaveMutation, 
  approveWfhMutation, 
  rejectWfhMutation,
  getMyLeaveRequestsQueryKey,
  getMyWfhRequestsQueryKey,
  getPendingRequestsForManager1QueryKey,
  getPendingRequestsForManagerQueryKey
} from '../client/@tanstack/react-query.gen';

export function useMyLeavesQuery() {
  return useQuery({
    ...getMyLeaveRequestsOptions(),
  });
}

export function useMyWfhQuery() {
  return useQuery({
    ...getMyWfhRequestsOptions(),
  });
}

export function usePendingLeavesQuery(enabled: boolean) {
  return useQuery({
    ...getPendingRequestsForManager1Options(),
    enabled,
  });
}

export function usePendingWfhQuery(enabled: boolean) {
  return useQuery({
    ...getPendingRequestsForManagerOptions(),
    enabled,
  });
}

export function useApplyLeaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...applyForLeaveMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getMyLeaveRequestsQueryKey() });
    }
  });
}

export function useApplyWfhMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...applyForWfhMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getMyWfhRequestsQueryKey() });
    }
  });
}

export function useApproveLeaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...approveLeaveMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getPendingRequestsForManager1QueryKey() });
      queryClient.invalidateQueries({ queryKey: ['teamPresence'] }); // invalidate presence too
    }
  });
}

export function useRejectLeaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...rejectLeaveMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getPendingRequestsForManager1QueryKey() });
    }
  });
}

export function useApproveWfhMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...approveWfhMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getPendingRequestsForManagerQueryKey() });
      queryClient.invalidateQueries({ queryKey: ['teamPresence'] });
    }
  });
}

export function useRejectWfhMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...rejectWfhMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getPendingRequestsForManagerQueryKey() });
    }
  });
}
