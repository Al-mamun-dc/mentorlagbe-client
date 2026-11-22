import { ObjectId } from "mongodb"

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/

/** Accepts only canonical 24-character hex MongoDB ObjectIds. */
export function isValidObjectId(value: string): boolean {
  return OBJECT_ID_PATTERN.test(value) && ObjectId.isValid(value)
}

/** Converts a validated string into an ObjectId, or returns null for invalid input. */
export function toObjectId(value: string): ObjectId | null {
  return isValidObjectId(value) ? new ObjectId(value) : null
}
