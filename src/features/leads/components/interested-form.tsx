'use client';

import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { markContactInterested } from '@/features/campaigns/services';
import { cn } from '@/lib/utils';
import { dateOfBirthValidator, panNumberValidator, phoneNumberValidator } from '../lib/validation';

export const InterestedForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(currentYear - 25, 0));

  const campaignId = searchParams.get('campaignId');
  const contactId = searchParams.get('contactId');
  const channel = searchParams.get('channel');

  useQuery({
    queryKey: ['markContactInterested', campaignId, contactId, channel],
    queryFn: () =>
      markContactInterested(campaignId as string, contactId as string, channel as string),
    enabled: !!campaignId && !!contactId,
    retry: 1,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 0,
  });

  const mobileForm = useForm({
    defaultValues: {
      mobile: '',
      pan_number: '',
      date_of_birth: undefined as Date | undefined,
    },
    validators: {
      onSubmit: ({ value }) => {
        // Validate that either DOB or PAN is provided
        if (!value.date_of_birth && !value.pan_number) {
          return {
            form: 'Please provide either Date of Birth or PAN Number',
            fields: {
              date_of_birth: 'Required if PAN is not provided',
              pan_number: 'Required if Date of Birth is not provided',
            },
          };
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        const params = new URLSearchParams({ mobile: value.mobile });
        if (campaignId) params.append('campaignId', campaignId);
        if (contactId) params.append('contactId', contactId);
        if (channel) params.append('channel', channel);
        if (value.date_of_birth) {
          params.append('date_of_birth', value.date_of_birth.toISOString());
        }
        if (value.pan_number) {
          params.append('pan_number', value.pan_number);
        }

        router.push(`/interested/otp?${params.toString()}`);
      } catch (error) {
        console.error('Failed to create lead:', error);
      }
    },
  });

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Get Started</h2>
        <p className="text-muted-foreground">Enter your details to check your eligibility</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mobileForm.handleSubmit();
          return false;
        }}
        className="space-y-6"
      >
        {/* Mobile Number Field */}
        <mobileForm.Field
          name="mobile"
          validators={{
            onChange: ({ value }) => {
              const result = phoneNumberValidator.safeParse(value);
              return result.success ? undefined : result.error.errors[0].message;
            },
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Mobile Number</FieldLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <span className="text-muted-foreground font-medium border-r pr-3">+91</span>
                </div>
                <Input
                  id={field.name}
                  name={field.name}
                  type="tel"
                  placeholder="9999911223"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value.replace(/[^0-9]/g, ''))}
                  onBlur={field.handleBlur}
                  className="pl-16"
                />
              </div>
              <FieldError>
                {field.state.meta.isTouched && field.state.meta.errors.length > 0
                  ? field.state.meta.errors[0]
                  : null}
              </FieldError>
            </Field>
          )}
        </mobileForm.Field>

        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Verification Details</h3>

          {/* Date of Birth Field */}
          <mobileForm.Field
            name="date_of_birth"
            validators={{
              onChange: ({ value, fieldApi }) => {
                const panNumber = fieldApi.form.getFieldValue('pan_number') as string;
                // If PAN is provided, DOB is optional
                if (panNumber && panNumber.length > 0) {
                  if (!value) return undefined;
                }
                // If no PAN and no DOB, show error
                if (!value && (!panNumber || panNumber.length === 0)) {
                  return 'Date of birth is required if PAN is not provided';
                }
                // Validate DOB if provided
                if (value) {
                  const result = dateOfBirthValidator.safeParse(value);
                  return result.success ? undefined : result.error.errors[0].message;
                }
                return undefined;
              },
            }}
          >
            {(field) => {
              const months = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ];
              const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i);

              return (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>
                    Date of Birth <span className="ml-0.5 text-destructive">*</span>
                  </FieldLabel>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal h-10',
                          !field.state.value && 'text-muted-foreground',
                          field.state.meta.errors.length > 0 &&
                            field.state.meta.isTouched &&
                            'border-destructive focus-visible:ring-destructive',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.state.value ? (
                          dayjs(field.state.value).format('MMMM D, YYYY')
                        ) : (
                          <span>Select date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="flex items-center gap-2 p-3 border-b">
                        <Select
                          value={String(calendarMonth.getMonth())}
                          onValueChange={(value) => {
                            const newMonth = new Date(calendarMonth);
                            newMonth.setMonth(Number.parseInt(value, 10));
                            setCalendarMonth(newMonth);
                          }}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month, index) => (
                              <SelectItem key={month} value={String(index)}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={String(calendarMonth.getFullYear())}
                          onValueChange={(value) => {
                            const newMonth = new Date(calendarMonth);
                            newMonth.setFullYear(Number.parseInt(value, 10));
                            setCalendarMonth(newMonth);
                          }}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {years.reverse().map((year) => (
                              <SelectItem key={year} value={String(year)}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Calendar
                        mode="single"
                        month={calendarMonth}
                        onMonthChange={setCalendarMonth}
                        selected={field.state.value}
                        onSelect={(date) => {
                          if (date) {
                            const normalizedDate = new Date(date);
                            normalizedDate.setHours(12, 0, 0, 0);
                            field.handleChange(normalizedDate);
                            // Trigger validation on PAN field
                            setTimeout(() => {
                              setPopoverOpen(false);
                              field.handleBlur();
                              field.form.validateField('pan_number', 'change');
                            }, 100);
                          }
                        }}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldError>
                    {field.state.meta.isTouched && field.state.meta.errors.length > 0
                      ? field.state.meta.errors[0]
                      : null}
                  </FieldError>
                </Field>
              );
            }}
          </mobileForm.Field>

          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div> */}

          {/* PAN Number Field */}
          <mobileForm.Field
            name="pan_number"
            validators={{
              onChange: ({ value, fieldApi }) => {
                const dateOfBirth = fieldApi.form.getFieldValue('date_of_birth') as
                  | Date
                  | undefined;
                if (dateOfBirth) {
                  if (!value || value.length === 0) return undefined;
                }
                // If no DOB and no PAN, show error
                if ((!value || value.length === 0) && !dateOfBirth) {
                  return 'PAN number is required if Date of Birth is not provided';
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
                <FieldLabel htmlFor={field.name}>
                  PAN Number <span className="ml-0.5 text-destructive">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="ENTER PAN (E.G. ABCDE1234F)"
                  maxLength={10}
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value.toUpperCase());
                    // Trigger validation on date_of_birth field
                    field.form.validateField('date_of_birth', 'change');
                  }}
                  onBlur={field.handleBlur}
                  className="uppercase font-mono tracking-widest"
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

        <div className="space-y-3 text-sm text-muted-foreground">
          <p>By continuing, I hereby agree/authorise the following:</p>
          <ul className="list-disc space-y-1.5 pl-4">
            <li>
              Samatva Awareness{' '}
              <span className="text-primary font-medium hover:underline cursor-pointer">
                Terms & Conditions
              </span>{' '}
              and{' '}
              <span className="text-primary font-medium hover:underline cursor-pointer">
                Privacy Policy
              </span>
            </li>
            <li>
              I allow Samatva Awareness and its lending partners to access my credit information
            </li>
          </ul>
        </div>

        {mobileForm.state.errors.length > 0 && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {mobileForm.state.errors[0]}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={mobileForm.state.isSubmitting}>
          {mobileForm.state.isSubmitting ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      </form>
    </div>
  );
};
