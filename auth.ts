import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { db } from "./db";
import { usersTable } from "./db/schema";
import { eq } from "drizzle-orm";
import { UserSchema } from "./features/auth/userSchema";

// Auth Configuration

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub, Google],
  
  pages: {
    signIn: "/signin",
  },

  callbacks: {
    
    // JWT Callback
    async jwt({ token, user, profile, account }) {
      if (user) {
        // Set token.id from user.id or profile.id
        token.id = user.id || profile?.id || account?.providerAccountId;
      }
      return token;
    },

    
    // Session Callback
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = String(token.id);
      }

      // Check if user exists in database
      const checkuser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, session.user.id as string));

      // If user doesn't exist, create them
      if (checkuser.length === 0) {
        try {
          await db
            .insert(usersTable)
            .values({
              id: session.user.id as string,
              name: session.user.name || "",
              email: session.user.email || "",
            })
            .returning();
        } catch (error) {
          console.error("Error creating user:", error);
        }
      }

      return session;
    },
  },
});
