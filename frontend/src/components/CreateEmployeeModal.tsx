import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { toast } from 'sonner';
import type { DepartmentDto, EmployeeDto, RegisterRequest } from '../client/types.gen';

const employeeSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  departmentCode: z.string().optional(),
  managerId: z.string().optional(),
  salary: z.number().optional(),
  role: z.enum(['ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_ADMIN']).optional()
});

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: DepartmentDto[];
  managersList: EmployeeDto[];
  onSubmit: (values: RegisterRequest) => Promise<void>;
  formLoading: boolean;
}

export function CreateEmployeeModal({
  isOpen,
  onClose,
  departments,
  managersList,
  onSubmit,
  formLoading,
}: CreateEmployeeModalProps) {
  const [formError, setFormError] = useState<string | null>(null);

  // Form hook initialized internally so it resets cleanly when the modal mounts/unmounts
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      jobTitle: '',
      departmentCode: departments?.[0]?.code || 'ENG',
      managerId: '',
      salary: 50000,
      role: 'ROLE_EMPLOYEE' as 'ROLE_EMPLOYEE' | 'ROLE_MANAGER' | 'ROLE_ADMIN'
    },
    validators: {
      onChange: employeeSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        await onSubmit(value);
      } catch (err: any) {
        setFormError(err.response?.data?.message || err.message || 'Error registering employee');
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
              <h3 className="text-base font-bold text-text uppercase tracking-wider">Register New Employee</h3>
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

              <form.Field name="password">
                {(field) => (
                  <FormItem>
                    <FormLabel>Initial Password</FormLabel>
                    <FormControl>
                      <input
                        id={field.name}
                        name={field.name}
                        type="password"
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
                <form.Field name="phone">
                  {(field) => (
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
                </form.Field>
                <form.Field name="jobTitle">
                  {(field) => (
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
                </form.Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="departmentCode">
                  {(field) => (
                    <FormItem>
                      <FormLabel>Department Code</FormLabel>
                      <FormControl>
                        <select
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all cursor-pointer"
                        >
                          {departments?.map((dept) => (
                            <option key={dept.id} value={dept.code}>
                              {dept.name} ({dept.code})
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                </form.Field>
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

              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="salary"
                  validators={{
                    onChange: ({ value }: { value: number }) => 
                      typeof value !== 'number' || isNaN(value) || value <= 0 ? 'Salary must be a positive number' : undefined
                  }}
                  children={(field) => (
                    <FormItem>
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
                <form.Field name="managerId">
                  {(field) => (
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
                          {managersList.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.firstName} {m.lastName}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                </form.Field>
              </div>

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
                  Register
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
