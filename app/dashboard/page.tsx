'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Trophy,
  Flame,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  Gift,
  Zap,
  Crown,
  ChevronRight,
  Sparkles,
  Award,
  BarChart3,
  Package,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'
import { getUser, getPartnerByUserId, getDashboardStats } from '@/lib/supabase'
import { formatCurrency, formatPercent, getTierColor } from '@/lib/utils'
import { Partner, DashboardStats } from '@/types'

// Demo data for rich features
type LeaderboardRow = { rank: number; partner_id: string; company_name: string;
  tier: string; total_sales: number; deals_closed: number }

export default function DashboardPage() {
  const [partner, setPartner] = useState<Partner | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    loadDashboard()
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data } = await supabase.rpc('partner_leaderboard', { p_limit: 10 })
      setLeaderboard((data as LeaderboardRow[]) ?? [])
    } catch {
      setLeaderboard([])
    }
  }

  const loadDashboard = async () => {
    try {
      const user = await getUser()
      if (user) {
        const { data: partnerData } = await getPartnerByUserId(user.id)
        if (partnerData) {
          setPartner(partnerData)
          const statsData = await getDashboardStats(partnerData.id)
          if (statsData) {
            setStats(statsData as any)
          }
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Honest zero-state for a brand-new partner with no real activity yet.
  // Every number here is what a genuinely new account looks like - nothing
  // fabricated to make day one feel more advanced than it is.
  const displayStats = stats || {
    total_leads: 0,
    active_deals: 0,
    total_commissions: 0,
    pending_commissions: 0,
    conversion_rate: 0,
    avg_deal_size: 0,
    monthly_sales: 0,
    rank_position: null,
    rank_change: 0,
    current_streak: 0,
    points_balance: 0,
    next_tier_progress: 0,
    next_tier_target: 50000,
    cross_sell_opportunities: 0,
    expiring_leads: 0,
    at_risk_deals: 0,
  }

  const displayPartner = partner || {
    contact_name: 'Partner',
    company_name: 'Your Company',
    tier: 'STARTER' as const,
    total_sales: 0,
    total_commissions: 0,
    current_streak: 0,
    badges: [] as string[],
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header with Gamification */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">Welcome back, {displayPartner.contact_name}!</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTierColor(displayPartner.tier)}`}>
                  {displayPartner.tier.replace('_', ' ')}
                </span>
              </div>
              <p className="text-purple-200">Let&apos;s crush some goals today</p>
              
              {/* Streak & Points */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{displayStats.current_streak}</div>
                    <div className="text-xs text-purple-200">Day Streak</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{displayStats.points_balance}</div>
                    <div className="text-xs text-purple-200">Points</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {displayStats.rank_position ? `#${displayStats.rank_position}` : '—'}
                    </div>
                    <div className="text-xs text-purple-200 flex items-center gap-1">
                      {displayStats.rank_position ? 'Rank' : 'No sales yet'}
                      {displayStats.rank_change > 0 && (
                        <span className="text-green-400 flex items-center">
                          <ArrowUpRight className="w-3 h-3" />+{displayStats.rank_change}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">{formatCurrency(displayPartner.total_sales)}</div>
                <div className="text-sm text-purple-200">Lifetime Sales</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{formatCurrency(displayPartner.total_commissions)}</div>
                <div className="text-sm text-purple-200">Total Earned</div>
              </div>
            </div>
          </div>

          {/* Tier Progress Bar */}
          <div className="mt-6 bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress to PROVEN Tier</span>
              <span className="text-sm text-purple-200">
                {formatCurrency(displayPartner.total_sales)} / {formatCurrency(displayStats.next_tier_target)}
              </span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${displayStats.next_tier_progress}%` }}
              />
            </div>
            <p className="text-xs text-purple-200 mt-2">
              🎯 {formatCurrency(displayStats.next_tier_target - displayPartner.total_sales)} more to unlock +3% commission & 200 leads/month
            </p>
          </div>
        </div>
      </div>

      {/* Bonus Opportunities - real system not built yet. An honest empty
          state beats fabricated bonus offers with fake dollar amounts. */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
        <Gift className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h2 className="font-bold text-gray-700">Bonus Opportunities</h2>
        <p className="text-sm text-gray-500 mt-1">
          Bonus and volume incentives will appear here once they are available for your tier.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-600 font-medium">Active Leads</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{displayStats.total_leads}</div>
          {displayStats.expiring_leads > 0 && (
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {displayStats.expiring_leads} expiring soon
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-gray-600 font-medium">Active Deals</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{displayStats.active_deals}</div>
          <p className="text-xs text-gray-500 mt-1">
            {formatPercent(displayStats.conversion_rate)} conversion rate
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-600 font-medium">This Month</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(displayStats.monthly_sales)}</div>
          <p className="text-xs text-gray-500 mt-1">
            {formatCurrency(displayStats.pending_commissions)} pending payout
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-gray-600 font-medium">Avg Deal Size</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(displayStats.avg_deal_size)}</div>
          <p className="text-xs text-gray-500 mt-1">Across your closed deals</p>
        </div>
      </div>

      {/* Leaderboard & Badges */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="font-bold text-gray-900">Partner Leaderboard</h2>
            </div>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
              <option>This Month</option>
              <option>This Quarter</option>
              <option>All Time</option>
            </select>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No closed deals yet — the leaderboard fills in as real sales come through.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.partner_id}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                    entry.partner_id === partner?.id
                      ? 'bg-purple-50 border border-purple-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                    entry.rank === 2 ? 'bg-gray-300 text-gray-700' :
                    entry.rank === 3 ? 'bg-amber-600 text-white' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${entry.partner_id === partner?.id ? 'text-purple-700' : 'text-gray-900'}`}>
                        {entry.company_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTierColor(entry.tier)}`}>
                        {entry.tier.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(entry.total_sales)}</div>
                    <div className="text-xs text-gray-500">{entry.deals_closed} deals</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges & Achievements */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-purple-500" />
            <h2 className="font-bold text-gray-900">Your Badges</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {/* No real badge-earning system exists yet - showing every slot as
                locked rather than fabricating badges nobody actually earned. */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={`locked-${i}`} className="text-center p-3 bg-gray-100 rounded-xl opacity-50">
                <div className="text-3xl mb-1">🔒</div>
                <div className="text-xs font-medium text-gray-500">Locked</div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Next Badge to Earn</h3>
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🏆</div>
                <div>
                  <div className="font-medium text-gray-900">$10K Club</div>
                  <div className="text-xs text-gray-500">Close $10,000 in sales</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{formatCurrency(displayPartner.total_sales)}</span>
                  <span>{formatCurrency(10000)}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    style={{ width: `${Math.min((displayPartner.total_sales / 10000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Upgrade CTA */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">Upgrade to Pro</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Unlock Premium Features</h3>
            <p className="text-gray-300 mb-4">
              Get AI lead scoring, advanced analytics, proposal generator, CRM integrations, and priority support.
            </p>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm">
              {[
                'Unlimited leads',
                'AI lead scoring',
                'Advanced analytics',
                'Proposal generator',
                'CRM integrations',
                'Priority support',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-center lg:text-right">
            <div className="text-4xl font-bold mb-1">$99<span className="text-lg font-normal text-gray-400">/mo</span></div>
            <p className="text-sm text-gray-400 mb-4">Billed monthly • Cancel anytime</p>
            <button className="w-full lg:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-xl font-semibold transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/leads" className="bg-white rounded-2xl p-5 card-hover group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-semibold text-gray-900">Manage Leads</h3>
          <p className="text-sm text-gray-500">Contact and qualify your leads</p>
        </Link>

        <Link href="/dashboard/products" className="bg-white rounded-2xl p-5 card-hover group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-semibold text-gray-900">Browse Products</h3>
          <p className="text-sm text-gray-500">View catalog & commissions</p>
        </Link>

        <Link href="/dashboard/documents" className="bg-white rounded-2xl p-5 card-hover group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-semibold text-gray-900">Sales Materials</h3>
          <p className="text-sm text-gray-500">Decks, scripts & templates</p>
        </Link>

        <Link href="/dashboard/training" className="bg-white rounded-2xl p-5 card-hover group relative">
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">PRO</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-semibold text-gray-900">Training Center</h3>
          <p className="text-sm text-gray-500">Courses & certifications</p>
        </Link>
      </div>
    </div>
  )
}
