import type { Metadata } from 'next'
import { Cinzel, Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import KiraCompanion from '@/components/KiraCompanion'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700', '900'],
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'KIRA — AI Financial Intelligence',
  description: 'Your elite AI financial advisor. Analyze, plan, and grow your wealth with KIRA.',
  keywords: ['financial advisor', 'AI finance', 'investment', 'wealth management'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${cinzel.variable} ${outfit.variable} ${jetbrainsMono.variable} font-body bg-kira-obsidian text-kira-cream antialiased`}>
        {children}
        <KiraCompanion />
      </body>
    </html>
  )
}
