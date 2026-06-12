'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, User, Mail, Lock, CheckCircle2, ArrowLeft } from 'lucide-react'

const SignupSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type SignupForm = z.infer<typeof SignupSchema>

export default function SignupPage() {
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(SignupSchema),
  })

  const onSubmit = async (data: SignupForm) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const resData = await response.json()
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to create account.')
      }
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="text-green-400" size={32} />
        </div>
        <h2 className="font-semibold text-2xl mb-2 text-green-400">Account Created!</h2>
        <p className="text-white/50 text-sm">Your ExamEdge account is ready. Redirecting to sign in…</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile logo */}
      <div className="flex items-center gap-3 mb-10 lg:hidden">
        <span className="text-base font-semibold tracking-tight">Exam<span className="text-[hsl(340,82%,62%)]">Edge</span></span>
      </div>

      <h1 className="text-2xl font-semibold text-center mb-1">Create your account</h1>
      <p className="text-sm text-white/40 text-center mb-8">Start your exam preparation journey today</p>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl text-xs text-red-400 bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 animate-fade-up">
          <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="form-label" htmlFor="name">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" size={15} />
            <input
              id="name"
              {...register('name')}
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              className="form-input pl-10"
            />
          </div>
          {errors.name && <p className="text-xs text-red-400 mt-1.5">{errors.name.message}</p>}
        </div>

        <div>
          <label className="form-label" htmlFor="signup-email">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" size={15} />
            <input
              id="signup-email"
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="you@university.edu"
              className="form-input pl-10"
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>}
        </div>

        <div>
          <label className="form-label" htmlFor="signup-password">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" size={15} />
            <input
              id="signup-password"
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min 8 characters"
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

        <button
          type="submit"
          id="signup-submit"
          disabled={loading}
          className="btn-primary w-full mt-2 py-3.5 text-base tracking-wide"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Creating account…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <UserPlus size={16} />
              Create Account
            </span>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-white/35">
        <Link href="/login" className="text-accent hover:text-white font-semibold transition flex items-center justify-center gap-1">
          <ArrowLeft size={10} /> Already have an account? Sign In
        </Link>
      </p>
    </>
  )
}
