import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FormItem, FormLabel, FormControl, FormMessage } from './ui/form';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: any;
  formError: string | null;
  formLoading: boolean;
  departments: any[];
  managersList: any[];
}

export function CreateEmployeeModal({
  isOpen,
  onClose,
  form,
  formError,
  formLoading,
  departments,
  managersList,
}: CreateEmployeeModalProps) {
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
                <form.Field
                  name="firstName"
                  validators={{
                    onChange: ({ value }: { value: string }) => !value ? 'First Name is required' : undefined
                  }}
                  children={(field: any) => (
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
                />
                <form.Field
                  name="lastName"
                  validators={{
                    onChange: ({ value }: { value: string }) => !value ? 'Last Name is required' : undefined
                  }}
                  children={(field: any) => (
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
                />
              </div>

              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }: { value: string }) => 
                    !value ? 'Email is required' : !/^\S+@\S+$/i.test(value) ? 'Invalid email address' : undefined
                }}
                children={(field: any) => (
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
              />

              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }: { value: string }) => 
                    !value ? 'Password is required' : value.length < 6 ? 'Password must be at least 6 characters' : undefined
                }}
                children={(field: any) => (
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
              />

              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="phone"
                  children={(field: any) => (
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
                  children={(field: any) => (
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
                  name="departmentCode"
                  children={(field: any) => (
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
                          {departments?.map((dept: any) => (
                            <option key={dept.id} value={dept.code}>
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
                  children={(field: any) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <select
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
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
                  children={(field: any) => (
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
                <form.Field
                  name="managerId"
                  children={(field: any) => (
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
                          {managersList.map((m: any) => (
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
