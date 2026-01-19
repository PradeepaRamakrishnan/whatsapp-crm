'use client';

import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
// import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { interestedSchema, otpSchema } from '../lib/validation';

// import { ChevronLeft } from 'lucide-react';

type Step = 'mobile' | 'otp';

export const InterestedForm = () => {
  // const router = useRouter();
  const [step, setStep] = useState<Step>('mobile');

  // Form for Mobile Number
  const mobileForm = useForm({
    defaultValues: {
      mobile: '',
      pan_number: '',
      dob_day: '',
      dob_month: '',
      dob_year: '',
    },
    onSubmit: async ({ value }) => {
      // console.log('OTP requested');
      setStep('otp');
    },
  });

  // Form for OTP
  const otpForm = useForm({
    defaultValues: {
      otp: '',
    },
    onSubmit: async ({ value }) => {
      // console.log('Verifying OTP:', value.otp);
      // Navigate to the full details form
      // router.push('/interested-form');
    },
  });

  if (step === 'otp') {
    return (
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Verify OTP</h2>
          <p className="text-muted-foreground">Enter the 6-digit code sent to your mobile number</p>
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
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Get Started</h2>
        <p className="text-muted-foreground">Enter your details to check your eligibility</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mobileForm.handleSubmit();
          return false;
        }}
        className="space-y-4"
      >
        <div className="space-y-4">
          <mobileForm.Field
            name="mobile"
            validators={{
              onChange: ({ value }) => {
                const result = interestedSchema.shape.phone_number.safeParse(value);
                return result.success ? undefined : result.error.errors[0].message;
              },
            }}
          >
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor={field.name}>Mobile Number</FieldLabel>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">+91</span>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="tel"
                    placeholder="9999911223"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value.replace(/[^0-9]/g, ''))}
                    onBlur={field.handleBlur}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We will send you an OTP to this number
                </p>
                <FieldError>
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0
                    ? field.state.meta.errors[0]
                    : null}
                </FieldError>
              </Field>
            )}
          </mobileForm.Field>

          <div className="space-y-4">
            <h3 className="font-semibold">Verification Details</h3>

            <div className="space-y-2">
              <FieldLabel>Date of Birth</FieldLabel>
              <div className="flex gap-2">
                <mobileForm.Field name="dob_day">
                  {(field) => (
                    <Input
                      placeholder="DD"
                      maxLength={2}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-20 text-center"
                    />
                  )}
                </mobileForm.Field>
                <mobileForm.Field name="dob_month">
                  {(field) => (
                    <Input
                      placeholder="MM"
                      maxLength={2}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-20 text-center"
                    />
                  )}
                </mobileForm.Field>
                <mobileForm.Field name="dob_year">
                  {(field) => (
                    <Input
                      placeholder="YYYY"
                      maxLength={4}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value.replace(/[^0-9]/g, ''))}
                      className="flex-1 text-center"
                    />
                  )}
                </mobileForm.Field>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <mobileForm.Field
              name="pan_number"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return undefined;
                  const result = interestedSchema.shape.pan_number.safeParse(value);
                  return result.success ? undefined : result.error.errors[0].message;
                },
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>PAN Number</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                    onBlur={field.handleBlur}
                    className="uppercase"
                  />
                  <FieldError>
                    {field.state.meta.isTouched && field.state.meta.errors.length > 0
                      ? field.state.meta.errors[0]
                      : null}
                  </FieldError>
                </Field>
              )}
            </mobileForm.Field>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>By continuing the application process, I hereby agree/authorise the following:</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>
              Samatva Awareness <span className="text-primary underline">Terms & Conditions</span>{' '}
              and <span className="text-primary underline">Privacy Policy</span>
            </li>
            <li>
              I allow Samatva Awareness and its lending partners to access my credit information
            </li>
          </ol>
        </div>

        <Button type="submit" className="w-full" disabled={mobileForm.state.isSubmitting}>
          {mobileForm.state.isSubmitting ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      </form>
    </div>
  );
};
