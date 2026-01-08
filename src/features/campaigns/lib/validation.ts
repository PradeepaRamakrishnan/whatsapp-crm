import { z } from 'zod';

export const validationErrorSchema = z.object({
  row: z.number(),
  field: z.string(),
  message: z.string(),
});

export const fileValidationResultSchema = z.object({
  isValid: z.boolean(),
  totalRows: z.number(),
  validRows: z.number(),
  invalidRows: z.number(),
  errors: z.array(validationErrorSchema),
  missingFields: z.array(z.string()).optional(),
});

export const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  status: z.enum(['Draft', 'Scheduled', 'Active']),
  scheduledDate: z.string().optional(),
  responseRate: z.number().min(0).max(100).optional(),
  borrowersFile: z.instanceof(File).nullable(),
  validationResult: fileValidationResultSchema.nullable().optional(),
});

export type ValidationError = z.infer<typeof validationErrorSchema>;
export type FileValidationResult = z.infer<typeof fileValidationResultSchema>;
export type CampaignFormData = z.infer<typeof campaignSchema>;
