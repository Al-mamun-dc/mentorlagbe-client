import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

// Better Auth + MongoDB adapter require Node.js runtime (not Edge).
export const runtime = "nodejs";

export const { POST, GET } = toNextJsHandler(auth);