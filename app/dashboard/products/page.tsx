'use client'

import { useState, useEffect } from 'react'
import {
  Package,
  Search,
  Filter,
  DollarSign,
  Clock,
  Target,
  Award,
  ChevronDown,
  Star,
  TrendingUp,
  Sparkles,
  Gift,
  Calculator,
  BookOpen,
  Play,
  ExternalLink,
  Lock,
  Zap,
  Users,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatPercent, getProductTierLabel, getDifficultyColor } from '@/lib/utils'
import { Product, ProductBundle, ProductTier, ProductDifficulty } from '@/types'

// Demo products with enhanced data
const demoProducts: Product[] = [
  {
    id: '1',
    name: 'Spirits App',
    description: 'AI-powered distillery and bar management solution with inventory tracking, recipe optimization, and customer insights.',
    short_pitch: 'The #1 AI solution for craft distilleries and premium bars',
    tier: 1,
    category: 'industry_specific',
    difficulty: 'easy',
    base_price: 499,
    commission_year1: 25,
    commission_recurring: 10,
    target_buyer: 'Distilleries, Craft Bars, Premium Restaurants',
    ideal_customer_profile: 'Businesses with 10+ spirit SKUs seeking inventory optimization',
    sales_cycle_days: 14,
    training_required: false,
    certification_required: 'none',
    cross_sell_products: ['3'],
    upsell_products: ['4'],
    bundle_discount: 15,
    active: true,
    featured: true,
    objection_handlers: [
      { objection: 'We already use spreadsheets', response: 'Spreadsheets cost you 10+ hours/week. Our ROI calculator shows average 340% return in year one.' },
      { objection: 'Too expensive', response: 'At $499/month, one prevented stockout pays for 6 months of service.' },
    ],
    competitor_comparisons: [
      { competitor: 'BarTrack', our_advantage: 'AI-powered predictions', their_advantage: 'Established brand', win_rate: 72 },
    ],
    created_at: '2025-01-01',
    updated_at: '2025-11-01',
  },
  {
    id: '2',
    name: 'Realtor AI Suite',
    description: 'Complete real estate AI toolkit with property analysis, market predictions, automated valuations, and client management.',
    short_pitch: 'Close more deals with AI-powered real estate intelligence',
    tier: 2,
    category: 'industry_specific',
    difficulty: 'medium',
    base_price: 999,
    commission_year1: 20,
    commission_recurring: 8,
    target_buyer: 'Real Estate Agents, Brokerages, Property Managers',
    ideal_customer_profile: 'Agents closing 20+ transactions/year seeking competitive edge',
    sales_cycle_days: 21,
    training_required: true,
    certification_required: 'certified',
    cross_sell_products: ['4'],
    upsell_products: ['4'],
    bundle_discount: 15,
    active: true,
    featured: true,
    objection_handlers: [
      { objection: 'I have my own systems', response: 'Our agents report 40% faster closes. What would 10 extra transactions mean for your income?' },
    ],
    competitor_comparisons: [
      { competitor: 'Zillow Premier Agent', our_advantage: 'AI valuation accuracy', their_advantage: 'Lead volume', win_rate: 65 },
    ],
    created_at: '2025-01-01',
    updated_at: '2025-11-01',
  },
  {
    id: '3',
    name: 'Market Oracle',
    description: '5 AI models compete to predict stocks and crypto. Gamified investment research platform with real-time signals and portfolio tracking.',
    short_pitch: 'Where AI models compete to make you smarter investments',
    tier: 2,
    category: 'ai_tools',
    difficulty: 'medium',
    base_price: 1499,
    commission_year1: 25,
    commission_recurring: 10,
    target_buyer: 'Active Traders, Investment Clubs, Financial Educators',
    ideal_customer_profile: 'Traders making 10+ trades/month seeking data-driven insights',
    sales_cycle_days: 30,
    training_required: true,
    certification_required: 'certified',
    cross_sell_products: ['1', '4'],
    upsell_products: ['4'],
    bundle_discount: 20,
    active: true,
    featured: true,
    new_product_bonus: 10,
    new_product_bonus_expires: '2025-12-15',
    objection_handlers: [
      { objection: 'I can do my own research', response: 'Our AI processes 10M+ data points daily. Can you match that while working your day job?' },
    ],
    competitor_comparisons: [
      { competitor: 'TradingView', our_advantage: 'AI predictions', their_advantage: 'Charting tools', win_rate: 58 },
    ],
    created_at: '2025-01-01',
    updated_at: '2025-11-01',
  },
  {
    id: '4',
    name: 'CRAudioViz Pro',
    description: 'Full AI platform access with 60+ professional tools, Javari AI assistant, workflow automation, and priority support.',
    short_pitch: 'The complete AI toolkit for modern businesses',
    tier: 3,
    category: 'platform',
    difficulty: 'hard',
    base_price: 4999,
    commission_year1: 18,
    commission_recurring: 5,
    target_buyer: 'SMBs, Agencies, Consultants, Growing Teams',
    ideal_customer_profile: 'Teams of 5-50 needing comprehensive AI capabilities',
    sales_cycle_days: 45,
    training_required: true,
    certification_required: 'advanced',
    cross_sell_products: ['5'],
    upsell_products: ['5'],
    bundle_discount: 25,
    active: true,
    featured: false,
    objection_handlers: [
      { objection: 'We use multiple point solutions', response: 'You are paying 3x more for fragmented tools. Our platform consolidates everything at 60% savings.' },
    ],
    competitor_comparisons: [
      { competitor: 'Jasper AI', our_advantage: 'All-in-one platform', their_advantage: 'Content focus', win_rate: 70 },
    ],
    created_at: '2025-01-01',
    updated_at: '2025-11-01',
  },
  {
    id: '5',
    name: 'Enterprise Solution',
    description: 'White-label platform deployment with custom branding, dedicated infrastructure, SLA guarantees, and enterprise support.',
    short_pitch: 'Deploy CR AudioViz AI under your own brand',
    tier: 4,
    category: 'enterprise',
    difficulty: 'expert',
    base_price: 9999,
    commission_year1: 15,
    commission_recurring: 3,
    target_buyer: 'Enterprise, Government, Large Organizations',
    ideal_customer_profile: 'Organizations with 100+ users requiring custom deployment',
    sales_cycle_days: 90,
    training_required: true,
    certification_required: 'elite',
    cross_sell_products: [],
    upsell_products: [],
    bundle_discount: 0,
    active: true,
    featured: false,
    objection_handlers: [
      { objection: 'We need custom features', response: 'Our enterprise plan includes 40 hours of custom development. What specific needs do you have?' },
    ],
    competitor_comparisons: [],
    created_at: '2025-01-01',
    updated_at: '2025-11-01',
  },
  {
    id: '6',
    name: 'CRAIverse Social',
    description: 'Virtual world with 20 social impact modules serving veterans, first responders, faith communities, and underserved populations.',
    short_pitch: 'AI-powered social impact for the communities that matter',
    tier: 3,
    category: 'platform',
    difficulty: 'hard',
    base_price: 2999,
    commission_year1: 22,
    commission_recurring: 8,
    target_buyer: 'Non-profits, Government Agencies, Faith Organizations',
    ideal_customer_profile: 'Organizations serving 1000+ community members',
    sales_cycle_days: 60,
    training_required: true,
    certification_required: 'advanced',
    cross_sell_products: ['4'],
    upsell_products: ['5'],
    bundle_discount: 15,
    active: true,
    featured: true,
    new_product_bonus: 15,
    new_product_bonus_expires: '2025-12-31',
    objection_handlers: [
      { objection: 'Our community is not tech-savvy', response: 'CRAIverse was designed for accessibility. 89% of users over 65 report easy adoption.' },
    ],
    competitor_comparisons: [],
    created_at: '2025-11-01',
    updated_at: '2025-11-01',
  },
]

// Demo bundles
const demoBundles: ProductBundle[] = [
  {
    id: 'b1',
    name: 'Small Business Starter',
    description: 'Perfect combo for growing businesses: Spirits App + Market Oracle',
    products: ['1', '3'],
    bundle_price: 1699,
    savings_amount: 299,
    savings_percent: 15,
    bonus_commission: 3,
    target_buyer: 'Small businesses wanting AI efficiency + investment insights',
    active: true,
  },
  {
    id: 'b2',
    name: 'Real Estate Pro Bundle',
    description: 'Dominate your market: Realtor AI + Market Oracle + CRAudioViz Pro',
    products: ['2', '3', '4'],
    bundle_price: 6499,
    savings_amount: 998,
    savings_percent: 13,
    bonus_commission: 5,
    target_buyer: 'Top-producing agents wanting the complete toolkit',
    active: true,
  },
  {
    id: 'b3',
    name: 'Social Impact Package',
    description: 'Full platform for non-profits: CRAIverse Social + CRAudioViz Pro',
    products: ['6', '4'],
    bundle_price: 6999,
    savings_amount: 999,
    savings_percent: 12,
    bonus_commission: 4,
    target_buyer: 'Non-profits seeking comprehensive AI + community platform',
    active: true,
  },
]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [showCalculator, setShowCalculator] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [calculatorDeals, setCalculatorDeals] = useState(5)
  const [activeTab, setActiveTab] = useState<'products' | 'bundles'>('products')

  const filteredProducts = demoProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTier = tierFilter === 'all' || product.tier.toString() === tierFilter
    const matchesDifficulty = difficultyFilter === 'all' || product.difficulty === difficultyFilter
    return matchesSearch && matchesTier && matchesDifficulty
  })

  const calculateEarnings = (product: Product, deals: number) => {
    const year1 = product.base_price * (product.commission_year1 / 100) * deals
    const recurring = product.base_price * (product.commission_recurring / 100) * deals
    const bonus = product.new_product_bonus ? product.base_price * (product.new_product_bonus / 100) * deals : 0
    return { year1, recurring, bonus, total: year1 + bonus }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Catalog</h2>
          <p className="text-gray-600">Browse products and maximize your commissions</p>
        </div>
        <button
          onClick={() => setShowCalculator(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          <Calculator className="w-5 h-5" />
          Commission Calculator
        </button>
      </div>

      {/* Commission Info Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Commission Structure</h3>
              <p className="text-sm text-gray-600">Earn on every sale, plus recurring revenue</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">15-25%</div>
              <div className="text-xs text-gray-500">Year 1 Commission</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">3-10%</div>
              <div className="text-xs text-gray-500">Recurring Annual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">+3-5%</div>
              <div className="text-xs text-gray-500">Bundle Bonus</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">+10-15%</div>
              <div className="text-xs text-gray-500">New Product Bonus</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'text-purple-600 border-purple-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Individual Products
        </button>
        <button
          onClick={() => setActiveTab('bundles')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'bundles'
              ? 'text-purple-600 border-purple-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          <Gift className="w-4 h-4 inline mr-2" />
          Bundles
          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">+Bonus</span>
        </button>
      </div>

      {activeTab === 'products' ? (
        <>
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
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none appearance-none bg-white"
                  >
                    <option value="all">All Tiers</option>
                    <option value="1">Tier 1 (Entry)</option>
                    <option value="2">Tier 2 (Growth)</option>
                    <option value="3">Tier 3 (Pro)</option>
                    <option value="4">Tier 4 (Enterprise)</option>
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
          <div className="grid md:grid-cols-2 gap-6">
            {filteredProducts.map((product) => {
              const earnings = calculateEarnings(product, 1)
              const hasBonus = product.new_product_bonus && new Date(product.new_product_bonus_expires!) > new Date()
              
              return (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden card-hover">
                  {/* Header */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          product.tier === 1 ? 'bg-blue-100 text-blue-700' :
                          product.tier === 2 ? 'bg-purple-100 text-purple-700' :
                          product.tier === 3 ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {getProductTierLabel(product.tier)}
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(product.difficulty)}`}>
                          {product.difficulty.charAt(0).toUpperCase() + product.difficulty.slice(1)}
                        </span>
                        {hasBonus && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold animate-pulse">
                            +{product.new_product_bonus}% BONUS
                          </span>
                        )}
                      </div>
                      {product.featured && (
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-purple-600 font-medium mb-2">{product.short_pitch}</p>
                    <p className="text-sm text-gray-600">{product.description}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50">
                    <div className="p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(product.base_price)}</div>
                      <div className="text-xs text-gray-500">Base Price</div>
                    </div>
                    <div className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{product.commission_year1}%</div>
                      <div className="text-xs text-gray-500">Year 1</div>
                    </div>
                    <div className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{product.commission_recurring}%</div>
                      <div className="text-xs text-gray-500">Recurring</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{product.target_buyer}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{product.sales_cycle_days} day avg sales cycle</span>
                    </div>
                    {product.training_required && (
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-amber-500" />
                        <span className="text-amber-600">Training required</span>
                      </div>
                    )}
                    {product.certification_required !== 'none' && (
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-purple-500" />
                        <span className="text-purple-600">{product.certification_required} certification required</span>
                      </div>
                    )}

                    {/* Earnings Preview */}
                    <div className="mt-4 p-3 bg-green-50 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">Your earnings per sale:</div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(earnings.year1 + earnings.bonus)}
                        </span>
                        {earnings.bonus > 0 && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            Includes ${earnings.bonus} bonus!
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cross-sell suggestion */}
                    {product.cross_sell_products.length > 0 && (
                      <div className="p-3 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-2 text-xs text-purple-600 font-medium mb-1">
                          <Sparkles className="w-3 h-3" />
                          Cross-sell opportunity
                        </div>
                        <div className="text-sm text-gray-700">
                          Pair with {demoProducts.find(p => p.id === product.cross_sell_products[0])?.name} for +3% bundle bonus
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 flex gap-2">
                    <button
                      onClick={() => { setSelectedProduct(product); setShowCalculator(true); }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                    >
                      <Calculator className="w-4 h-4" />
                      Calculate Earnings
                    </button>
                    <button className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <Play className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <ExternalLink className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        /* Bundles Tab */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-bold text-gray-900">Bundle = More Commissions</h3>
                <p className="text-sm text-gray-600">Sell bundles to earn bonus commissions on top of individual product rates</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {demoBundles.map((bundle) => {
              const bundleProducts = demoProducts.filter(p => bundle.products.includes(p.id))
              const totalBaseCommission = bundleProducts.reduce((sum, p) => sum + (bundle.bundle_price * (p.commission_year1 / 100) / bundleProducts.length), 0)
              const bonusCommission = bundle.bundle_price * (bundle.bonus_commission / 100)

              return (
                <div key={bundle.id} className="bg-white rounded-2xl overflow-hidden card-hover">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{bundle.name}</h3>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                            SAVE {formatPercent(bundle.savings_percent)}
                          </span>
                        </div>
                        <p className="text-gray-600">{bundle.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">{formatCurrency(bundle.bundle_price)}</div>
                        <div className="text-sm text-gray-500 line-through">{formatCurrency(bundle.bundle_price + bundle.savings_amount)}</div>
                      </div>
                    </div>

                    {/* Included Products */}
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-500 mb-2">Includes:</div>
                      <div className="flex flex-wrap gap-2">
                        {bundleProducts.map((product) => (
                          <div key={product.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-gray-700">{product.name}</span>
                            <span className="text-xs text-gray-500">({formatCurrency(product.base_price)})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Commission Breakdown */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600">Your commission per bundle sale:</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-2xl font-bold text-green-600">{formatCurrency(totalBaseCommission + bonusCommission)}</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                              +{formatCurrency(bonusCommission)} BUNDLE BONUS
                            </span>
                          </div>
                        </div>
                        <button className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                          Create Proposal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Commission Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Commission Calculator</h3>
                <button onClick={() => setShowCalculator(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => setSelectedProduct(demoProducts.find(p => p.id === e.target.value) || null)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                >
                  <option value="">Choose a product...</option>
                  {demoProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.base_price)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Deals</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={calculatorDeals}
                  onChange={(e) => setCalculatorDeals(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-2xl font-bold text-purple-600 mt-2">{calculatorDeals} deals</div>
              </div>

              {selectedProduct && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <div className="text-sm text-gray-600">Year 1 Commission</div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(calculateEarnings(selectedProduct, calculatorDeals).year1)}
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <div className="text-sm text-gray-600">Recurring/Year</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(calculateEarnings(selectedProduct, calculatorDeals).recurring)}
                      </div>
                    </div>
                  </div>

                  {selectedProduct.new_product_bonus && (
                    <div className="bg-amber-50 rounded-xl p-4 text-center">
                      <div className="text-sm text-gray-600">New Product Bonus (+{selectedProduct.new_product_bonus}%)</div>
                      <div className="text-2xl font-bold text-amber-600">
                        {formatCurrency(calculateEarnings(selectedProduct, calculatorDeals).bonus)}
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-center text-white">
                    <div className="text-sm opacity-80">Total First Year Earnings</div>
                    <div className="text-4xl font-bold">
                      {formatCurrency(calculateEarnings(selectedProduct, calculatorDeals).total)}
                    </div>
                    <div className="text-sm opacity-80 mt-2">
                      Plus {formatCurrency(calculateEarnings(selectedProduct, calculatorDeals).recurring)}/year recurring
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
