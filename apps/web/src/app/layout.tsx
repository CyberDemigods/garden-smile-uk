import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Inter, Fraunces } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
})

export const metadata: Metadata = {
  title: {
    default: 'Garden Smile — garden ornaments made to last',
    template: '%s | Garden Smile',
  },
  description:
    'Bird feeders, planters, windmills, pergolas. Handcrafted wood and metal pieces that keep your garden smiling all year round.',
  openGraph: {
    type: 'website',
    siteName: 'Garden Smile',
    locale: 'en_GB',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers()
  const pathname = h.get('x-pathname') ?? ''

  if (pathname.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  )
}
