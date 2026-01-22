import dayjs from 'dayjs';
import { z } from 'zod';

// Individual field validators for direct access
export const phoneNumberValidator = z
  .string()
  .min(1, 'Mobile number is required')
  .min(10, 'Mobile number must be 10 digits')
  .max(10, 'Mobile number must be 10 digits')
  .regex(/^[0-9]+$/, 'Please enter a valid mobile number');

export const panNumberValidator = z
  .string()
  .min(1, 'PAN number is required')
  .length(10, 'PAN number must be 10 characters')
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number');

export const dateOfBirthValidator = z
  .date({
    required_error: 'Date of birth is required',
    invalid_type_error: 'Please select a valid date',
  })
  .refine(
    (date) => {
      const year = dayjs(date).year();
      return year >= 1900 && year <= dayjs().year();
    },
    { message: 'Please enter a valid date of birth' },
  );

export const interestedSchema = z
  .object({
    phone_number: phoneNumberValidator,
    pan_number: z.string().optional(),
    date_of_birth: z.date().optional(),
  })
  .refine(
    (data) => {
      // Either DOB or PAN must be provided
      return !!data.date_of_birth || !!data.pan_number;
    },
    {
      message: 'Please provide either Date of Birth or PAN Number',
      path: ['date_of_birth'],
    },
  )
  .refine(
    (data) => {
      // If PAN is provided, validate it
      if (data.pan_number && data.pan_number.length > 0) {
        return panNumberValidator.safeParse(data.pan_number).success;
      }
      return true;
    },
    {
      message: 'Please enter a valid PAN number',
      path: ['pan_number'],
    },
  )
  .refine(
    (data) => {
      // If DOB is provided, validate it
      if (data.date_of_birth) {
        return dateOfBirthValidator.safeParse(data.date_of_birth).success;
      }
      return true;
    },
    {
      message: 'Please enter a valid date of birth',
      path: ['date_of_birth'],
    },
  );

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^[0-9]+$/, 'Please enter a valid OTP'),
});

export const interestedDetailsSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  employmentType: z.string().min(1, 'Employment type is required'),
  monthlyIncome: z
    .string()
    .min(1, 'Monthly income is required')
    .regex(/^[0-9]+$/, 'Please enter a valid amount'),
  loanAmount: z
    .string()
    .min(1, 'Loan amount is required')
    .regex(/^[0-9]+$/, 'Please enter a valid amount'),
  purpose: z.string().min(1, 'Purpose of loan is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  pincode: z
    .string()
    .min(1, 'Pincode is required')
    .length(6, 'Pincode must be 6 digits')
    .regex(/^[0-9]+$/, 'Pincode must contain only numbers'),
});

export type InterestedFormData = z.infer<typeof interestedSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type InterestedDetailsFormData = z.infer<typeof interestedDetailsSchema>;
