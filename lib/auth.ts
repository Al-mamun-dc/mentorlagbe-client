import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.BETTER_AUTH_DB_URI as string);
const db = client.db('mentorlagbe');

const ROLES = ["student", "tutor", "admin"] as const;
type Role = (typeof ROLES)[number];

/** Standard Schema validator so only the three supported roles can be stored. */
const roleValidator = {
    "~standard": {
        version: 1 as const,
        vendor: "mentorlagbe",
        validate(value: unknown) {
            if (ROLES.includes(value as Role)) {
                return { value: value as Role };
            }
            return {
                issues: [{ message: "Role must be student, tutor, or admin." }],
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
