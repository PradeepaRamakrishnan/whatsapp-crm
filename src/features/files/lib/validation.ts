import { z } from 'zod';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const fileUploadSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(1, 'At least one file is required')
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
      'Each file must be less than 10MB',
    )
    .refine(
      (files) =>
        files.every(
          (file) =>
            ACCEPTED_FILE_TYPES.includes(file.type) ||
            file.name.endsWith('.csv') ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls'),
        ),
      'Only .csv, .xls, and .xlsx formats are supported',
    ),
  customFileName: z.string().min(1, 'List name is required'),
});

export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
