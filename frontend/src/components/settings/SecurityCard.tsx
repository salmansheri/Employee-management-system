import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { changePasswordMutation as authChangePasswordMutation } from '../../client/@tanstack/react-query.gen';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Lock, Eye, EyeOff } from 'lucide-react';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function SecurityCard() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const changePasswordMutation = useMutation({
    ...authChangePasswordMutation(),
    onSuccess: () => {
      toast.success('Password changed successfully');
      form.reset();
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data ||
        'Failed to change password';
      toast.error(typeof errMsg === 'string' ? errMsg : 'Password change failed');
    }
  });

  const form = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validators: {
      onChange: passwordSchema,
    },
    onSubmit: async ({ value }) => {
      await changePasswordMutation.mutateAsync({
        body: {
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        }
      } as any);
    },
  });

  return (
    <section id="security" className="rounded-2xl glass-panel p-6 space-y-6 scroll-mt-6">
      <div className="flex items-center gap-3 pb-4 border-b border-surface0/60">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue/10 text-blue">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-text">Security & Credentials</h3>
          <p className="text-xs text-subtext0 mt-0.5">Manage your account access password</p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="currentPassword">
          {(field) => (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text uppercase tracking-wider">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full rounded-lg border border-surface2 bg-surface0 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Enter current password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-subtext0 hover:text-text cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-red mt-1">
                  {typeof field.state.meta.errors[0] === 'string'
                    ? field.state.meta.errors[0]
                    : (field.state.meta.errors[0] as any)?.message || 'Invalid value'}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.Field name="newPassword">
            {(field) => (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full rounded-lg border border-surface2 bg-surface0 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-blue"
                    placeholder="Min 6 characters"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2.5 text-subtext0 hover:text-text cursor-pointer"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red mt-1">
                    {typeof field.state.meta.errors[0] === 'string'
                      ? field.state.meta.errors[0]
                      : (field.state.meta.errors[0] as any)?.message || 'Invalid value'}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full rounded-lg border border-surface2 bg-surface0 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-blue"
                    placeholder="Re-type password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-2.5 text-subtext0 hover:text-text cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red mt-1">
                    {typeof field.state.meta.errors[0] === 'string'
                      ? field.state.meta.errors[0]
                      : (field.state.meta.errors[0] as any)?.message || 'Invalid value'}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || changePasswordMutation.isPending}
                className="bg-blue text-crust hover:bg-blue/90 flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                {isSubmitting || changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          )}
        />
      </form>
    </section>
  );
}
