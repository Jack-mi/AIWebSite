import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from '@auth0/nextjs-auth0/client'

export const metadata: Metadata = {
  title: 'InsightEye - AI Website Analysis Tool',
  description: 'Analyze any website with AI-powered insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <UserProvider>
        <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <main>{children}</main>
        </body>
      </UserProvider>
    </html>
  )
}