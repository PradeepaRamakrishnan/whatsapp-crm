'use client';

import { useForm } from '@tanstack/react-form';
import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  dateOfBirthValidator,
  interestedSchema,
  otpSchema,
  panNumberValidator,
  phoneNumberValidator,
} from '../lib/validation';

type Step = 'mobile' | 'otp';

export const InterestedForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const isOtpStep = pathname?.includes('/otp');
  const step: Step = isOtpStep ? 'otp' : 'mobile';

  useEffect(() => {
    // Access search params only on client side
    setSearchParams(new URLSearchParams(window.location.search));
  }, []);
  const mobileNumber = searchParams?.get('mobile') || '';

  // Form for Mobile Number
  const mobileForm = useForm({
    defaultValues: {
      mobile: '',
      pan_number: '',
      date_of_birth: undefined as Date | undefined,
    },
    onSubmit: async ({ value }) => {
      // Validate the entire form
      const result = interestedSchema.safeParse({
        phone_number: value.mobile,
        pan_number: value.pan_number || undefined,
        date_of_birth: value.date_of_birth,
      });

      if (!result.success) {
        // Validation failed - errors are already shown by field validators
        return;
      }

      // Update URL to /interested/otp with mobile number
      router.push(`/interested/otp?mobile=${value.mobile}`);
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
      router.push('/interested-form');
    },
  });

  // Show OTP form if step is 'otp'
  if (step === 'otp') {
    return (
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Verify OTP</h2>
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code sent to <span className="font-semibold">+91 {mobileNumber}</span>
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
                  className="text-center tracking-widest text-lg"
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
              onClick={() => {
                router.push('/interested');
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to form
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Show mobile form by default
  return (
    <div className="w-full max-w-lg space-y-3">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Get Started</h2>
        <p className="text-xs text-muted-foreground">
          Enter your details to check your eligibility
        </p>
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
          {/* Mobile Number Field */}
          <mobileForm.Field
            name="mobile"
            validators={{
              onChange: ({ value }) => {
                const result = phoneNumberValidator.safeParse(value);
                return result.success ? undefined : result.error.errors[0].message;
              },
              onSubmit: ({ value }) => {
                const result = phoneNumberValidator.safeParse(value);
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

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Verification Details</h3>

            {/* Date of Birth Field */}
            <mobileForm.Field
              name="date_of_birth"
              validators={{
                onChange: ({ value, fieldApi }) => {
                  // Get current form values
                  const panValue = fieldApi.form.getFieldValue('pan_number');

                  // If both are empty, show error
                  if (!value && !panValue) {
                    return 'Date of Birth is required ';
                  }

                  // If DOB is provided, validate it
                  if (value) {
                    const result = dateOfBirthValidator.safeParse(value);
                    return result.success ? undefined : result.error.errors[0].message;
                  }

                  return undefined;
                },
                onSubmit: ({ value, fieldApi }) => {
                  const panValue = fieldApi.form.getFieldValue('pan_number');

                  if (!value && !panValue) {
                    return 'Date of Birth is required';
                  }

                  if (value) {
                    const result = dateOfBirthValidator.safeParse(value);
                    return result.success ? undefined : result.error.errors[0].message;
                  }

                  return undefined;
                },
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel>Date of Birth</FieldLabel>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.state.value && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.state.value ? (
                          dayjs(field.state.value).format('MMMM D, YYYY')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.state.value}
                        onSelect={(date) => {
                          if (date) {
                            field.handleChange(date);
                            setPopoverOpen(false);
                            // Trigger validation
                            field.handleBlur();
                          }
                        }}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                        captionLayout="dropdown"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldError>
                    {field.state.meta.isTouched && field.state.meta.errors.length > 0
                      ? field.state.meta.errors[0]
                      : null}
                  </FieldError>
                </Field>
              )}
            </mobileForm.Field>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* PAN Number Field */}
            <mobileForm.Field
              name="pan_number"
              validators={{
                onChange: ({ value, fieldApi }) => {
                  // Get current form values
                  const dobValue = fieldApi.form.getFieldValue('date_of_birth');

                  // If both are empty, show error
                  if (!value && !dobValue) {
                    return 'PAN Number is required ';
                  }

                  // If PAN is provided, validate it
                  if (value && value.length > 0) {
                    const result = panNumberValidator.safeParse(value);
                    return result.success ? undefined : result.error.errors[0].message;
                  }

                  return undefined;
                },
                onSubmit: ({ value, fieldApi }) => {
                  const dobValue = fieldApi.form.getFieldValue('date_of_birth');

                  if (!value && !dobValue) {
                    return 'PAN Number is required';
                  }

                  if (value && value.length > 0) {
                    const result = panNumberValidator.safeParse(value);
                    return result.success ? undefined : result.error.errors[0].message;
                  }

                  return undefined;
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
          <ol className="list-inside list-decimal space-y-1 pl-2">
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
