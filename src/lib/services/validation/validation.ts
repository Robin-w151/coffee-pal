import type { ZodSchema } from 'zod';

export async function isValid(schema: ZodSchema, data: unknown): Promise<boolean> {
  const result = await schema.safeParseAsync(data);
  if (result.error) {
    console.warn(result.error);
  }
  return result.success;
}
