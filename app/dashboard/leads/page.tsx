'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { getUser, getPartnerByUserId, getLeadsByPartnerId, supabase } from '@/lib/supabase'
import { formatCurrency, formatDate, daysUntil, getStatusColor } from '@/lib/utils'
import { Lead, LeadStatus } from '@/types'

const statusOptions: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'expired']

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  useEffect(() => {
    loadLeads()
  }, [])

  useEffect(() => {
    filterLeads()
  }, [leads, searchQuery, statusFilter])

  const loadLeads = async () => {
    try {
      const { user } = await getUser()
      if (user) {
        const { data: partner } = await getPartnerByUserId(user.id)
        if (partner) {
          const { data } = await getLeadsByPartnerId(partner.id)
          setLeads(data || [])
        }
      }
    } catch (error) {
      console.error('Error loading leads:', error)
      toast.error('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  const filterLeads = () => {
    let filtered = [...leads]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        lead =>
          lead.company_name.toLowerCase().includes(query) ||
          lead.contact_name.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter)
    }

    setFilteredLeads(filtered)
  }

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId)

      if (error) throw error

      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ))
      toast.success('Lead status updated')
    } catch (error) {
      console.error('Error updating lead:', error)
      toast.error('Failed to update lead status')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'lost':
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
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
          <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
          <p className="text-gray-600">Track and manage your assigned leads</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
            {leads.length} Total Leads
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
            {leads.filter(l => l.status === 'won').length} Won
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
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
              {statusOptions.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">No leads found</h3>
          <p className="text-gray-500">
            {leads.length === 0
              ? 'Leads will appear here once allocated to your account'
              : 'Try adjusting your search or filter criteria'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => {
            const daysLeft = daysUntil(lead.contact_deadline)
            const isOverdue = daysLeft < 0
            const isUrgent = daysLeft >= 0 && daysLeft <= 3

            return (
              <div key={lead.id} className="bg-white rounded-2xl p-6 card-hover">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Lead Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold text-lg">
                        {lead.company_name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">{lead.company_name}</h3>
                      <p className="text-gray-600">{lead.contact_name}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-gray-500 hover:text-purple-600">
                          <Mail className="w-4 h-4" />
                          {lead.email}
                        </a>
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-gray-500 hover:text-purple-600">
                            <Phone className="w-4 h-4" />
                            {lead.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Deadline */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                      isOverdue ? 'bg-red-100 text-red-700' :
                      isUrgent ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {isOverdue ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      <span className="text-sm font-medium">
                        {isOverdue ? 'Overdue' : `${daysLeft} days left`}
                      </span>
                    </div>

                    {/* Value */}
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Est. Value</div>
                      <div className="font-semibold text-gray-900">{formatCurrency(lead.estimated_value)}</div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                        className={`appearance-none pl-3 pr-8 py-2 rounded-lg font-medium text-sm border-0 cursor-pointer ${getStatusColor(lead.status)}`}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {lead.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{lead.notes}</p>
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
