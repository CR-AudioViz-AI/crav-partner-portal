// lib/supabase.ts — CR AudioViz AI
// May 2026 — javari-partners
export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY || ANON

export const supabase = createClient(URL, ANON)
export const supabaseAdmin = createClient(URL, SVC, { auth: { persistSession: false } })

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}
export async function signOut() {
  return supabase.auth.signOut()
}
export async function getSession() {
  return supabase.auth.getSession()
}
export async function getUser(c?: ReturnType<typeof createClient>) {
  const { data: { user } } = await (c ?? supabase).auth.getUser()
  return user ?? null
}
export async function getPartnerByUserId(userId: string) {
  const { data } = await supabaseAdmin.from('partners').select('*').eq('user_id', userId).single()
  return data
}
export async function getDealsByPartnerId(partnerId: string) {
  const { data } = await supabaseAdmin.from('partner_deals').select('*').eq('partner_id', partnerId)
  return data ?? []
}

export async function signUp(email: string, password: string, metadata?: Record<string, unknown>) {
  return supabase.auth.signUp({ email, password, options: { data: metadata } })
}
