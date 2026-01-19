'use client';

import { useForm } from '@tanstack/react-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { otpSchema } from '../lib/validation';

export const OtpVerificationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mobile = searchParams.get('mobile') || '';

  // Form for OTP
  const otpForm = useForm({
    defaultValues: {
      otp: '',
    },
    onSubmit: async ({ value }) => {
      // console.log('Verifying OTP:', value.otp);
      // Navigate to the full details form
      router.push('/interested-form');
    },
  });

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Verify OTP</h2>
        <p className="text-muted-foreground">
          Enter the 6-digit code sent to{' '}
          {mobile && <span className="font-semibold">+91 {mobile}</span>}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          otpForm.handleSubmit();
          return false;
        }}
        className="space-y-4"
      >
        <otpForm.Field
          name="otp"
          validators={{
            onChange: ({ value }) => {
              const result = otpSchema.shape.otp.safeParse(value);
              return result.success ? undefined : result.error.errors[0].message;
            },
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>OTP Code</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                maxLength={6}
                placeholder="000000"
                value={field.state.value}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  field.handleChange(val);
                }}
                onBlur={field.handleBlur}
                className="text-center tracking-widest"
              />
              <FieldError>
                {field.state.meta.isTouched && field.state.meta.errors.length > 0
                  ? field.state.meta.errors[0]
                  : null}
              </FieldError>
            </Field>
          )}
        </otpForm.Field>

        <Button type="submit" className="w-full" disabled={otpForm.state.isSubmitting}>
          {otpForm.state.isSubmitting ? 'Verifying...' : 'Verify & Proceed'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Didn't receive the code?{' '}
          <button type="button" className="text-primary hover:underline">
            Resend OTP
          </button>
        </p>

        <div className="pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to form
          </button>
        </div>
      </form>
    </div>
  );
};
