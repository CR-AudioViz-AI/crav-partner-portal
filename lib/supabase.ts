// lib/supabase.ts — javari-partners  May 16 2026
import { createClient as _c } from "@supabase/supabase-js"
const URL=process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SVC=process.env.SUPABASE_SERVICE_ROLE_KEY??ANON
export const supabase=_c(URL,ANON)
export const supabaseAdmin=_c(URL,SVC,{auth:{persistSession:false}})
export const createClient=()=>_c(URL,ANON)
export async function getUser(c?:ReturnType<typeof createClient>){const{data:{user}}=await(c??supabase).auth.getUser();return user}
export async function getSession(c?:ReturnType<typeof createClient>){const{data:{session}}=await(c??supabase).auth.getSession();return session}
export async function getPartnerByUserId(userId:string){const{data}=await supabaseAdmin.from("partners").select("*").eq("user_id",userId).single();return data}
export async function getDealsByPartnerId(partnerId:string){const{data}=await supabaseAdmin.from("partner_deals").select("*").eq("partner_id",partnerId);return data??[]}
export function shouldChargeCredits(e?:string|null){return!["royhenderson@craudiovizai.com"].includes(e??"")}
export function isAdmin(e?:string|null){return!shouldChargeCredits(e)}

// Auth helpers
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}
export async function signOut() {
  return supabase.auth.signOut()
}
export async function getSession() {
  return supabase.auth.getSession()
}
export async function getUser() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}
