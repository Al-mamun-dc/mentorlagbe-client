import { ObjectId } from "mongodb"

import { getDatabase } from "./db"

/**
 * Server-only profile helpers. Only the four editable profile fields are
 * accepted from clients; identity always comes from the Better Auth session.
 */

export interface Profile {
  id: string
  name: string
  email: string
  phone: string
  bio: string
  image: string
  role: string | null
  plan: string | null
}

export interface ProfileUpdate {
  name: string
  phone: string
  bio: string
  image: string
}

export type ValidationResult =
  | { success: true; value: ProfileUpdate }
  | { success: false; error: string }

const NAME_MAX = 100
const PHONE_MAX = 50
const BIO_MAX = 500
const IMAGE_MAX = 2048

/** Strip control characters so stored profile text cannot carry hidden bytes. */
function cleanText(value: string, allowNewlines = false): string {
  const pattern = allowNewlines
    ? /[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g
    : /[\u0000-\u001F\u007F]/g
  return value.replace(pattern, "")
}

function readString(body: Record<string, unknown>, key: string): string {
  const value = body[key]
  return typeof value === "string" ? value : ""
}

/**
 * Validate and sanitize an untrusted profile payload.
 * Extra fields (role, plan, email, userId, ...) are deliberately ignored.
 */
export function validateProfileUpdate(input: unknown): ValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { success: false, error: "Invalid request body." }
  }

  const body = input as Record<string, unknown>

  const name = cleanText(readString(body, "name")).trim().replace(/\s+/g, " ")
  if (!name) return { success: false, error: "Name is required." }
  if (name.length > NAME_MAX) {
    return { success: false, error: `Name must be ${NAME_MAX} characters or fewer.` }
  }

  const phone = cleanText(readString(body, "phone")).trim()
  if (phone.length > PHONE_MAX) {
    return { success: false, error: `Phone must be ${PHONE_MAX} characters or fewer.` }
  }
  if (phone && !/^[0-9+\-()\s]+$/.test(phone)) {
    return { success: false, error: "Phone may only contain digits, spaces, +, - and parentheses." }
  }

  const bio = cleanText(readString(body, "bio"), true).trim()
  if (bio.length > BIO_MAX) {
    return { success: false, error: `Bio must be ${BIO_MAX} characters or fewer.` }
  }

  const image = cleanText(readString(body, "image")).trim()
  if (image.length > IMAGE_MAX) {
    return { success: false, error: "Profile picture URL is too long." }
  }
  if (image) {
    try {
      const parsed = new URL(image)
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return { success: false, error: "Profile picture must be an http(s) URL." }
      }
    } catch {
      return { success: false, error: "Profile picture must be a valid URL." }
    }
  }

  return { success: true, value: { name, phone, bio, image } }
}

function optionalString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function toProfile(user: Record<string, unknown>): Profile {
  return {
    id: String(user._id),
    name: optionalString(user.name),
    email: optionalString(user.email),
    phone: optionalString(user.phone),
    bio: optionalString(user.bio),
    image: optionalString(user.image),
    role: typeof user.role === "string" ? user.role : null,
    plan: typeof user.plan === "string" ? user.plan : null,
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!ObjectId.isValid(userId)) return null

  const db = await getDatabase()
  const user = await db.collection("user").findOne({ _id: new ObjectId(userId) })
  return user ? toProfile(user as Record<string, unknown>) : null
}

/** Writes only the allowed profile fields; all other user fields are untouched. */
export async function updateProfile(
  userId: string,
  update: ProfileUpdate
): Promise<Profile | null> {
  if (!ObjectId.isValid(userId)) return null

  const db = await getDatabase()
  const user = await db.collection("user").findOneAndUpdate(
    { _id: new ObjectId(userId) },
    {
      $set: {
        name: update.name,
        phone: update.phone,
        bio: update.bio,
        image: update.image,
      },
    },
    { returnDocument: "after" }
  )

  return user ? toProfile(user as Record<string, unknown>) : null
}
