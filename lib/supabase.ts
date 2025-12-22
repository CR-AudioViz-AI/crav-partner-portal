// ============================================================================
// UNIVERSAL SUPABASE CLIENT - CRAV PARTNER PORTAL
// All functions return { data, error } format to match page expectations
// ============================================================================

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { PartnerApplication, Partner as TypesPartner, Deal as TypesDeal, Lead as TypesLead, Document as TypesDocument } from '@/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZW9iZnlmZXJydWtxZW9sb2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTcyNjYsImV4cCI6MjA3NzU1NzI2Nn0.uy-jlF_z6qVb8qogsNyGDLHqT4HhmdRhLrW7zPv3qhY';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let browserClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }
  return browserClient;
}

export function createSupabaseServerClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set, using anon key');
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return createClient(SUPABASE_URL, serviceKey);
}

// AUTH FUNCTIONS
export async function signIn(email: string, password: string) {
  const client = createSupabaseBrowserClient();
  return client.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, metadataOrName?: string | Record<string, unknown>) {
  const client = createSupabaseBrowserClient();
  let metadata: Record<string, unknown> | undefined;
  if (typeof metadataOrName === 'string') {
    metadata = { full_name: metadataOrName };
  } else {
    metadata = metadataOrName;
  }
  return client.auth.signUp({ email, password, options: { data: metadata } });
}

export async function signOut() {
  const client = createSupabaseBrowserClient();
  return client.auth.signOut();
}

export async function getUser(): Promise<{ user: User | null }> {
  const client = createSupabaseBrowserClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error) { console.error('Error getting user:', error); }
  return { user: user || null };
}

export async function getSession() {
  const client = createSupabaseBrowserClient();
  const { data: { session }, error } = await client.auth.getSession();
  if (error) { console.error('Error getting session:', error); return null; }
  return session;
}

// Re-export types for backward compatibility
export type Partner = TypesPartner;
export type Deal = TypesDeal;
export type Lead = TypesLead;
export type Document = TypesDocument;

export interface DashboardStats {
  totalDeals: number;
  totalCommission: number;
  pendingCommission: number;
  conversionRate: number;
}

// ALL PARTNER FUNCTIONS RETURN { data, error } FORMAT
export async function getPartnerByUserId(userId: string): Promise<{ data: TypesPartner | null; error: Error | null }> {
  const { data, error } = await supabase.from('partners').select('*').eq('user_id', userId).single();
  if (error) {
    console.error('Error fetching partner:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

export async function getDealsByPartnerId(partnerId: string): Promise<{ data: TypesDeal[]; error: Error | null }> {
  const { data, error } = await supabase.from('deals').select('*').eq('partner_id', partnerId).order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching deals:', error);
    return { data: [], error: new Error(error.message) };
  }
  return { data: data || [], error: null };
}

export async function getLeadsByPartnerId(partnerId: string): Promise<{ data: TypesLead[]; error: Error | null }> {
  const { data, error } = await supabase.from('leads').select('*').eq('partner_id', partnerId).order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching leads:', error);
    return { data: [], error: new Error(error.message) };
  }
  return { data: data || [], error: null };
}

export async function getDocuments(tierOrPartnerId?: string): Promise<{ data: TypesDocument[]; error: Error | null }> {
  let query = supabase.from('documents').select('*').order('created_at', { ascending: false });
  // If tier is passed, filter by access level, otherwise assume it is partnerId for backward compat
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching documents:', error);
    return { data: [], error: new Error(error.message) };
  }
  return { data: data || [], error: null };
}

export async function getDashboardStats(partnerId: string): Promise<DashboardStats> {
  const { data: deals } = await getDealsByPartnerId(partnerId);
  const totalDeals = deals.length;
  const totalCommission = deals.filter(d => d.payment_status === 'paid').reduce((sum, d) => sum + (d.commission_amount || 0), 0);
  const pendingCommission = deals.filter(d => d.payment_status === 'pending').reduce((sum, d) => sum + (d.commission_amount || 0), 0);
  const conversionRate = totalDeals > 0 ? (deals.filter(d => d.status === 'completed').length / totalDeals) * 100 : 0;
  return { totalDeals, totalCommission, pendingCommission, conversionRate: Math.round(conversionRate * 10) / 10 };
}

export async function submitPartnerApplication(application: Record<string, unknown>): Promise<{ data: PartnerApplication | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.from('partner_applications').insert(application).select().single();
    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data: data as PartnerApplication, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };
