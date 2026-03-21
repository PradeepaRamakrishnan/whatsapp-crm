'use client';

import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import { loginSchema } from '../lib/validation';

export const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuth();
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        toast.loading('Logging in...', { id: 'login' });
        await login(value);
        toast.success('Logged in successfully!', { id: 'login' });
        window.location.href = '/dashboard';
        router.replace('/dashboard');
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message, { id: 'login' });
          return;
        }
        toast.error(`${error}`, { id: 'login' });
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
        return false;
      }}
      className="space-y-5"
    >
      <form.Field
        name="email"
        validators={{
          onChange: ({ value }) => {
            const result = loginSchema.shape.email.safeParse(value);
            return result.success ? undefined : result.error.errors[0].message;
          },
        }}
      >
        {(field) => (
          <Field data-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
            <FieldLabel htmlFor={field.name} className="text-foreground">
              Email address
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="h-11 px-4 py-3 text-sm"
            />
            <FieldError>
              {field.state.meta.isTouched && field.state.meta.errors.length > 0
                ? field.state.meta.errors[0]
                : null}
            </FieldError>
          </Field>
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onChange: ({ value }) => {
            const result = loginSchema.shape.password.safeParse(value);
            return result.success ? undefined : result.error.errors[0].message;
          },
        }}
      >
        {(field) => (
          <Field data-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
            <FieldLabel htmlFor={field.name} className="text-foreground">
              Password
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="h-11 px-4 py-3 text-sm"
            />
            <FieldError>
              {field.state.meta.isTouched && field.state.meta.errors.length > 0
                ? field.state.meta.errors[0]
                : null}
            </FieldError>
          </Field>
        )}
      </form.Field>

      <Button
        type="submit"
        disabled={form.state.isSubmitting}
        className="mt-2 h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        {form.state.isSubmitting ? 'Signing in...' : 'Sign In →'}
      </Button>
    </form>
  );
};
