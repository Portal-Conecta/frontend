import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { ToastProvider } from '@portal/ui'
import './globals.css'

export const metadata: Metadata = {
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    apple: [{ url: '/favicon.png', type: 'image/png' }],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
