import { z } from 'zod';

export const createScanSchema = z.object({
  originalText: z.string().optional().default(''),
  messageSource: z
    .enum(['email', 'sms', 'whatsapp', 'social_media', 'other'], {
      errorMap: () => ({ message: 'Invalid message source selected.' })
    })
    .default('other'),
  sourceType: z.enum(['text', 'image']).default('text'),
  fileData: z.string().optional(),
  fileMimeType: z.string().optional()
}).refine((data) => {
  if (data.fileData && data.fileData.length > 0) {
    return true;
  }
  return data.originalText && data.originalText.trim().length >= 10 && data.originalText.length <= 5000;
}, {
  message: 'Please provide either a message text of at least 10 characters or attach an image/PDF file.',
  path: ['originalText']
});

export const validateScanInput = (data) => {
  return createScanSchema.safeParse(data);
};
