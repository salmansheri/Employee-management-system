import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllEmployeesOptions, 
  getAllDepartmentsOptions, 
  registerMutation, 
  updateEmployeeMutation, 
  deleteEmployeeMutation,
  getAllEmployeesQueryKey
} from '../client/@tanstack/react-query.gen';

export function useEmployeesQuery() {
  return useQuery({
    ...getAllEmployeesOptions(),
  });
}

export function useDepartmentsQuery() {
  return useQuery({
    ...getAllDepartmentsOptions(),
  });
}

export function useRegisterEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...registerMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllEmployeesQueryKey() });
    }
  });
}

export function useUpdateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...updateEmployeeMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllEmployeesQueryKey() });
    }
  });
}

export function useDeleteEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...deleteEmployeeMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllEmployeesQueryKey() });
    }
  });
}
