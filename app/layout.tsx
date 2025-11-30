import Script from 'next/script';
import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'CR AudioViz AI Partner Portal',
  description: 'Join the CR AudioViz AI Partner Program - Earn commissions selling AI-powered business tools',
  keywords: 'partner program, sales, commission, AI tools, CR AudioViz AI',
  authors: [{ name: 'CR AudioViz AI' }],
  openGraph: {
    title: 'CR AudioViz AI Partner Portal',
    description: 'Join the CR AudioViz AI Partner Program and earn up to 25% commission',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
              {/* Javari AI Assistant */}
        <Script src="https://javariai.com/embed.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
