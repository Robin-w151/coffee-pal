import type { ZodSchema, ZodError } from 'zod';

export async function isValid(schema: ZodSchema, data: unknown): Promise<true | ZodError> {
  const result = await schema.safeParseAsync(data);
  if (result.error) {
    console.warn(result.error.format());
    return result.error;
  } else {
    return true;
  }
}
