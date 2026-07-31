'use client'
// app/dashboard/referrals/page.tsx — Javari Partners
// A partner's own traffic-referral link, and the real stats behind it.
// Every number here is queried, never estimated - clicks, active
// attributions, conversions, and revenue all come from real tables.
// CR AudioViz AI · EIN 39-3646201 · July 30, 2026
import { useState, useEffect, useCallback } from 'react'
import { Link2, Copy, Check, TrendingUp, MousePointerClick, Clock } from 'lucide-react'

type ReferralData = {
  referral_code: string | null
  referral_url: string | null
  cookie_window_days: number
  commission_rate: number
  stats: {
    total_clicks: number
    active_attributions: number
    converted: number
    conversion_rate_pct: number
    verified_revenue: number
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const { supabase } = await import('@/lib/supabase')
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const headers = await authHeader()
      const res = await fetch('/api/partners/referrals', { headers })
      const body = await res.json()
      if (body.ok) setData(body)
      else setError(body.error ?? 'Could not load your referral info.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const generateLink = async () => {
    setGenerating(true); setError(null)
    try {
      const headers = { 'Content-Type': 'application/json', ...(await authHeader()) }
      const res = await fetch('/api/partners/referrals', { method: 'POST', headers })
      const body = await res.json()
      if (body.ok) await load()
      else setError(body.error ?? 'Could not generate a referral link.')
    } finally { setGenerating(false) }
  }

  const copyLink = () => {
    if (!data?.referral_url) return
    navigator.clipboard.writeText(data.referral_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="space-y-4">{[1, 2].map(i => (
      <div key={i} className="bg-white rounded-2xl p-6 animate-pulse h-24" />
    ))}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Referral Link</h1>
        <p className="text-gray-500 mt-1">
          Share this anywhere — your blog, YouTube, social. You're paid only when it turns
          into a real, paying subscription — never for clicks alone.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6">
        {!data?.referral_url ? (
          <div className="text-center py-8">
            <Link2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">You don't have a referral link yet.</p>
            <button type="button" disabled={generating} onClick={generateLink}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {generating ? 'Generating…' : 'Generate My Link'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm text-gray-700 truncate">
              {data.referral_url}
            </div>
            <button type="button" onClick={copyLink}
              className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 shrink-0">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      {data?.referral_url && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <MousePointerClick className="w-4 h-4" /> Total Clicks
              </div>
              <div className="text-2xl font-bold text-gray-900">{data.stats.total_clicks}</div>
            </div>
            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Clock className="w-4 h-4" /> Active — Not Yet Converted
              </div>
              <div className="text-2xl font-bold text-gray-900">{data.stats.active_attributions}</div>
              <p className="text-xs text-gray-400 mt-1">Cookie live for {data.cookie_window_days} days from click</p>
            </div>
            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <TrendingUp className="w-4 h-4" /> Converted
              </div>
              <div className="text-2xl font-bold text-green-600">{data.stats.converted}</div>
              <p className="text-xs text-gray-400 mt-1">{data.stats.conversion_rate_pct}% of clicks</p>
            </div>
            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                Verified Revenue
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${data.stats.verified_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-gray-400 mt-1">{Math.round(data.commission_rate * 100)}% commission rate</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">How this works</p>
            <p>
              When someone clicks your link, we remember them for {data.cookie_window_days} days. If they
              subscribe to a paid plan any time in that window, it's credited to you automatically —
              you don't have to do anything else. If someone clicks a different partner's link first,
              the first link they clicked gets the credit, not whichever one converts.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
