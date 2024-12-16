import type {Metadata} from 'next'
import './globals.css'
import {ThemeProvider} from '@/providers/theme-provider'
import ModalProvider from '@/providers/modal-provider'
import {Toaster} from '@/components/ui/toaster'
import {Toaster as SonnarToaster} from '@/components/ui/sonner'
import {GeistSans} from "geist/font/sans";


export const metadata: Metadata = {
  title: 'Plura',
  description: 'Универсальное решение для вас',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className={GeistSans.className}
      lang="en"
      suppressHydrationWarning
    >
      <body >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ModalProvider>
            {children}
            <Toaster />
            <SonnarToaster position="bottom-left" />
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
