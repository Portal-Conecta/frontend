import type { Metadata } from 'next'
import { Inter, Afacad } from 'next/font/google'
import type { ReactNode } from 'react'

import { ToastProvider } from '@portal/ui'
import './globals.css'

// next/font/google self-hosta as fontes no build (sem waterfall @fontsource →
// woff2) e injeta @font-face + <link rel="preload"> no <head>. Modo `variable`:
// expõe --font-inter / --font-afacad, consumidas pelos tokens do Tailwind
// (packages/ui/src/tokens/typography.ts). display: 'swap' evita FOIT.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-inter',
})

const afacad = Afacad({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-afacad',
})

export const metadata: Metadata = {
  title: 'Portal Conecta',
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    apple: [{ url: '/favicon.png', type: 'image/png' }],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${afacad.variable}`}>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
