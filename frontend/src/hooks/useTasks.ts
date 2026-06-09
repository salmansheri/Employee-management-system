import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getMyTasksOptions, 
  getTasksCreatedByOptions, 
  createTaskMutation, 
  updateTaskStatusMutation, 
  deleteTaskMutation,
  getMyTasksQueryKey,
  getTasksCreatedByQueryKey
} from '../client/@tanstack/react-query.gen';

export function useMyTasksQuery() {
  return useQuery({
    ...getMyTasksOptions(),
  });
}

export function useCreatedTasksQuery(enabled: boolean) {
  return useQuery({
    ...getTasksCreatedByOptions(),
    enabled,
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...createTaskMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getTasksCreatedByQueryKey() });
    }
  });
}

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...updateTaskStatusMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getMyTasksQueryKey() });
      queryClient.invalidateQueries({ queryKey: getTasksCreatedByQueryKey() });
    }
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...deleteTaskMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getTasksCreatedByQueryKey() });
      queryClient.invalidateQueries({ queryKey: getMyTasksQueryKey() });
    }
  });
}
