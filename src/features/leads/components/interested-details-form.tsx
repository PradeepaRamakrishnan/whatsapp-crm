'use client';

import { useForm } from '@tanstack/react-form';
import { CheckCircle2, IndianRupee, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { interestedDetailsSchema } from '../lib/validation';

export const InterestedDetailsForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      employmentType: '',
      monthlyIncome: '',
      loanAmount: '',
      purpose: '',
      state: '',
      city: '',
      pincode: '',
    },
    onSubmit: async () => {
      setIsSubmitted(true);
    },
  });

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="h-24 w-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Application Submitted!</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Thank you for sharing your details. Our financial advisor will review your application
            and contact you within 24 hours.
          </p>
        </div>
        <Button variant="outline" className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Tell us about yourself</h1>
        <p className="text-muted-foreground">
          We need a few more details to offer you the best credit solutions.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
          return false;
        }}
        className="space-y-4"
      >
        {/* Full Name */}
        <form.Field
          name="fullName"
          validators={{
            onChange: ({ value }) => {
              const result = interestedDetailsSchema.shape.fullName.safeParse(value);
              return result.success ? undefined : result.error.errors[0].message;
            },
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Full Name (As per PAN)</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                placeholder="Enter your full name"
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

        {/* Email */}
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              const result = interestedDetailsSchema.shape.email.safeParse(value);
              return result.success ? undefined : result.error.errors[0].message;
            },
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                placeholder="yourname@gmail.com"
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

        {/* Employment Type */}
        <form.Field
          name="employmentType"
          validators={{
            onChange: ({ value }) => {
              const result = interestedDetailsSchema.shape.employmentType.safeParse(value);
              return result.success ? undefined : result.error.errors[0].message;
            },
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Employment Type</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value);
                  field.handleBlur();
                }}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salaried">Salaried</SelectItem>
                  <SelectItem value="self-employed">Self Employed</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
              <FieldError>
                {field.state.meta.isTouched && field.state.meta.errors.length > 0
                  ? field.state.meta.errors[0]
                  : null}
              </FieldError>
            </Field>
          )}
        </form.Field>

        {/* Monthly Income */}
        <form.Field
          name="monthlyIncome"
          validators={{
            onChange: ({ value }) => {
              const result = interestedDetailsSchema.shape.monthlyIncome.safeParse(value);
              return result.success ? undefined : result.error.errors[0].message;
            },
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Monthly Income</FieldLabel>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  placeholder="e.g. 50000"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="pl-9"
                />
              </div>
              <FieldError>
                {field.state.meta.isTouched && field.state.meta.errors.length > 0
                  ? field.state.meta.errors[0]
                  : null}
              </FieldError>
            </Field>
          )}
        </form.Field>

        {/* Loan Amount */}
        <form.Field
          name="loanAmount"
          validators={{
            onChange: ({ value }) => {
              const result = interestedDetailsSchema.shape.loanAmount.safeParse(value);
              return result.success ? undefined : result.error.errors[0].message;
            },
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Desired Loan Amount</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                placeholder="e.g. 500000"
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

        {/* Purpose of Loan */}
        <form.Field
          name="purpose"
          validators={{
            onChange: ({ value }) => {
              const result = interestedDetailsSchema.shape.purpose.safeParse(value);
              return result.success ? undefined : result.error.errors[0].message;
            },
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Purpose of Loan</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value);
                  field.handleBlur();
                }}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder="Reason for loan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debt-consolidation">Debt Consolidation</SelectItem>
                  <SelectItem value="home-improvement">Home Improvement</SelectItem>
                  <SelectItem value="business-expansion">Business Expansion</SelectItem>
                  <SelectItem value="marriage">Marriage</SelectItem>
                  <SelectItem value="medical">Medical Emergency</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
              <FieldError>
                {field.state.meta.isTouched && field.state.meta.errors.length > 0
                  ? field.state.meta.errors[0]
                  : null}
              </FieldError>
            </Field>
          )}
        </form.Field>

        {/* State and City - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* State */}
          <form.Field
            name="state"
            validators={{
              onChange: ({ value }) => {
                const result = interestedDetailsSchema.shape.state.safeParse(value);
                return result.success ? undefined : result.error.errors[0].message;
              },
            }}
          >
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor={field.name}>State</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="State"
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

          {/* City */}
          <form.Field
            name="city"
            validators={{
              onChange: ({ value }) => {
                const result = interestedDetailsSchema.shape.city.safeParse(value);
                return result.success ? undefined : result.error.errors[0].message;
              },
            }}
          >
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor={field.name}>City</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="City"
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
        </div>

        {/* Pincode */}
        <form.Field
          name="pincode"
          validators={{
            onChange: ({ value }) => {
              const result = interestedDetailsSchema.shape.pincode.safeParse(value);
              return result.success ? undefined : result.error.errors[0].message;
            },
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Pincode</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                placeholder="6-digit Pincode"
                maxLength={6}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value.replace(/[^0-9]/g, ''))}
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
          {form.state.isSubmitting ? (
            'Submitting...'
          ) : (
            <>
              Submit Application
              <Send className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
