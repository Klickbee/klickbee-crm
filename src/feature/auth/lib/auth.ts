import { prisma } from "@/libs/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcryptjs"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user) {
          throw new Error('No account found with this email address')
        }

        if (!user.password) {
          throw new Error('Please contact support - account setup incomplete')
        }
    
        // Block login if user is not Active
        if (user.status === 'Deleted') {
          throw new Error('Your account is removed. Please contact your admin.')
        }
        if (user.status !== 'Active') {
          throw new Error('Account is not active. Please Check your email for the invitation.')
        }

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('Password is incorrect')
        }

        // Update lastLogin on successful login
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          })
        } catch (e) {
          // non-blocking; if update fails, still allow login
        }

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  // pages: {
  //   signIn: "/auth",
  // },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
}
