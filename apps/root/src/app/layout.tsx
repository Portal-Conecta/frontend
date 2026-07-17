import type { ReactNode } from 'react'

import { Afacad, Inter } from 'next/font/google'

import { ToastProvider } from '@portal/ui'
import './globals.css'

// next/font self-hosta as fontes no build e injeta preload + @font-face no
// <head> (elimina o waterfall render-blocking dos @import do @fontsource, issue
// #407). Modo `variable`: expõe as famílias como CSS vars herdadas pelo <html>,
// para as classes utilitárias `font-inter`/`font-afacad` (tokens em
// packages/ui/src/tokens/typography.ts) resolverem por elemento.
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
