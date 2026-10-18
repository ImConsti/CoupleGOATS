import { z, ZodType } from "zod";
import { ValidationError } from "../errors/errors.js";

export function zodValidation<Schema extends ZodType>(
  schema: Schema,
  userInput: unknown,
): z.infer<Schema> {
  const result = schema.safeParse(userInput);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues
        .map((error): string =>
          error.path.length > 0
            ? "invalid " + error.path.join(", ")
            : error.message,
        )
        .join("; ")
        .trim(),
    );
  }
  return result.data;
}
