import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { ObjectId } from "mongodb";
import { db } from "./mongodb";
import { validatePassword } from "./validation";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: mongodbAdapter(db),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account",
    },
  },

  user: {
    modelName: "users",
    additionalFields: {
      // input: false -> can never be set by the client (sign-up or updateUser).
      // Admins are promoted securely with the server's `npm run make-admin` script.
      role: { type: "string", defaultValue: "customer", input: false },
      isBlocked: { type: "boolean", defaultValue: false, input: false },
      phone: { type: "string", required: false, defaultValue: "", input: false },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
  },

  hooks: {
    // Server-side enforcement of the sign-up password / image rules
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;
      const { password, image, name } = (ctx.body ?? {}) as { password?: string; image?: string; name?: string };
      const pwError = validatePassword(password ?? "");
      if (pwError) throw new APIError("BAD_REQUEST", { message: pwError });
      if (!name || name.trim().length < 2) throw new APIError("BAD_REQUEST", { message: "Please enter your full name" });
      if (image && !/^https?:\/\/\S+$/i.test(image)) {
        throw new APIError("BAD_REQUEST", { message: "Profile image must be a valid URL" });
      }
    }),
  },

  databaseHooks: {
    session: {
      create: {
        // Blocked users cannot sign in (email/password or Google)
        before: async (session) => {
          const user = await db
            .collection("users")
            .findOne({ _id: new ObjectId(String(session.userId)) }, { projection: { isBlocked: 1 } });
          if (user?.isBlocked) {
            throw new APIError("FORBIDDEN", {
              message: "Your account has been blocked. Please contact the salon for help.",
            });
          }
          return { data: session };
        },
      },
    },
  },

  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type SessionUser = Session["user"];
