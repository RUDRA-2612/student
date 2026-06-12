import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black px-4 text-center">
      <h1 className="font-serif italic text-8xl text-white/80 mb-6">404</h1>
      <h2 className="text-xl font-medium text-white/90 mb-3">Page Not Found</h2>
      <p className="text-white/40 text-sm max-w-sm mb-10 leading-relaxed">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-white hover:bg-white/90 text-black text-sm font-medium transition"
      >
        Back to Home
      </Link>
    </div>
  )
}
