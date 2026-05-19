// lib/supabase.ts — CR AudioViz AI  javari-partners
import { createClient, SupabaseClient } from '@supabase/supabase-js'

function getUrl() { return process.env.NEXT_PUBLIC_SUPABASE_URL! }
function getAnon() { return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! }
function getSvc() { return process.env.SUPABASE_SERVICE_ROLE_KEY || getAnon() }

let _supabase: SupabaseClient | null = null
let _admin: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!_supabase) _supabase = createClient(getUrl(), getAnon())
  return _supabase
}
function getAdmin(): SupabaseClient {
  if (!_admin) _admin = createClient(getUrl(), getSvc(), { auth: { persistSession: false } })
  return _admin
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_t, prop) { return (getSupabase() as unknown as Record<string, unknown>)[prop as string] }
})
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_t, prop) { return (getAdmin() as unknown as Record<string, unknown>)[prop as string] }
})

export async function signIn(email: string, password: string) {
  return getSupabase().auth.signInWithPassword({ email, password })
}
export async function signOut() {
  return getSupabase().auth.signOut()
}
export async function getSession() {
  return getSupabase().auth.getSession()
}
export async function signUp(email: string, password: string, metadata?: object) {
  return getSupabase().auth.signUp({ email, password, options: { data: metadata as Record<string, unknown> | undefined } })
}
export async function getUser() {
  const { data: { user } } = await getSupabase().auth.getUser()
  return user ?? null
}
export async function getPartnerByUserId(userId: string) {
  const data = await getAdmin().from('partners').select('*').eq('user_id', userId).single()
  return data
}
export async function getDealsByPartnerId(partnerId: string) {
  const data = await getAdmin().from('partner_deals').select('*').eq('partner_id', partnerId)
  return data ?? []
}
export async function getLeadsByPartnerId(partnerId: string) {
  const data = await getAdmin().from('partner_leads').select('*').eq('partner_id', partnerId).order('created_at', { ascending: false })
  return data ?? []
}
export async function getDocuments(partnerId: string) {
  const data = await getAdmin().from('partner_documents').select('*').eq('partner_id', partnerId).order('created_at', { ascending: false })
  return data ?? []
}
export async function getDashboardStats(partnerId: string) {
  const [deals, leads, docs] = await Promise.all([
    getDealsByPartnerId(partnerId),
    getLeadsByPartnerId(partnerId),
    getDocuments(partnerId),
  ])
  return {
    totalDeals: deals.length,
    activeLeads: leads.length,
    documents: docs.length,
    revenue: (deals as Array<{ amount?: number }>).reduce((sum, d) => sum + (d.amount ?? 0), 0),
  }
}
export async function submitPartnerApplication(data: Record<string, unknown>) {
  const { data: result, error } = await getAdmin().from('partner_applications').insert(data).select().single()
  if (error) throw error
  return result
}
