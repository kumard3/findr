import { PrismaAdapter } from "@auth/prisma-adapter";
import type { GetServerSidePropsContext } from "next";
import {
  type DefaultSession,
  type NextAuthOptions,
  getServerSession,
} from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/env";
import { db } from "@/server/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  // password: z.string().min(0, "Password should be minimum 5 characters"),
});

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      apiKey: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id ?? "",
          email: token.email ?? "",
          apiKey: token.apiKey ?? "",
        },
      };
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.apiKey = user.apiKey;
      }
      return token;
    },
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      type: "credentials",
      authorize: async (credentials) => {
        const { email, password } = loginUserSchema.parse(credentials);
        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            apiKeys: {
              select: {
                id: true,
                value: true,
                permissions: true,
              },
            },
          },
        });

        if (!user) {
          // New user - handle sign-up
          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = await db.user.create({
            data: {
              email: email.toLowerCase(),
              password: hashedPassword,
              // Add any other initial user data
            },
            select: {
              id: true,
              email: true,
              name: true,
              apiKeys: {
                select: {
                  id: true,
                  value: true,
                  permissions: true,
                },
              },
            },
          });

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            apiKey: newUser.apiKeys.find((key) =>
              key.permissions.includes("write")
            )?.value,
          };
        }

        if (user && bcrypt?.compareSync(password, user?.password ?? "")) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            apiKey: user.apiKeys.find((key) =>
              key.permissions.includes("write")
            )?.value,
          };
          // biome-ignore lint/style/noUselessElse: <explanation>
        } else {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: env.NEXTAUTH_SECRET,
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
