import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

// Common Validation Schemas
export const generateImageSchema = z.object({
  body: z.object({
    prompt: z.string().min(2, 'Prompt must be at least 2 characters long').max(1000, 'Prompt too long'),
    negativePrompt: z.string().max(1000).optional(),
    styleSlug: z.string().optional(),
    aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:5', '3:4', '21:9']).optional(),
    categorySlug: z.string().optional(),
    seed: z.number().int().optional(),
    numImages: z.number().int().min(1).max(4).optional(),
    guidanceScale: z.number().min(1).max(20).optional(),
    steps: z.number().int().min(10).max(50).optional(),
    model: z.string().optional(),
  }),
});

export const createCollectionSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
    description: z.string().max(500).optional(),
    isPrivate: z.boolean().optional(),
  }),
});

export const updateCollectionSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    isPrivate: z.boolean().optional(),
  }),
});
