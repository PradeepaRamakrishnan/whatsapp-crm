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
        {/* Header Text */}

        <div className="space-y-2 text-center lg:text-left">
          <h2 className="text-3xl font-bold tracking-tight">Verify OTP</h2>
          <p className="text-muted-foreground">Enter the 6-digit code sent to your mobile number</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            otpForm.handleSubmit();
          }}
          className="space-y-6"
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
              <Field>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-gray-700 font-semibold text-[15px]"
                >
                  OTP Code
                </FieldLabel>
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
                  className="h-14 text-center text-2xl tracking-[0.5em] font-bold border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl transition-all"
                />
                <FieldError>
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0
                    ? field.state.meta.errors[0]
                    : null}
                </FieldError>
              </Field>
            )}
          </otpForm.Field>

          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
            >
              Verify & Proceed
            </Button>

            <p className="text-center text-sm text-gray-500">
              Didn't receive the code?{' '}
              <button type="button" className="text-orange-600 font-semibold hover:underline">
                Resend OTP
              </button>
            </p>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className=" space-y-6">
      {/* Header Text */}
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight">Get Started</h2>
        <p className="text-muted-foreground">Enter your details to check your eligibility</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          mobileForm.handleSubmit();
        }}
        className="space-y-6"
      >
        <div className="space-y-6">
          {/* Mobile Number Section */}
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
              <Field>
                <div className=" p-4 rounded-xl border ">
                  <FieldLabel htmlFor={field.name} className=" mb-2">
                    Enter your Mobile Number
                  </FieldLabel>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">+91</span>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="tel"
                      placeholder="9999911223"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value.replace(/[^0-9]/g, ''))}
                      className="h-12 text-lg border-gray-300 bg-white"
                    />
                  </div>
                  <p className="text-[11px]  mt-2">
                    We will be sending you an OTP to this number have it handy
                  </p>
                  <FieldError />
                </div>
              </Field>
            )}
          </mobileForm.Field>

          {/* Validate Using Section */}
          <div className=" p-5 rounded-xl border  space-y-4">
            <h3 className=" font-bold text-lg">Enter Details</h3>

            {/* Date of Birth Field */}
            <div className="space-y-2">
              <FieldLabel className="text-sm font-semibold ">Date of Birth</FieldLabel>
              <div className="flex gap-2">
                <mobileForm.Field name="dob_day">
                  {(field) => (
                    <Input
                      placeholder="DD"
                      maxLength={2}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-16 h-12 text-center"
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
                      className="w-16 h-12 text-center"
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
                      className="flex-1 h-12 text-center"
                    />
                  )}
                </mobileForm.Field>
              </div>
            </div>

            {/* OR Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-orange-200"></div>
              {/* <span className="flex-shrink mx-4  font-bold text-sm">OR</span> */}
              <div className="flex-grow border-t border-orange-200"></div>
            </div>

            {/* PAN Number Field */}
            <mobileForm.Field
              name="pan_number"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return undefined; // Optional if DOB is filled
                  const result = interestedSchema.shape.pan_number.safeParse(value);
                  return result.success ? undefined : result.error.errors[0].message;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <FieldLabel htmlFor={field.name} className="text-sm font-semibold ">
                    PAN Number
                  </FieldLabel>
                  <Input
                    id={field.name}
                    placeholder="Enter 10 digit PAN"
                    maxLength={10}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                    className="h-12 uppercase tracking-[0.2em] font-mono text-center"
                  />
                  <FieldError />
                </div>
              )}
            </mobileForm.Field>
          </div>
        </div>

        {/* Consent Text */}
        <div className="space-y-3 text-sm text-gray-600">
          <p className="leading-relaxed">
            By continuing the application process, I hereby agree/authorise the following
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li className="leading-relaxed">
              Samatva Awareness{' '}
              <span className="text-orange-600 underline ">Terms & Conditions</span> and{' '}
              <span className="text-orange-600 underline ">Privacy Policy</span>
            </li>
            <li className="leading-relaxed">
              I Allow Samatva Awareness and its lending partners to access my credit information
            </li>
          </ol>
        </div>

        <Button type="submit" className="w-full">
          Send OTP
        </Button>
      </form>
    </div>
  );
};
