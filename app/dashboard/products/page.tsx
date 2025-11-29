'use client'

import { useState, useEffect } from 'react'
import {
  Package,
  Search,
  Filter,
  DollarSign,
  Target,
  Clock,
  Star,
  ChevronDown,
  ExternalLink,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { getProducts } from '@/lib/supabase'
import { formatCurrency, getDifficultyColor, getProductTierLabel } from '@/lib/utils'
import { Product } from '@/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, tierFilter, difficultyFilter])

  const loadProducts = async () => {
    try {
      const { data, error } = await getProducts(true)
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      )
    }

    if (tierFilter !== 'all') {
      filtered = filtered.filter(product => product.tier.toString() === tierFilter)
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(product => product.difficulty === difficultyFilter)
    }

    setFilteredProducts(filtered)
  }

  // Demo products if none exist
  const demoProducts: Product[] = [
    {
      id: '1',
      name: 'Spirits App',
      description: 'AI-powered distillery and bar management solution with inventory tracking and recipe optimization',
      tier: 1,
      difficulty: 'easy',
      base_price: 499,
      commission_year1: 25,
      commission_recurring: 10,
      target_buyer: 'Distilleries, Bars, Restaurants',
      sales_cycle_days: 14,
      training_required: false,
      active: true,
      created_at: '',
      updated_at: '',
    },
    {
      id: '2',
      name: 'Realtor AI Suite',
      description: 'Complete real estate AI toolkit with property analysis, market predictions, and client management',
      tier: 2,
      difficulty: 'medium',
      base_price: 999,
      commission_year1: 20,
      commission_recurring: 8,
      target_buyer: 'Real Estate Agents, Brokerages',
      sales_cycle_days: 21,
      training_required: true,
      active: true,
      created_at: '',
      updated_at: '',
    },
    {
      id: '3',
      name: 'Market Oracle',
      description: '5 AI models compete to predict stocks and crypto - gamified investment research platform',
      tier: 2,
      difficulty: 'medium',
      base_price: 1499,
      commission_year1: 25,
      commission_recurring: 10,
      target_buyer: 'Traders, Investment Clubs, Educators',
      sales_cycle_days: 30,
      training_required: true,
      active: true,
      created_at: '',
      updated_at: '',
    },
    {
      id: '4',
      name: 'CRAudioViz Pro',
      description: 'Full AI platform access with 60+ tools, Javari AI assistant, and priority support',
      tier: 3,
      difficulty: 'hard',
      base_price: 4999,
      commission_year1: 18,
      commission_recurring: 5,
      target_buyer: 'SMBs, Agencies, Consultants',
      sales_cycle_days: 45,
      training_required: true,
      active: true,
      created_at: '',
      updated_at: '',
    },
    {
      id: '5',
      name: 'Enterprise Solution',
      description: 'White-label platform deployment with custom branding, dedicated support, and SLA',
      tier: 4,
      difficulty: 'expert',
      base_price: 9999,
      commission_year1: 15,
      commission_recurring: 3,
      target_buyer: 'Enterprise, Government, Large Organizations',
      sales_cycle_days: 90,
      training_required: true,
      active: true,
      created_at: '',
      updated_at: '',
    },
  ]

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : (products.length === 0 && !loading ? demoProducts : [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Catalog</h2>
          <p className="text-gray-600">Browse products available for you to sell</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
            {displayProducts.length} Products
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
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="pl-4 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none appearance-none bg-white"
              >
                <option value="all">All Tiers</option>
                <option value="1">Tier 1</option>
                <option value="2">Tier 2</option>
                <option value="3">Tier 3</option>
                <option value="4">Tier 4</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="pl-4 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none appearance-none bg-white"
              >
                <option value="all">All Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {displayProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden card-hover">
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    Tier {product.tier}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(product.difficulty)}`}>
                    {product.difficulty.charAt(0).toUpperCase() + product.difficulty.slice(1)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
              </div>

              {/* Stats */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Base Price</div>
                    <div className="font-bold text-gray-900">{formatCurrency(product.base_price)}/mo</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Your Commission</div>
                    <div className="font-bold text-green-600">{product.commission_year1}% Y1</div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="px-6 py-4 space-y-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{product.target_buyer}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{product.sales_cycle_days} day sales cycle</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{product.commission_recurring}% recurring commission</span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  {product.training_required && (
                    <span className="text-xs text-amber-600 font-medium">Training Required</span>
                  )}
                  <button className="ml-auto flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-sm">
                    View Details
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Commission Info */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Commission Structure</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold">15-25%</div>
            <div className="text-purple-100">Year 1 Commission</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold">3-10%</div>
            <div className="text-purple-100">Recurring Annual</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold">90 Days</div>
            <div className="text-purple-100">100% Clawback Period</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold">180 Days</div>
            <div className="text-purple-100">50% Clawback Period</div>
          </div>
        </div>
      </div>
    </div>
  )
}
