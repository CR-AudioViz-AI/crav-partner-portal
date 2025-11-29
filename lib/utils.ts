import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

export function daysUntil(date: string | Date): number {
  const now = new Date()
  const target = new Date(date)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case 'STARTER':
      return 'bg-gray-100 text-gray-800'
    case 'PROVEN':
      return 'bg-blue-100 text-blue-800'
    case 'ELITE':
      return 'bg-purple-100 text-purple-800'
    case 'ELITE_PLUS':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'new':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'contacted':
    case 'under_review':
      return 'bg-blue-100 text-blue-800'
    case 'qualified':
    case 'active':
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'proposal':
    case 'negotiation':
      return 'bg-purple-100 text-purple-800'
    case 'won':
    case 'completed':
      return 'bg-emerald-100 text-emerald-800'
    case 'lost':
    case 'expired':
    case 'rejected':
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'clawback':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'hard':
      return 'bg-orange-100 text-orange-800'
    case 'expert':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getProductTierLabel(tier: number): string {
  switch (tier) {
    case 1:
      return 'Tier 1 - Entry Level'
    case 2:
      return 'Tier 2 - Professional'
    case 3:
      return 'Tier 3 - Enterprise'
    case 4:
      return 'Tier 4 - Custom Solutions'
    default:
      return `Tier ${tier}`
  }
}

export function calculateCommission(dealValue: number, commissionRate: number): number {
  return dealValue * (commissionRate / 100)
}

export function isClawbackEligible(closedAt: string, clawbackDays: number = 90): boolean {
  const closedDate = new Date(closedAt)
  const now = new Date()
  const daysSinceClosed = Math.floor((now.getTime() - closedDate.getTime()) / (1000 * 60 * 60 * 24))
  return daysSinceClosed < clawbackDays
}

export function getClawbackAmount(commission: number, daysSinceClosed: number): number {
  if (daysSinceClosed <= 90) {
    return commission // 100% clawback
  } else if (daysSinceClosed <= 180) {
    return commission * 0.5 // 50% clawback
  }
  return 0 // No clawback after 180 days
}
