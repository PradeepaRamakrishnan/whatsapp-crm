'use client';

import { useForm } from '@tanstack/react-form';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { otpSchema } from '../lib/validation';
import { SuccessVerification } from './success-verification';

export const OtpVerificationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mobile = searchParams.get('mobile') || '';
  const campaignId = searchParams.get('campaignId');
  const contactId = searchParams.get('contactId');
  const [isVerified, setIsVerified] = useState(false);

  // Form for OTP
  const otpForm = useForm({
    defaultValues: {
      otp: '',
    },
    onSubmit: async () => {
      // Logic for successful verification
      setIsVerified(true);
    },
  });

  if (isVerified) {
    return <SuccessVerification campaignId={campaignId} contactId={contactId} />;
  }

  return (
    <>
      {/* Logo - Only shown when OTP form is visible */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-48 sm:w-56">
          <Image
            src="/assets/images/samatvalogo.png"
            alt="Samatva Awareness Logo"
            width={224}
            height={62}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* OTP Form */}
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-2 text-center">
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
              onSubmit: ({ value }) => {
                const result = otpSchema.shape.otp.safeParse(value);
                return result.success ? undefined : result.error.errors[0].message;
              },
            }}
          >
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor={field.name}>OTP Code</FieldLabel>
                <div className="flex justify-start py-2">
                  <InputOTP
                    maxLength={6}
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <div className="flex items-center justify-center px-2">
                      <span className="text-xl font-bold">-</span>
                    </div>
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
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
    </>
  );
};
