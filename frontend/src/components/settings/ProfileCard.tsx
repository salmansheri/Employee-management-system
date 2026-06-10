import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useUpdateEmployeeMutation } from '../../hooks/useEmployees';
import { Button } from '../ui/button';
import { User, Smartphone, Briefcase, Save } from 'lucide-react';
import type { EmployeeDto } from '../../client/types.gen';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional().nullable(),
});

interface ProfileCardProps {
  profile: EmployeeDto;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const updateProfileMutation = useUpdateEmployeeMutation();

  const form = useForm({
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phone: profile?.phone || '',
    },
    validators: {
      onChange: profileSchema,
    },
    onSubmit: async ({ value }) => {
      if (!profile?.id) return;
      try {
        await updateProfileMutation.mutateAsync({
          path: { id: profile.id },
          body: {
            ...profile,
            firstName: value.firstName,
            lastName: value.lastName,
            phone: value.phone,
          } as any
        });
        toast.success('Profile updated successfully');
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
      }
    },
  });

  return (
    <section id="profile" className="rounded-2xl glass-panel p-6 space-y-6 scroll-mt-6">
      <div className="flex items-center gap-3 pb-4 border-b border-surface0/60">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mauve/10 text-mauve">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-text">Profile Information</h3>
          <p className="text-xs text-subtext0 mt-0.5">Update your basic communication details</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.Field name="firstName">
            {(field) => (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text uppercase tracking-wider">First Name</label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full rounded-lg border border-surface2 bg-surface0 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-mauve"
                  placeholder="First name"
                />
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

          <form.Field name="lastName">
            {(field) => (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text uppercase tracking-wider">Last Name</label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full rounded-lg border border-surface2 bg-surface0 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-mauve"
                  placeholder="Last name"
                />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full rounded-lg border border-surface1 bg-surface0/50 px-3 py-2 text-sm text-subtext0 cursor-not-allowed opacity-80"
            />
            <p className="text-[10px] text-subtext1">Email address cannot be changed directly.</p>
          </div>

          <form.Field name="phone">
            {(field) => (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1">
                  <Smartphone className="h-3.5 w-3.5 text-mauve" />
                  Phone Number
                </label>
                <input
                  type="text"
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full rounded-lg border border-surface2 bg-surface0 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-mauve"
                  placeholder="+1 (555) 000-0000"
                />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 text-mauve" />
              Job Title
            </label>
            <input
              type="text"
              value={profile?.jobTitle || 'N/A'}
              disabled
              className="w-full rounded-lg border border-surface1 bg-surface0/50 px-3 py-2 text-sm text-subtext0 cursor-not-allowed opacity-80"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text uppercase tracking-wider">Department</label>
            <input
              type="text"
              value={profile?.departmentCode ? `${profile.departmentName || ''} (${profile.departmentCode})` : 'Unassigned'}
              disabled
              className="w-full rounded-lg border border-surface1 bg-surface0/50 px-3 py-2 text-sm text-subtext0 cursor-not-allowed opacity-80"
            />
          </div>
        </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || updateProfileMutation.isPending}
                className="bg-mauve text-crust hover:bg-mauve/90 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting || updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          )}
        />
      </form>
    </section>
  );
}
