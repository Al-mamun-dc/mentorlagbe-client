import { MongoClient, type Db } from "mongodb"

type MongoGlobal = typeof globalThis & {
  __mentorlagbeMongoClient?: MongoClient
  __mentorlagbeMongoClientPromise?: Promise<MongoClient>
}

const globalForMongo = globalThis as MongoGlobal

/**
 * Shared server-only MongoClient. Cached on globalThis so Next.js dev/HMR and
 * warm Vercel serverless invocations reuse the same client instead of creating
 * new connection pools. Never close this client in request/serverless lifecycle.
 */
export function getMongoClient(): MongoClient {
  const uri = process.env.BETTER_AUTH_DB_URI
  if (!uri) {
    throw new Error("BETTER_AUTH_DB_URI is not configured on the server.")
  }

  if (!globalForMongo.__mentorlagbeMongoClient) {
    globalForMongo.__mentorlagbeMongoClient = new MongoClient(uri)
  }

  return globalForMongo.__mentorlagbeMongoClient
}

/** Ensures the shared client is connected once; retries by clearing the cached promise on failure. */
export function getMongoClientPromise(): Promise<MongoClient> {
  const client = getMongoClient()

  if (!globalForMongo.__mentorlagbeMongoClientPromise) {
    globalForMongo.__mentorlagbeMongoClientPromise = client.connect().catch((error) => {
      globalForMongo.__mentorlagbeMongoClientPromise = undefined
      throw error
    })
  }

  return globalForMongo.__mentorlagbeMongoClientPromise
}

/** Shared server-only MongoDB connection for the application database. */
export async function getDatabase(): Promise<Db> {
  const client = await getMongoClientPromise()
  return client.db("mentorlagbe")
}
