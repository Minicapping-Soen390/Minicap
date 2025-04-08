import uuid from 'react-native-uuid';

/**
 * Extracts a human-readable error message from any error type
 * @param error - The error to process
 * @returns A string representation of the error
 */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Generates a unique identifier using react-native-uuid
 * @returns A UUID string
 */
export function generateId(): string {
  return uuid.v4().toString();
}

/**
 * Creates a new audit object with generated ID and timestamp
 * @returns An audit object with id, createdAt, and updatedAt properties
 */
export function createAuditObject(): { id: string, createdAt: Date, updatedAt: Date } {
  const now = new Date();
  return {
    id: generateId(),
    createdAt: now,
    updatedAt: now
  };
}

