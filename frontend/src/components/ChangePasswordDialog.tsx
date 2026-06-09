import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authChangePasswordMutation } from '../client/@tanstack/react-query.gen';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { Button } from './ui/button';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function ChangePasswordDialog({ collapsed = false }: { collapsed?: boolean }) {
  const [open, setOpen] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    ...authChangePasswordMutation(),
    onSuccess: () => {
      toast.success('Password changed successfully');
      setOpen(false);
      form.reset();
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data ||
        'Failed to change password';
      setError(errMsg);
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
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      
      // Type cast temporarily until generated
      await mutation.mutateAsync({
        body: {
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        }
      } as any);
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-surface0 hover:bg-surface1 border border-surface1 hover:border-surface2 py-2 px-3 text-sm font-medium text-subtext1 hover:text-text transition-all cursor-pointer">
          <KeyRound className="h-4 w-4" />
          {!collapsed && <span>Change Password</span>}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-mantle border-surface1">
        <DialogHeader>
          <DialogTitle className="text-xl text-text flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-mauve" />
            Change Password
          </DialogTitle>
          <DialogDescription className="text-subtext0">
            Update your account password. Ensure your new password is secure.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4 mt-4"
        >
          {error && (
            <div className="rounded-lg bg-red/10 border border-red/20 p-3 text-sm text-red">
              {error}
            </div>
          )}

          <form.Field name="currentPassword">
            {(field) => (
              <div className="space-y-1">
                <label className="text-sm font-medium text-text">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={`w-full rounded-lg border ${field.state.meta.errors.length ? 'border-red' : 'border-surface2'} bg-surface0 px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-mauve`}
                    placeholder="Enter current password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-2.5 text-subtext0 hover:text-text"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="newPassword">
            {(field) => (
              <div className="space-y-1">
                <label className="text-sm font-medium text-text">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={`w-full rounded-lg border ${field.state.meta.errors.length ? 'border-red' : 'border-surface2'} bg-surface0 px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-mauve`}
                    placeholder="Enter new password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2.5 text-subtext0 hover:text-text"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => (
              <div className="space-y-1">
                <label className="text-sm font-medium text-text">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={`w-full rounded-lg border ${field.state.meta.errors.length ? 'border-red' : 'border-surface2'} bg-surface0 px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-mauve`}
                    placeholder="Confirm new password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-2.5 text-subtext0 hover:text-text"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  className="bg-surface0 text-text hover:bg-surface1 border-surface2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || mutation.isPending}
                  className="bg-mauve text-crust hover:bg-mauve/90"
                >
                  {isSubmitting || mutation.isPending ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            )}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
