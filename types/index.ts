// Partner Types
export type PartnerTier = 'STARTER' | 'PROVEN' | 'ELITE' | 'ELITE_PLUS'
export type PartnerStatus = 'pending' | 'approved' | 'active' | 'suspended' | 'terminated'
export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected'

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
  commission_rate: number
  total_sales: number
  total_commissions: number
  leads_allocated: number
  leads_converted: number
  created_at: string
  updated_at: string
}

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

// Lead Types
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'expired'

export interface Lead {
  id: string
  partner_id: string
  company_name: string
  contact_name: string
  email: string
  phone?: string
  source: string
  status: LeadStatus
  estimated_value: number
  notes?: string
  contact_deadline: string
  close_deadline: string
  created_at: string
  updated_at: string
}

// Deal Types
export type DealStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'clawback'

export interface Deal {
  id: string
  partner_id: string
  lead_id: string
  product_id: string
  customer_name: string
  customer_email: string
  deal_value: number
  commission_amount: number
  commission_rate: number
  status: DealStatus
  payment_status: 'pending' | 'paid' | 'clawback'
  clawback_eligible_until?: string
  notes?: string
  closed_at?: string
  created_at: string
  updated_at: string
}

// Product Types
export type ProductTier = 1 | 2 | 3 | 4
export type ProductDifficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface Product {
  id: string
  name: string
  description: string
  tier: ProductTier
  difficulty: ProductDifficulty
  base_price: number
  commission_year1: number
  commission_recurring: number
  target_buyer: string
  sales_cycle_days: number
  training_required: boolean
  active: boolean
  created_at: string
  updated_at: string
}

// Document Types
export interface Document {
  id: string
  title: string
  description: string
  category: 'sales_deck' | 'case_study' | 'one_pager' | 'contract' | 'training' | 'pricing'
  file_url: string
  file_type: string
  file_size: number
  partner_tier_required: PartnerTier
  downloads: number
  created_at: string
  updated_at: string
}

// Chat Types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// Dashboard Stats
export interface DashboardStats {
  total_leads: number
  leads_this_month: number
  active_deals: number
  deals_won: number
  total_commissions: number
  pending_commissions: number
  conversion_rate: number
  avg_deal_size: number
}

// User Profile
export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  partner_id?: string
  role: 'partner' | 'admin' | 'super_admin'
  created_at: string
  updated_at: string
}
