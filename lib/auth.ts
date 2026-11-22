import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.BETTER_AUTH_DB_URI as string);
const db = client.db('mentorlagbe');

const SELF_SIGNUP_ROLES = ["student", "tutor"] as const;
type SelfSignupRole = (typeof SELF_SIGNUP_ROLES)[number];

/** Public sign-up may only create student/tutor accounts; admins are assigned by admins. */
const roleValidator = {
    "~standard": {
        version: 1 as const,
        vendor: "mentorlagbe",
        validate(value: unknown) {
            if (SELF_SIGNUP_ROLES.includes(value as SelfSignupRole)) {
                return { value: value as SelfSignupRole };
            }
            return {
                issues: [{ message: "Role must be student or tutor." }],
            };
        },
    },
};

export const auth = betterAuth({

    //...other options
    
    emailAndPassword: {
        enabled: true,
    },
    user: {
       additionalFields: {
          role: {
              type: ['student', 'tutor', 'admin'],
              required: true,
              input: true,
              validator: { input: roleValidator },
            }
        }
    },

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
