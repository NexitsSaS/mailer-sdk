
import type { ErrorResponse } from '../types/error.types';

/**
 * Type guard to check if a value is a Raven error response
 * 
 * @param value - Value to check
 * @returns True if value is an ErrorResponse
 */
export const isRavenErrorResponse = (
  value: unknown
): value is ErrorResponse => {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  return typeof obj.message === 'string' && typeof obj.name === 'string';
};