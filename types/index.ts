// Partner Portal Types - Enhanced with Monetization Features

// ========== PARTNER TIERS ==========
export type PartnerTier = 'STARTER' | 'PROVEN' | 'ELITE' | 'ELITE_PLUS'
export type PartnerStatus = 'pending' | 'active' | 'suspended' | 'churned'
export type CertificationLevel = 'none' | 'certified' | 'advanced' | 'elite'

// ========== SUBSCRIPTION TIERS ==========
export type SubscriptionTier = 'free' | 'pro' | 'enterprise'
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing'

export interface PartnerSubscription {
  id: string
  partner_id: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  features: {
    premium_leads: boolean
    advanced_analytics: boolean
    proposal_generator: boolean
    crm_integration: boolean
    white_label: boolean
    priority_support: boolean
  }
  price_monthly: number
  stripe_subscription_id?: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
}

// ========== PARTNER ==========
export interface Partner {
  id: string
  user_id: string
  company_name: string
  contact_name: string
  email: string
  phone: string
  website?: string
  tier: PartnerTier
  status: PartnerStatus
  certification_level: CertificationLevel
  certification_expires?: string
  subscription_tier: SubscriptionTier
  commission_rate: number
  total_sales: number
  total_commissions: number
  leads_allocated: number
  leads_converted: number
  current_streak: number
  longest_streak: number
  total_points: number
  badges: string[]
  rank_position?: number
  created_at: string
  updated_at: string
}

// ========== GAMIFICATION ==========
export type BadgeType = 
  | 'first_sale'
  | 'fast_closer'
  | 'retention_master'
  | 'cross_sell_champion'
  | 'ten_k_club'
  | 'fifty_k_club'
  | 'hundred_k_club'
  | 'streak_7'
  | 'streak_30'
  | 'product_specialist'
  | 'rising_star'
  | 'top_performer'

export interface Badge {
  id: string
  type: BadgeType
  name: string
  description: string
  icon: string
  points_value: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earned_at?: string
}

export interface LeaderboardEntry {
  rank: number
  partner_id: string
  partner_name: string
  company_name: string
  tier: PartnerTier
  total_sales: number
  deals_closed: number
  conversion_rate: number
  badges_count: number
  streak: number
  change: number // position change from last period
}

export interface Achievement {
  id: string
  partner_id: string
  badge_type: BadgeType
  earned_at: string
  notified: boolean
}

// ========== LEADS ==========
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'expired'
export type LeadScore = 'hot' | 'warm' | 'cold'
export type LeadSource = 'inbound' | 'outbound' | 'referral' | 'partner_generated' | 'marketing'

export interface Lead {
  id: string
  partner_id: string
  company_name: string
  contact_name: string
  email: string
  phone?: string
  source: LeadSource
  status: LeadStatus
  score: LeadScore
  score_factors?: {
    company_size: number
    engagement: number
    budget_fit: number
    timeline: number
    decision_maker: number
  }
  estimated_value: number
  recommended_products: string[]
  cross_sell_opportunities: string[]
  notes?: string
  contact_deadline: string
  close_deadline: string
  last_activity?: string
  next_action?: string
  next_action_date?: string
  created_at: string
  updated_at: string
}

// ========== DEALS ==========
export type DealStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'clawback'
export type PaymentStatus = 'pending' | 'paid' | 'clawback' | 'processing'

export interface Deal {
  id: string
  partner_id: string
  lead_id?: string
  product_id: string
  product_name?: string
  customer_name: string
  customer_email: string
  deal_value: number
  commission_amount: number
  commission_rate: number
  bonus_commission: number
  bonus_reason?: string
  status: DealStatus
  payment_status: PaymentStatus
  clawback_eligible_until?: string
  is_bundle: boolean
  bundle_products?: string[]
  is_upsell: boolean
  original_deal_id?: string
  notes?: string
  closed_at?: string
  paid_at?: string
  created_at: string
  updated_at: string
}

// ========== PRODUCTS ==========
export type ProductTier = 1 | 2 | 3 | 4
export type ProductDifficulty = 'easy' | 'medium' | 'hard' | 'expert'
export type ProductCategory = 'ai_tools' | 'industry_specific' | 'enterprise' | 'platform'

export interface Product {
  id: string
  name: string
  description: string
  short_pitch: string
  tier: ProductTier
  category: ProductCategory
  difficulty: ProductDifficulty
  base_price: number
  commission_year1: number
  commission_recurring: number
  target_buyer: string
  ideal_customer_profile: string
  sales_cycle_days: number
  training_required: boolean
  certification_required: CertificationLevel
  cross_sell_products: string[]
  upsell_products: string[]
  bundle_discount: number
  active: boolean
  featured: boolean
  new_product_bonus?: number
  new_product_bonus_expires?: string
  objection_handlers: {
    objection: string
    response: string
  }[]
  competitor_comparisons: {
    competitor: string
    our_advantage: string
    their_advantage: string
    win_rate: number
  }[]
  created_at: string
  updated_at: string
}

// ========== BUNDLES ==========
export interface ProductBundle {
  id: string
  name: string
  description: string
  products: string[]
  bundle_price: number
  savings_amount: number
  savings_percent: number
  bonus_commission: number
  target_buyer: string
  active: boolean
  expires_at?: string
}

// ========== DOCUMENTS ==========
export type DocumentCategory = 'sales_deck' | 'case_study' | 'one_pager' | 'contract' | 'training' | 'pricing' | 'email_template' | 'call_script' | 'proposal_template' | 'video'
export type DocumentAccess = 'all' | 'certified' | 'advanced' | 'elite' | 'premium_subscriber'

export interface Document {
  id: string
  title: string
  description: string
  category: DocumentCategory
  file_url: string
  file_type: string
  file_size: number
  thumbnail_url?: string
  access_level: DocumentAccess
  product_id?: string
  is_premium: boolean
  downloads: number
  rating?: number
  tags: string[]
  created_at: string
  updated_at: string
}

// ========== EMAIL TEMPLATES ==========
export type EmailTemplateCategory = 'cold_outreach' | 'follow_up' | 'proposal' | 'objection' | 'closing' | 'post_sale' | 'cross_sell' | 'win_back'

export interface EmailTemplate {
  id: string
  name: string
  category: EmailTemplateCategory
  subject: string
  body: string
  product_id?: string
  variables: string[]
  is_premium: boolean
  usage_count: number
  success_rate?: number
  created_at: string
}

// ========== PROPOSALS ==========
export interface Proposal {
  id: string
  partner_id: string
  lead_id: string
  title: string
  products: {
    product_id: string
    quantity: number
    custom_price?: number
  }[]
  total_value: number
  discount_percent?: number
  discount_reason?: string
  valid_until: string
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
  pdf_url?: string
  custom_branding: boolean
  created_at: string
  sent_at?: string
  viewed_at?: string
}

// ========== CERTIFICATIONS ==========
export interface Certification {
  id: string
  partner_id: string
  level: CertificationLevel
  product_certifications: string[]
  exam_score?: number
  training_completed: string[]
  certificate_url?: string
  issued_at: string
  expires_at: string
  renewal_price: number
}

// ========== TRAINING ==========
export interface TrainingModule {
  id: string
  title: string
  description: string
  category: 'sales' | 'product' | 'technical' | 'soft_skills'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  video_url?: string
  content_url?: string
  quiz_questions?: {
    question: string
    options: string[]
    correct_answer: number
  }[]
  passing_score: number
  is_premium: boolean
  price?: number
  points_reward: number
  badge_reward?: BadgeType
  required_for_certification?: CertificationLevel
  created_at: string
}

export interface TrainingProgress {
  id: string
  partner_id: string
  module_id: string
  status: 'not_started' | 'in_progress' | 'completed' | 'failed'
  progress_percent: number
  quiz_score?: number
  completed_at?: string
  attempts: number
}

// ========== ANALYTICS ==========
export interface DashboardStats {
  total_leads: number
  active_deals: number
  total_commissions: number
  pending_commissions: number
  conversion_rate: number
  avg_deal_size: number
  avg_close_time: number
  monthly_sales: number
  quarterly_sales: number
  yearly_sales: number
  rank_position: number
  rank_change: number
  current_streak: number
  points_balance: number
  next_tier_progress: number
  next_tier_target: number
  bonus_opportunities: {
    type: string
    description: string
    potential_bonus: number
    requirements: string
  }[]
  cross_sell_opportunities: number
  expiring_leads: number
  at_risk_deals: number
}

export interface PerformanceMetrics {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  sales_volume: number[]
  deals_closed: number[]
  conversion_rates: number[]
  avg_deal_sizes: number[]
  commission_earned: number[]
  labels: string[]
}

export interface CustomerHealth {
  customer_id: string
  customer_name: string
  product_id: string
  health_score: number
  usage_score: number
  engagement_score: number
  satisfaction_score: number
  churn_risk: 'low' | 'medium' | 'high'
  last_activity: string
  renewal_date: string
  expansion_ready: boolean
  recommended_actions: string[]
}

// ========== NOTIFICATIONS ==========
export type NotificationType = 
  | 'lead_assigned'
  | 'lead_expiring'
  | 'deal_won'
  | 'deal_lost'
  | 'commission_paid'
  | 'badge_earned'
  | 'rank_change'
  | 'bonus_available'
  | 'certification_expiring'
  | 'training_reminder'
  | 'cross_sell_opportunity'
  | 'customer_at_risk'
  | 'new_product_launch'
  | 'system_announcement'

export interface Notification {
  id: string
  partner_id: string
  type: NotificationType
  title: string
  message: string
  action_url?: string
  is_read: boolean
  is_urgent: boolean
  created_at: string
}

// ========== APPLICATION ==========
export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected'

export interface PartnerApplication {
  id: string
  user_id: string
  company_name: string
  contact_name: string
  email: string
  phone: string
  website?: string
  business_type: string
  years_in_business: number
  sales_experience: string
  target_markets: string[]
  expected_monthly_sales: number
  how_heard_about_us: string
  linkedin_url?: string
  references?: string
  status: ApplicationStatus
  reviewed_by?: string
  review_notes?: string
  created_at: string
  updated_at: string
}

// ========== CHAT ==========
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  context?: {
    lead_id?: string
    product_id?: string
    deal_id?: string
  }
}

// ========== USER PROFILE ==========
export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  partner_id?: string
  timezone: string
  notification_preferences: {
    email_leads: boolean
    email_deals: boolean
    email_commissions: boolean
    email_training: boolean
    email_marketing: boolean
    push_enabled: boolean
    sms_enabled: boolean
  }
  created_at: string
}

// ========== REWARDS ==========
export interface RewardItem {
  id: string
  name: string
  description: string
  category: 'swag' | 'feature' | 'credit' | 'event' | 'training'
  points_cost: number
  inventory?: number
  image_url?: string
  is_available: boolean
}

export interface RewardRedemption {
  id: string
  partner_id: string
  reward_id: string
  points_spent: number
  status: 'pending' | 'fulfilled' | 'cancelled'
  shipping_address?: string
  notes?: string
  created_at: string
  fulfilled_at?: string
}

// ========== REFERRALS ==========
export interface PartnerReferral {
  id: string
  referrer_partner_id: string
  referred_email: string
  referred_partner_id?: string
  status: 'pending' | 'signed_up' | 'qualified' | 'paid'
  bonus_amount: number
  bonus_paid: boolean
  created_at: string
  qualified_at?: string
  paid_at?: string
}
