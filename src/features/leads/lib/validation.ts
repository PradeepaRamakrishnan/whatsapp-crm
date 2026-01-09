import { z } from 'zod';

export const interestedSchema = z.object({
  phone_number: z
    .string()
    .min(10, 'Mobile number must be 10 digits')
    .max(10, 'Mobile number must be 10 digits')
    .regex(/^[0-9]+$/, 'Please enter a valid mobile number'),
  pan_number: z
    .string()
    .length(10, 'PAN number must be 10 characters')
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number'),
  dob_day: z.string().min(1, 'Day required').max(2),
  dob_month: z.string().min(1, 'Month required').max(2),
  dob_year: z.string().length(4, 'Year required'),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^[0-9]+$/, 'Please enter a valid OTP'),
});

export type InterestedFormData = z.infer<typeof interestedSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
