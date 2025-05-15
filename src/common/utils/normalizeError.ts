import { ZodError } from "zod";
import { isRavenErrorResponse } from "./guards";
import type { ErrorResponse } from "../types/error.types";
import type { RavenErrorCode } from "../types/error.types";

/**
 * Normalize any thrown error into a standard ErrorResponse
 *
 * @param error - The thrown error
 * @param fallback - Optional fallback error code (default: "application_error")
 * @returns Standardized ErrorResponse
 */
export function normalizeError(
  error: unknown,
  fallback: RavenErrorCode = "application_error",
): ErrorResponse {
  if (error instanceof ZodError) {
    return {
      name: "validation_error",
      message: error.errors.map((e) => e.message).join(", "),
    };
  }

  if (isRavenErrorResponse(error)) {
    return error;
  }

  if (error instanceof Error) {
    return {
      name: fallback,
      message: error.message,
    };
  }

  return {
    name: fallback,
    message: "Unknown error",
  };
}
