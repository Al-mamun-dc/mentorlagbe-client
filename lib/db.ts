import { MongoClient, type Db } from "mongodb"

type MongoGlobal = typeof globalThis & {
  __mentorlagbeClientPromise?: Promise<MongoClient>
}

const globalForMongo = globalThis as MongoGlobal

function getMongoClientPromise(): Promise<MongoClient> {
  const uri = process.env.BETTER_AUTH_DB_URI

  if (!uri) {
    throw new Error("BETTER_AUTH_DB_URI is not configured on the server.")
  }

  if (!globalForMongo.__mentorlagbeClientPromise) {
    globalForMongo.__mentorlagbeClientPromise = new MongoClient(uri).connect()
  }

  return globalForMongo.__mentorlagbeClientPromise
}

/** Shared server-only MongoDB connection for the application database. */
export async function getDatabase(): Promise<Db> {
  const client = await getMongoClientPromise()
  return client.db("mentorlagbe")
}
