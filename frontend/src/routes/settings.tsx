import { createFileRoute } from '@tanstack/react-router';
import { useMeQuery } from '../hooks/useAuth';
import { SettingsHeader } from '../components/settings/SettingsHeader';
import { QuickJumps } from '../components/settings/QuickJumps';
import { ProfileCard } from '../components/settings/ProfileCard';
import { SecurityCard } from '../components/settings/SecurityCard';
import { AppearanceCard } from '../components/settings/AppearanceCard';

export const Route = createFileRoute('/settings')({
  component: SettingsComponent,
});

function SettingsComponent() {
  const { data: profile, isLoading: isProfileLoading } = useMeQuery();

  if (isProfileLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-mauve border-t-transparent" />
          <span className="text-sm text-subtext0">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <SettingsHeader />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation / Cards Index */}
        <div className="md:col-span-1 space-y-2">
          <QuickJumps />
        </div>

        {/* Configurations Forms Container */}
        <div className="md:col-span-2 space-y-8">
          {profile && <ProfileCard profile={profile} />}
          <SecurityCard />
          <AppearanceCard />
        </div>
      </div>
    </div>
  );
}
