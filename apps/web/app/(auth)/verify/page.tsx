import { Logo } from '@/components/logo'

export default function VerifyRequestPage() {
  return (
    <div className="text-center">
      <h2 className="font-display font-bold text-2xl mb-2">Check Your Email</h2>
      <p className="text-white/40 text-sm mb-6">
        A passwordless login link has been sent to your email address.
      </p>
      <div className="p-4 bg-white/5 border border-white/[0.06] rounded-xl text-xs text-white/50 leading-relaxed">
        Click the link in the email to verify your identity and instantly access the <Logo className="inline-block" /> dashboard.
      </div>
    </div>
  )
}
