import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { admin } from "better-auth/plugins";
import { jwt } from "better-auth/plugins/jwt";

const client = new MongoClient(process.env.BETTER_AUTH_DB_URI as string);
const db = client.db("mentorlagbe");

const authBaseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export const auth = betterAuth({
  baseURL: authBaseURL,
  emailAndPassword: {
    enabled: true,
  },
  // Default public signup role is student. Users cannot self-select roles at signup.
  plugins: [
    admin({
      defaultRole: "student",
      adminRoles: ["admin"],
    }),
    jwt({
      jwt: {
        issuer: authBaseURL,
        audience: authBaseURL,
      },
    }),
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
});
