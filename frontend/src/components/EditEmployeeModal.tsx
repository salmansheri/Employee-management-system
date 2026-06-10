import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { z } from 'zod';
import type { DepartmentDto, EmployeeDto } from '../client/types.gen';

const editEmployeeSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phone: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  salary: z.number().optional().nullable(),
  role: z.enum(['ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE']).optional()
});

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeDto;
  departments: DepartmentDto[];
  managersList: EmployeeDto[];
  onSubmit: (values: EmployeeDto) => Promise<void>;
  formLoading: boolean;
}

export function EditEmployeeModal({
  isOpen,
  onClose,
  employee,
  departments,
  managersList,
  onSubmit,
  formLoading,
}: EditEmployeeModalProps) {
  const [formError, setFormError] = useState<string | null>(null);

  // Form hook initialized internally based on the passed employee prop.
  // When this component remounts with a new employee (anchored by selectedEmployee.id key),
  // the hook correctly instantiates with the employee's current database values.
  const form = useForm({
    defaultValues: {
      id: employee?.id || '',
      firstName: employee?.firstName || '',
      lastName: employee?.lastName || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      jobTitle: employee?.jobTitle || '',
      departmentId: employee?.departmentId || '',
      managerId: employee?.managerId || '',
      salary: employee?.salary || 50000,
      role: (employee?.role || 'ROLE_EMPLOYEE') as 'ROLE_EMPLOYEE' | 'ROLE_MANAGER' | 'ROLE_ADMIN',
      status: (employee?.status || 'ACTIVE') as 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE'
    },
    validators: {
      onChange: editEmployeeSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        await onSubmit(value as EmployeeDto);
      } catch (err: any) {
        setFormError(err.response?.data?.message || err.message || 'Error updating employee');
      }
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-crust/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl glass-panel glass-panel-glow p-6 shadow-2xl z-10"
          >
            <div className="flex items-center justify-between pb-4 border-b border-surface0/60 mb-4">
              <h3 className="text-base font-bold text-text uppercase tracking-wider">Edit Profile Record</h3>
              <button onClick={onClose} className="text-subtext0 hover:text-text cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg bg-red/10 border border-red/20 p-3 text-xs text-red">
                {formError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
            >
              <div className="grid grid-cols-2 gap-4">
                <form.Field name="firstName">
                  {(field) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <input
                          id={field.name}
                          name={field.name}
                          type="text"
                          required
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all"
                        />
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                </form.Field>
                <form.Field name="lastName">
                  {(field) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <input
                          id={field.name}
                          name={field.name}
                          type="text"
                          required
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all"
                        />
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                </form.Field>
              </div>

              <form.Field name="email">
                {(field) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <input
                        id={field.name}
                        name={field.name}
                        type="email"
                        required
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all"
                      />
                    </FormControl>
                    <FormMessage>{field.state.meta.errors}</FormMessage>
                  </FormItem>
                )}
              </form.Field>

              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="phone"
                  children={(field) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <input
                          id={field.name}
                          name={field.name}
                          type="text"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all"
                        />
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                />
                <form.Field
                  name="jobTitle"
                  children={(field) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <input
                          id={field.name}
                          name={field.name}
                          type="text"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all"
                        />
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="departmentId"
                  children={(field) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <select
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all cursor-pointer"
                        >
                          <option value="">No Department</option>
                          {departments?.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name} ({dept.code})
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                />
                <form.Field
                  name="role"
                  children={(field) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <select
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all cursor-pointer"
                        >
                          <option value="ROLE_EMPLOYEE">Employee</option>
                          <option value="ROLE_MANAGER">Manager</option>
                          <option value="ROLE_ADMIN">Admin</option>
                        </select>
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <form.Field
                  name="salary"
                  validators={{
                    onChange: ({ value }: { value: number }) => 
                    typeof value !== 'number' || isNaN(value) || value <= 0 ? 'Salary must be a positive number' : undefined
                  }}
                  children={(field) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Salary ($/yr)</FormLabel>
                      <FormControl>
                        <input
                          id={field.name}
                          name={field.name}
                          type="number"
                          required
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all"
                        />
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                />
                <form.Field
                  name="status"
                  children={(field) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <select
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all cursor-pointer"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="ON_LEAVE">On Leave</option>
                          <option value="TERMINATED">Terminated</option>
                        </select>
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                />
              </div>

              <form.Field
                name="managerId"
                children={(field) => (
                  <FormItem>
                    <FormLabel>Reports To (Manager)</FormLabel>
                    <FormControl>
                      <select
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all cursor-pointer"
                      >
                        <option value="">No Manager (Independent)</option>
                        {managersList.filter((m) => m.id !== employee?.id).map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.firstName} {m.lastName}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage>{field.state.meta.errors}</FormMessage>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-surface0/60">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-surface0 hover:bg-surface1 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-mauve text-crust font-semibold transition-all hover:bg-mauve/90 cursor-pointer disabled:opacity-50"
                >
                  {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
