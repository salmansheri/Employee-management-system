import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getPunchStatusOptions, 
  punchInMutation as genPunchInMutation, 
  punchOutMutation as genPunchOutMutation, 
  getTotalHoursOptions, 
  getAllAttendanceByDateOptions,
  getPunchStatusQueryKey,
  getTotalHoursQueryKey,
  getAllAttendanceByDateQueryKey
} from '../client/@tanstack/react-query.gen';

export function usePunchStatusQuery() {
  return useQuery({
    ...getPunchStatusOptions(),
  });
}

export function usePunchInMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...genPunchInMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getPunchStatusQueryKey() });
      queryClient.invalidateQueries({ queryKey: ['teamPresence'] }); // Invalidate overall list
      queryClient.invalidateQueries({ queryKey: ['workHours'] });
    }
  });
}

export function usePunchOutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...genPunchOutMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getPunchStatusQueryKey() });
      queryClient.invalidateQueries({ queryKey: ['teamPresence'] });
      queryClient.invalidateQueries({ queryKey: ['workHours'] });
    }
  });
}

export function useWorkHoursQuery(employeeId: string | undefined, startDate: string, endDate: string) {
  return useQuery({
    ...getTotalHoursOptions({
      query: {
        employeeId: employeeId || '',
        startDate,
        endDate
      }
    }),
    enabled: !!employeeId,
  });
}

export function useTeamPresenceQuery(date: string) {
  return useQuery({
    ...getAllAttendanceByDateOptions({
      path: { date }
    }),
    refetchInterval: 30000,
  });
}
