import { z } from 'zod';

export const templateSchema = z.object({
  name: z.string().min(3, 'Template name must be at least 3 characters'),
  type: z.enum(['email', 'sms', 'whatsapp'], {
    required_error: 'Please select a template type',
  }),
  category: z.string().min(1, 'Please select a category'),
  bank: z.string().min(1, 'Please select a target bank'),
  content: z.string().min(10, 'Message content must be at least 10 characters'),
});

export type TemplateFormData = z.infer<typeof templateSchema>;
