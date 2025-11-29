'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  Folder,
  File,
  Image,
  Video,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'
import { getUser, getPartnerByUserId, getDocuments } from '@/lib/supabase'
import { formatDate, getTierColor } from '@/lib/utils'
import { Document, Partner } from '@/types'

const categoryLabels: Record<string, string> = {
  sales_deck: 'Sales Decks',
  case_study: 'Case Studies',
  one_pager: 'One Pagers',
  contract: 'Contracts',
  training: 'Training',
  pricing: 'Pricing',
}

const categoryIcons: Record<string, React.ElementType> = {
  sales_deck: Folder,
  case_study: FileText,
  one_pager: File,
  contract: FileText,
  training: Video,
  pricing: File,
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [partner, setPartner] = useState<Partner | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    loadDocuments()
  }, [])

  useEffect(() => {
    filterDocuments()
  }, [documents, searchQuery, categoryFilter])

  const loadDocuments = async () => {
    try {
      const { user } = await getUser()
      if (user) {
        const { data: partnerData } = await getPartnerByUserId(user.id)
        if (partnerData) {
          setPartner(partnerData)
          const { data } = await getDocuments(partnerData.tier)
          setDocuments(data || [])
        }
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const filterDocuments = () => {
    let filtered = [...documents]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        doc =>
          doc.title.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query)
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(doc => doc.category === categoryFilter)
    }

    setFilteredDocuments(filtered)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return FileText
    if (fileType.includes('image')) return Image
    if (fileType.includes('video')) return Video
    return File
  }

  // Demo documents
  const demoDocuments: Document[] = [
    {
      id: '1',
      title: 'CR AudioViz AI Master Sales Deck',
      description: 'Complete presentation covering all products, pricing, and value propositions',
      category: 'sales_deck',
      file_url: '#',
      file_type: 'application/pdf',
      file_size: 5242880,
      partner_tier_required: 'STARTER',
      downloads: 145,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Spirits App Case Study - Local Distillery',
      description: 'How a local distillery increased efficiency by 40% with our solution',
      category: 'case_study',
      file_url: '#',
      file_type: 'application/pdf',
      file_size: 2097152,
      partner_tier_required: 'STARTER',
      downloads: 89,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Market Oracle One Pager',
      description: 'Quick reference for the AI stock-picking battle platform',
      category: 'one_pager',
      file_url: '#',
      file_type: 'application/pdf',
      file_size: 1048576,
      partner_tier_required: 'STARTER',
      downloads: 234,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'Partner Agreement Template',
      description: 'Standard contract template for closing deals',
      category: 'contract',
      file_url: '#',
      file_type: 'application/pdf',
      file_size: 524288,
      partner_tier_required: 'PROVEN',
      downloads: 56,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'Sales Training - Objection Handling',
      description: 'Video training on handling common objections and closing techniques',
      category: 'training',
      file_url: '#',
      file_type: 'video/mp4',
      file_size: 52428800,
      partner_tier_required: 'STARTER',
      downloads: 178,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '6',
      title: 'Enterprise Pricing Calculator',
      description: 'Interactive tool for building custom enterprise quotes',
      category: 'pricing',
      file_url: '#',
      file_type: 'application/xlsx',
      file_size: 262144,
      partner_tier_required: 'ELITE',
      downloads: 23,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  const displayDocuments = filteredDocuments.length > 0 ? filteredDocuments : (documents.length === 0 && !loading ? demoDocuments : [])

  // Group by category
  const groupedDocuments = displayDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = []
    }
    acc[doc.category].push(doc)
    return acc
  }, {} as Record<string, Document[]>)

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
          <h2 className="text-2xl font-bold text-gray-900">Sales Materials</h2>
          <p className="text-gray-600">Download pitch decks, case studies, and training materials</p>
        </div>
        {partner && (
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${getTierColor(partner.tier)}`}>
            {partner.tier} Access
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Documents */}
      {displayDocuments.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">No documents found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : categoryFilter === 'all' ? (
        // Grouped view
        <div className="space-y-8">
          {Object.entries(groupedDocuments).map(([category, docs]) => {
            const CategoryIcon = categoryIcons[category] || File
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <CategoryIcon className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{categoryLabels[category]}</h3>
                  <span className="text-sm text-gray-500">({docs.length})</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((doc) => {
                    const FileIcon = getFileIcon(doc.file_type)
                    const tierOrder = ['STARTER', 'PROVEN', 'ELITE', 'ELITE_PLUS']
                    const hasAccess = partner ? tierOrder.indexOf(partner.tier) >= tierOrder.indexOf(doc.partner_tier_required) : false

                    return (
                      <div key={doc.id} className="bg-white rounded-xl p-5 border border-gray-100 card-hover">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <FileIcon className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{doc.title}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{doc.description}</p>
                            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                              <span>{formatFileSize(doc.file_size)}</span>
                              <span>•</span>
                              <span>{doc.downloads} downloads</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded ${getTierColor(doc.partner_tier_required)}`}>
                            {doc.partner_tier_required}+
                          </span>
                          {hasAccess ? (
                            <button className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-sm">
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400 text-sm">
                              <Lock className="w-4 h-4" />
                              Upgrade Required
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // Flat list view
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayDocuments.map((doc) => {
            const FileIcon = getFileIcon(doc.file_type)
            const tierOrder = ['STARTER', 'PROVEN', 'ELITE', 'ELITE_PLUS']
            const hasAccess = partner ? tierOrder.indexOf(partner.tier) >= tierOrder.indexOf(doc.partner_tier_required) : false

            return (
              <div key={doc.id} className="bg-white rounded-xl p-5 border border-gray-100 card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{doc.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{doc.description}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>•</span>
                      <span>{doc.downloads} downloads</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${getTierColor(doc.partner_tier_required)}`}>
                    {doc.partner_tier_required}+
                  </span>
                  {hasAccess ? (
                    <button className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-sm">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      <Lock className="w-4 h-4" />
                      Upgrade Required
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
