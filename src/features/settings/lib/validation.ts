import { z } from 'zod';

export const createFinancialInstitutionSchema = z.object({
  name: z.string().min(1, 'Institution Name is required'),
  ifscCode: z
    .string()
    .min(11, 'IFSC Code must be 11 characters')
    .max(11, 'IFSC Code must be 11 characters')
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC Code format'),
  branch: z.string().min(1, 'Branch Name is required'),
  status: z.enum(['active', 'inactive'], {
    required_error: 'Status is required',
  }),
  contactName: z.string().min(1, 'Contact Name is required'),
  contactEmail: z.string().min(1, 'Email is required').email('Invalid email address'),
  contactPhone: z
    .string()
    .min(1, 'Phone number is required')
    .min(10, 'Phone must be at least 10 digits')
    .max(15, 'Phone cannot exceed 15 digits')
    .regex(
      /^[0-9+\-\s()]+$/,
      'Phone number can only contain digits, +, -, spaces, and parentheses',
    ),
});

export type CreateFinancialInstitutionFormData = z.infer<typeof createFinancialInstitutionSchema>;
