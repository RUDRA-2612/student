import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-base px-4 text-center">
      <h1 className="font-display font-bold text-6xl text-brand-coral mb-4">404</h1>
      <h2 className="font-display font-semibold text-xl text-white mb-2">Page Not Found</h2>
      <p className="text-white/40 text-sm max-w-sm mb-8">
        The page you are looking for does not exist or has been moved to a different directory path.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition"
      >
        Back to Safety
      </Link>
    </div>
  )
}
