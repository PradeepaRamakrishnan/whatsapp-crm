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

        router.replace('/dashboard');
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message, {
            id: 'login',
          });
          return;
        }
        toast.error(`${error}`, {
          id: 'login',
        });
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
      className="space-y-4"
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
          <Field data-invalid={field.state.meta.errors.length > 0}>
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
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
          <Field data-invalid={field.state.meta.errors.length > 0}>
            <FieldLabel htmlFor={field.name}>Password</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            <FieldError>
              {field.state.meta.isTouched && field.state.meta.errors.length > 0
                ? field.state.meta.errors[0]
                : null}
            </FieldError>
          </Field>
        )}
      </form.Field>

      <Button type="submit" className="w-full" disabled={form.state.isSubmitting}>
        {form.state.isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};
