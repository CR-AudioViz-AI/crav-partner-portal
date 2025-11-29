import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
export const createServerClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Auth helpers
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Database helpers
export const getPartnerByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export const getLeadsByPartnerId = async (partnerId: string) => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const getDealsByPartnerId = async (partnerId: string) => {
  const { data, error } = await supabase
    .from('deals')
    .select('*, leads(*), products(*)')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const getProducts = async (activeOnly = true) => {
  let query = supabase.from('products').select('*')
  if (activeOnly) {
    query = query.eq('active', true)
  }
  const { data, error } = await query.order('tier', { ascending: true })
  return { data, error }
}

export const getDocuments = async (partnerTier: string) => {
  const tierOrder = ['STARTER', 'PROVEN', 'ELITE', 'ELITE_PLUS']
  const tierIndex = tierOrder.indexOf(partnerTier)
  const accessibleTiers = tierOrder.slice(0, tierIndex + 1)
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .in('partner_tier_required', accessibleTiers)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const submitPartnerApplication = async (application: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('partner_applications')
    .insert([application])
    .select()
    .single()
  return { data, error }
}

export const getDashboardStats = async (partnerId: string) => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  
  // Get leads count
  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('partner_id', partnerId)
  
  // Get leads this month
  const { count: leadsThisMonth } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('partner_id', partnerId)
    .gte('created_at', startOfMonth)
  
  // Get deals
  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .eq('partner_id', partnerId)
  
  const activeDeals = deals?.filter(d => d.status === 'active' || d.status === 'pending').length || 0
  const dealsWon = deals?.filter(d => d.status === 'completed').length || 0
  const totalCommissions = deals?.filter(d => d.payment_status === 'paid').reduce((sum, d) => sum + d.commission_amount, 0) || 0
  const pendingCommissions = deals?.filter(d => d.payment_status === 'pending').reduce((sum, d) => sum + d.commission_amount, 0) || 0
  const avgDealSize = dealsWon > 0 ? (deals?.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.deal_value, 0) || 0) / dealsWon : 0
  const conversionRate = (totalLeads || 0) > 0 ? (dealsWon / (totalLeads || 1)) * 100 : 0
  
  return {
    total_leads: totalLeads || 0,
    leads_this_month: leadsThisMonth || 0,
    active_deals: activeDeals,
    deals_won: dealsWon,
    total_commissions: totalCommissions,
    pending_commissions: pendingCommissions,
    conversion_rate: conversionRate,
    avg_deal_size: avgDealSize,
  }
}
