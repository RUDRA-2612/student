import '@/app/globals.css'
import { Inter, Instrument_Serif } from 'next/font/google'
import { Providers } from '@/components/providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
})

export const metadata = {
  title: 'The Backbenchers — Your College Exam Companion',
  description: 'A curated academic platform for mastering college exams. Access past papers, study roadmaps, and comprehensive curriculum guides.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased min-h-screen" style={{ fontFamily: 'var(--font-inter), ui-sans-serif, sans-serif' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
