// app/sitemap.ts — the pages this app wants indexed
//
// 2026-08-16: this app had no sitemap, so discovery depended on a crawler
// finding an internal link. Generated rather than static, so it cannot drift
// out of date as pages are added.
import type { MetadataRoute } from 'next'

const BASE = 'https://partners.craudiovizai.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${BASE}`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/auth/login`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/auth/register`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/dashboard`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/dashboard/apply`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/dashboard/deals`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/dashboard/documents`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/dashboard/leads`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/dashboard/products`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/dashboard/referrals`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/dashboard/settings`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/dashboard/support`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ]
}
