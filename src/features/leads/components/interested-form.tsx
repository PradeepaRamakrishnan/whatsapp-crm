'use client';

import { useForm } from '@tanstack/react-form';
import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldError, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
// import {
//   dateOfBirthValidator,
//   interestedSchema,
//   panNumberValidator,
//   phoneNumberValidator,
// } from '../lib/validation';

export const InterestedForm = () => {
  const router = useRouter();
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Form for Mobile Number
  const mobileForm = useForm({
    defaultValues: {
      mobile: '',
      pan_number: '',
      date_of_birth: undefined as Date | undefined,
    },
    onSubmit: async ({ value }) => {
      // Update URL to /interested/otp with mobile number
      router.push(`/interested/otp?mobile=${value.mobile}`);
    },
  });

  // Form for OTP

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
          <mobileForm.Field name="mobile">
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
            <mobileForm.Field name="date_of_birth">
              {(field) => (
                <FieldSet className="flex flex-col w-full">
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Date of Birth *</FieldLabel>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                      <PopoverTrigger
                        asChild
                        disabled={false}
                        aria-invalid={
                          !!field.state.meta.errors.length && field.state.meta.isTouched
                        }
                      >
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'group w-full justify-start text-left font-normal transition-all hover:bg-gray-50',
                            !field.state.value && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4 transition-colors" />
                          {field.state.value ? (
                            dayjs(field.state.value).format('MMMM D, YYYY')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto border border-gray-200 p-0 shadow-lg"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.state.value}
                          onSelect={(date) => {
                            if (date) {
                              field.handleChange(date);
                              setPopoverOpen(false);
                              field.handleBlur();
                            }
                          }}
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          initialFocus
                          aria-invalid={
                            !!field.state.meta.errors.length && field.state.meta.isTouched
                          }
                          className="rounded-lg bg-white p-3"
                          classNames={{
                            months: 'space-y-4',
                            month: 'space-y-4',
                            caption: 'flex justify-center pt-1 relative items-center px-10',
                            caption_label: 'text-sm font-medium text-gray-900',
                            nav: 'space-x-1 flex items-center',
                            nav_button:
                              'h-7 w-7 bg-transparent p-0 hover:bg-gray-100 text-gray-700 border-none rounded-md transition-all inline-flex items-center justify-center',
                            nav_button_previous: 'absolute left-1',
                            nav_button_next: 'absolute right-1',
                            table: 'w-full border-collapse space-y-1',
                            head_row: 'flex',
                            head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.6rem]',
                            row: 'flex w-full mt-2',
                            cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-100/50 [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                            day: 'h-9 w-9 p-0 font-medium  text-sm text-center aria-selected:opacity-100 hover:bg-gray-100 rounded-md transition-colors',
                            day_range_end: 'day-range-end',
                            day_selected:
                              'bg-gray-900 text-white hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white',
                            day_today: 'bg-gray-100 text-gray-900',
                            day_outside:
                              'day-outside text-gray-400 opacity-50 aria-selected:bg-gray-100/50 aria-selected:text-gray-500',
                            day_disabled: 'text-gray-400 opacity-50',
                            day_range_middle:
                              'aria-selected:bg-gray-100 aria-selected:text-gray-900',
                            day_hidden: 'invisible',
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FieldError>
                      {field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? field.state.meta.errors[0]
                        : null}
                    </FieldError>
                  </Field>
                </FieldSet>
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
            <mobileForm.Field name="pan_number">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>
                    PAN Number <span className="ml-0.5 text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="ENTER 10 DIGIT PAN"
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
