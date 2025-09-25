import type { ZodType, ZodError } from 'zod';

export async function isValid(schema: ZodType, data: unknown): Promise<true | ZodError> {
  const result = await schema.safeParseAsync(data);
  if (result.error) {
    console.warn(result.error.message);
    return result.error;
  } else {
    return true;
  }
}
