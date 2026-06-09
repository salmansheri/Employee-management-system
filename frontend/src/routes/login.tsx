import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useAuthStore } from '../store/useAuthStore';
import { useLoginMutation } from '../hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, Loader2, Building2 } from 'lucide-react';
import { FormItem, FormLabel, FormControl, FormMessage } from '../components/ui/form';
import { toast } from 'sonner';

export const Route = createFileRoute('/login')({
  component: LoginComponent,
});

function LoginComponent() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      if (!value.email || !value.password) {
        setError('Please fill in all fields');
        return;
      }
      setError(null);

      try {
        await loginMutation.mutateAsync({
          body: value,
        });
        toast.success('Signed in successfully', {
          description: 'Welcome back to your EMS dashboard.'
        });
        navigate({ to: '/' });
      } catch (err: any) {
        console.error('Login error:', err);
        const errMsg = err.response?.data?.message ||
          err.response?.data?.error ||
          'Invalid email or password. Please try again.';
        setError(errMsg);
        toast.error('Authentication failed', {
          description: errMsg
        });
      }
    },
  });

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-mauve/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-blue/10 blur-3xl" />

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-mauve to-blue shadow-lg shadow-mauve/20">
            <Building2 className="h-9 w-9 text-crust" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-text">
            EMS Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-subtext0">
            Sign in to manage employees, tasks, and leave requests
          </p>
        </div>

        <div className="glass-panel glass-panel-glow mt-8 rounded-2xl p-8 shadow-2xl">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            {error && (
              <div className="rounded-lg bg-red/10 border border-red/20 p-3 text-sm text-red">
                {error}
              </div>
            )}

            <form.Field
              name="email"
              validators={{
                onChange: ({ value }: { value: string }) => 
                  !value ? 'Email is required' : !/^\S+@\S+$/i.test(value) ? 'Invalid email address' : undefined
              }}
              children={(field) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-surface2" />
                    </div>
                    <input
                      id={field.name}
                      name={field.name}
                      type="email"
                      autoComplete="email"
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="block w-full rounded-lg border border-surface0 bg-mantle py-2.5 pl-10 pr-3 text-text placeholder-surface2 outline-none transition-all focus:border-mauve focus:ring-2 focus:ring-mauve/20 sm:text-sm"
                      placeholder="name@company.com"
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
              children={(field) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-surface2" />
                    </div>
                    <input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="block w-full rounded-lg border border-surface0 bg-mantle py-2.5 pl-10 pr-10 text-text placeholder-surface2 outline-none transition-all focus:border-mauve focus:ring-2 focus:ring-mauve/20 sm:text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-surface2 hover:text-text cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </FormControl>
                  <FormMessage>{field.state.meta.errors}</FormMessage>
                </FormItem>
              )}
            />

            <div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="group relative flex w-full justify-center rounded-lg bg-mauve py-2.5 px-4 text-sm font-semibold text-crust transition-all hover:bg-mauve/95 focus:outline-none focus:ring-2 focus:ring-mauve/50 disabled:opacity-50 cursor-pointer"
              >
                {loginMutation.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-surface0 pt-6 text-center">
            <span className="text-xs text-subtext0">
              Demo Credentials: admin@ems.dev / admin123
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
