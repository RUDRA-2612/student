'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, LogIn, ArrowRight, Mail, Lock, Zap } from 'lucide-react'

const LoginSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type LoginForm = z.infer<typeof LoginSchema>

export default function LoginPage() {
  const [error,  setError]  = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
  const [showPw, setShowPw]  = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError(null)
    try {
      const res = await signIn('credentials', {
        email:    data.email,
        password: data.password,
        redirect: false,
      })
      if (res?.error) {
        setError('Invalid credentials. Please check your email and password.')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setGuestLoading(true)
    setError(null)
    try {
      const res = await signIn('credentials', {
        email:    'guest@examedge.com',
        password: 'guestpassword123',
        redirect: false,
      })
      if (res?.error) {
        setError('Failed to log in as guest. Please try again.')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setGuestLoading(false)
    }
  }

  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-sm font-bold text-black bg-white">
          EE
        </div>
        <div>
          <p className="font-semibold text-base leading-none tracking-tight">ExamEdge</p>
          <p className="text-[10px] text-white/40 mt-0.5">College Exam Platform</p>
        </div>
      </div>

      <h1 className="text-2xl font-semibold text-center mb-1">Welcome back</h1>
      <p className="text-sm text-white/40 text-center mb-8">Sign in to continue your preparation</p>

      {/* Error banner */}
      {error && (
        <div className="mb-5 p-3.5 rounded-xl text-xs text-red-400 bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 animate-fade-up">
          <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label className="form-label" htmlFor="email">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" size={15} />
            <input
              id="email"
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="you@university.edu"
              className="form-input pl-10"
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="form-label !mb-0" htmlFor="password">Password</label>
            <span className="text-[10px] text-white/35 cursor-default">Forgot?</span>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" size={15} />
            <input
              id="password"
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className="form-input pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
              tabIndex={-1}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="login-submit"
          disabled={loading || guestLoading}
          className="btn-primary w-full mt-2 py-3.5 text-base tracking-wide"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Signing in…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <LogIn size={16} />
              Sign In
            </span>
          )}
        </button>

        {/* Guest access button */}
        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={loading || guestLoading}
          className="w-full mt-3 py-3.5 rounded-xl text-sm font-semibold text-white/80 border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
        >
          {guestLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Accessing Dashboard…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap size={14} />
              Explore as Guest — Instant Access
            </span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.06]" />
        </div>
        <div className="relative flex justify-center">
          <span className="text-[10px] uppercase tracking-widest text-white/30 px-3 bg-[hsl(0,0%,6%)]">
            or continue with
          </span>
        </div>
      </div>

      {/* Social buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="btn-ghost py-3 text-xs gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
          className="btn-ghost py-3 text-xs gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
          GitHub
        </button>
      </div>

      {/* Footer link */}
      <p className="mt-8 text-center text-xs text-white/35">
        New to ExamEdge?{' '}
        <Link href="/signup" className="text-accent hover:text-white font-semibold transition">
          Create account <ArrowRight className="inline" size={10} />
        </Link>
      </p>
    </>
  )
}
