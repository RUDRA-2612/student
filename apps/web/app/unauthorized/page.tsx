import Link from 'next/link'

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-base px-4 text-center">
      <h1 className="font-display font-bold text-4xl text-brand-coral mb-4">Access Denied</h1>
      <h2 className="font-display font-semibold text-lg text-white mb-2">Insufficient Role Permissions</h2>
      <p className="text-white/45 text-sm max-w-md mb-8">
        Your account role does not possess the permissions necessary to view this page. If you are an administrator, please sign in with administrator credentials.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition"
        >
          Sign In
        </Link>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
