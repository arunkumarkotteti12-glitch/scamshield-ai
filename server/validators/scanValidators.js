import { z } from 'zod';

export const createScanSchema = z.object({
  originalText: z
    .string({ required_error: 'Message text is required.' })
    .min(10, { message: 'Message text must be at least 10 characters long.' })
    .max(5000, { message: 'Message text cannot exceed 5000 characters.' }),
  messageSource: z
    .enum(['email', 'sms', 'whatsapp', 'social_media', 'other'], {
      errorMap: () => ({ message: 'Invalid message source selected.' })
    })
    .default('other')
});

export const validateScanInput = (data) => {
  return createScanSchema.safeParse(data);
};
