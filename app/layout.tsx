import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  metadataBase: new URL('https://partners.craudiovizai.com'),
  // 2026-08-16: no canonical was declared, so any duplicate path —
  // trailing slash, query string, preview host — competed with itself.
  alternates: { canonical: '/' },
  icons: {
    icon: [{ url: '/favicon.png', sizes: '32x32' }, { url: '/icon-512.png', sizes: '512x512' }],
    apple: '/apple-touch-icon.png',
  },
 title: 'Javari Partners', description: 'Affiliate management and partner portal — referral tracking, revenue sharing.',
  twitter: { card: 'summary_large_image', images: ['/og-image.png'] },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630 }], title: 'Javari Partners', description: 'Affiliate management and partner portal — referral tracking, revenue sharing.', type: 'website' }, }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0a0a0f' }}>
        <div style={{ background: 'rgba(0,0,0,0.85)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
          <a href="https://craudiovizai.com" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            <span>🤝</span> <span style={{ color: '#10b981' }}>Javari Partners</span> <span style={{ color: '#374151', fontSize: 11 }}>· EIN 39-3646201</span>
          </a>
          <a href="https://craudiovizai.com/auth/signup" style={{ background: '#10b981', color: '#fff', borderRadius: 7, padding: '6px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>Start Free →</a>
        </div>
        {children}
      </body>
    </html>
  )
}
