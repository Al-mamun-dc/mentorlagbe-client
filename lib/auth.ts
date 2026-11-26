import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { admin } from "better-auth/plugins";
import { jwt } from "better-auth/plugins/jwt";
import { getMongoClient } from "./db";

const client = getMongoClient();
const db = client.db("mentorlagbe");

const PRODUCTION_FRONTEND_URL = "https://mentorlagbe-client-cibnsxevo-acme-a4b7.vercel.app";
const authBaseURL =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL ? PRODUCTION_FRONTEND_URL : "http://localhost:3000");

function resolveTrustedOrigins() {
  const origins = new Set<string>([
    authBaseURL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]);

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) origins.add(`https://${vercelUrl}`);

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProductionUrl) origins.add(`https://${vercelProductionUrl}`);

  const extraOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
  if (extraOrigins) {
    for (const origin of extraOrigins.split(",")) {
      const normalized = origin.trim();
      if (normalized) origins.add(normalized);
    }
  }

  return Array.from(origins);
}

export const auth = betterAuth({
  baseURL: authBaseURL,
  trustedOrigins: resolveTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      // Public signup account type. Admin plugin keeps `role` input=false; this
      // separate field is validated server-side and mapped to role.
      signupAs: {
        type: "string",
        required: false,
        input: true,
        returned: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          // Only allow self-selected student/tutor roles during public signup.
          // All invalid/privileged values default to student. Never allow admin.
          if (context?.path === "/sign-up/email") {
            const raw =
              typeof (user as Record<string, unknown>).signupAs === "string"
                ? ((user as Record<string, unknown>).signupAs as string)
                : typeof context?.body?.signupAs === "string"
                  ? (context.body.signupAs as string)
                  : undefined;
            const role = raw === "tutor" ? "tutor" : "student";
            const { signupAs: _ignored, ...rest } = user as Record<string, unknown>;
            void _ignored;
            return { data: { ...rest, role } };
          }

          // Prevent privilege escalation on any other user-creation path that
          // might carry a signupAs field.
          if ("signupAs" in (user as Record<string, unknown>)) {
            const { signupAs: _ignored, ...rest } = user as Record<string, unknown>;
            void _ignored;
            return { data: rest };
          }

          return { data: user };
        },
      },
    },
  },
  // Default public signup role is student. Admin is never assignable through public signup.
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
  database: mongodbAdapter(db, {
    client,
  }),
});
