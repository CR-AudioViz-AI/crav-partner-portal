'use client'

import { useState, useEffect } from 'react'
import {
  Target,
  Search,
  Filter,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { getUser, getPartnerByUserId, getDealsByPartnerId } from '@/lib/supabase'
import { formatCurrency, formatDate, getStatusColor, isClawbackEligible } from '@/lib/utils'
import { Deal, DealStatus } from '@/types'

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Summary stats
  const totalDeals = deals.length
  const wonDeals = deals.filter(d => d.status === 'completed').length
  const totalCommissions = deals.filter(d => d.payment_status === 'paid').reduce((sum, d) => sum + d.commission_amount, 0)
  const pendingCommissions = deals.filter(d => d.payment_status === 'pending').reduce((sum, d) => sum + d.commission_amount, 0)

  useEffect(() => {
    loadDeals()
  }, [])

  useEffect(() => {
    filterDeals()
  }, [deals, searchQuery, statusFilter])

  const loadDeals = async () => {
    try {
      const { user } = await getUser()
      if (user) {
        const { data: partner } = await getPartnerByUserId(user.id)
        if (partner) {
          const { data } = await getDealsByPartnerId(partner.id)
          setDeals(data || [])
        }
      }
    } catch (error) {
      console.error('Error loading deals:', error)
      toast.error('Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  const filterDeals = () => {
    let filtered = [...deals]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        deal =>
          deal.customer_name.toLowerCase().includes(query) ||
          deal.customer_email.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(deal => deal.status === statusFilter)
    }

    setFilteredDeals(filtered)
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Paid</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>
      case 'clawback':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Clawback</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deal Tracking</h2>
          <p className="text-gray-600">Monitor your deals and commissions</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-600 font-medium">Total Deals</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalDeals}</div>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-600 font-medium">Won Deals</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{wonDeals}</div>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-gray-600 font-medium">Earned</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCommissions)}</div>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-gray-600 font-medium">Pending</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{formatCurrency(pendingCommissions)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="clawback">Clawback</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Deals List */}
      {filteredDeals.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">No deals found</h3>
          <p className="text-gray-500">
            {deals.length === 0
              ? 'Deals will appear here once you close sales'
              : 'Try adjusting your search or filter criteria'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeals.map((deal) => {
            const clawbackEligible = deal.closed_at && isClawbackEligible(deal.closed_at)

            return (
              <div key={deal.id} className="bg-white rounded-2xl p-6 card-hover">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Deal Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">{deal.customer_name}</h3>
                      <p className="text-gray-600 text-sm">{deal.customer_email}</p>
                      {deal.closed_at && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          Closed {formatDate(deal.closed_at)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deal Details */}
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Deal Value */}
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Deal Value</div>
                      <div className="font-semibold text-gray-900">{formatCurrency(deal.deal_value)}</div>
                    </div>

                    {/* Commission */}
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Commission ({deal.commission_rate}%)</div>
                      <div className="font-semibold text-green-600">{formatCurrency(deal.commission_amount)}</div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(deal.status)}`}>
                        {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                      </span>
                      {getPaymentStatusBadge(deal.payment_status)}
                    </div>
                  </div>
                </div>

                {/* Clawback Warning */}
                {clawbackEligible && deal.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Within clawback period - commission may be adjusted if subscription is cancelled</span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {deal.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{deal.notes}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
