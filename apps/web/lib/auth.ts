import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import ResendProvider from 'next-auth/providers/resend'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/server/db'
import * as bcrypt from 'bcryptjs'
import { z } from 'zod'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db) as any,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 days

  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID || 'mock',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock',
    }),
    GitHubProvider({
      clientId:     process.env.GITHUB_ID || 'mock',
      clientSecret: process.env.GITHUB_SECRET || 'mock',
    }),
    ResendProvider({
      apiKey: process.env.RESEND_API_KEY || 'mock',
      from:   'ExamEdge <noreply@examedge.com>',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
       async authorize(credentials) {
        if (!credentials) return null
        const { email, password } = z.object({
          email:    z.string().email(),
          password: z.string().min(8),
        }).parse(credentials)

        const normalizedEmail = email.toLowerCase()

        if (normalizedEmail === 'guest@examedge.com') {
          if (process.env.ALLOW_GUEST_ACCESS !== 'true') {
            return null
          }
          let guestUser = await db.user.findUnique({
            where: { email: 'guest@examedge.com' },
            include: { profile: true },
          })
          if (!guestUser) {
            guestUser = await db.user.create({
              data: {
                name: 'Guest Student',
                email: 'guest@examedge.com',
                role: 'STUDENT',
                profile: {
                  create: {
                    bio: 'Guest student explorer account.',
                  }
                }
              },
              include: { profile: true },
            })
          }
          return guestUser as any
        }

        const user = await db.user.findUnique({
          where: { email: normalizedEmail },
          include: { profile: true },
        })

        if (!user) return null

        if (['ADMIN', 'SUPERADMIN'].includes(user.role)) {
          const storedHash = process.env.ADMIN_PASSWORD_HASH || user.passwordHash
          if (!storedHash) return null
          const isValid = await bcrypt.compare(password, storedHash)
          if (!isValid) return null
        } else {
          if (!user.passwordHash) return null
          const isValid = await bcrypt.compare(password, user.passwordHash)
          if (!isValid) return null
        }

        return user as any
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = (user as any).role
      }
      if (!token.role && token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          select: { role: true },
        })
        if (dbUser) {
          token.role = dbUser.role
        }
      }
      if (!token.role) {
        token.role = 'STUDENT'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id   = token.id as string
        (session.user as any).role = token.role as string
      }
      return session
    },
  },

  pages: {
    signIn:  '/login',
    signOut: '/logout',
    error:   '/auth/error',
    verifyRequest: '/auth/verify',
  },
})
