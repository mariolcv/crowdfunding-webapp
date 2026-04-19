import { z } from "zod";

export function zodMessage(err: z.ZodError): string {
  const issue = err.issues?.[0];
  return issue?.message || "Error de validación";
}

export { z };
