// ============================================================================
// UNIVERSAL SUPABASE CLIENT - CRAV PARTNER PORTAL
// ============================================================================

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

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

// TYPES
export interface Partner {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company?: string;
  status: 'pending' | 'approved' | 'rejected';
  commission_rate: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface Deal {
  id: string;
  partner_id: string;
  customer_name: string;
  customer_email: string;
  product: string;
  amount: number;
  commission: number;
  status: 'pending' | 'approved' | 'paid';
  created_at: string;
}

export interface Lead {
  id: string;
  partner_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  partner_id?: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  category: string;
  created_at: string;
}

export interface DashboardStats {
  totalDeals: number;
  totalCommission: number;
  pendingCommission: number;
  conversionRate: number;
}

export interface PartnerApplication {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  website?: string;
  experience?: string;
  message?: string;
  [key: string]: unknown;
}

// PARTNER FUNCTIONS
export async function getPartnerByUserId(userId: string): Promise<Partner | null> {
  const { data, error } = await supabase.from('partners').select('*').eq('user_id', userId).single();
  if (error) { console.error('Error fetching partner:', error); return null; }
  return data;
}

export async function getDealsByPartnerId(partnerId: string): Promise<Deal[]> {
  const { data, error } = await supabase.from('deals').select('*').eq('partner_id', partnerId).order('created_at', { ascending: false });
  if (error) { console.error('Error fetching deals:', error); return []; }
  return data || [];
}

export async function getLeadsByPartnerId(partnerId: string): Promise<Lead[]> {
  const { data, error } = await supabase.from('leads').select('*').eq('partner_id', partnerId).order('created_at', { ascending: false });
  if (error) { console.error('Error fetching leads:', error); return []; }
  return data || [];
}

export async function getDocuments(partnerId?: string): Promise<Document[]> {
  let query = supabase.from('documents').select('*').order('created_at', { ascending: false });
  if (partnerId) {
    query = query.or("partner_id.eq." + partnerId + ",partner_id.is.null");
  }
  const { data, error } = await query;
  if (error) { console.error('Error fetching documents:', error); return []; }
  return data || [];
}

export async function getDashboardStats(partnerId: string): Promise<DashboardStats> {
  const deals = await getDealsByPartnerId(partnerId);
  const totalDeals = deals.length;
  const totalCommission = deals.filter(d => d.status === 'paid').reduce((sum, d) => sum + (d.commission || 0), 0);
  const pendingCommission = deals.filter(d => d.status === 'pending' || d.status === 'approved').reduce((sum, d) => sum + (d.commission || 0), 0);
  const conversionRate = totalDeals > 0 ? (deals.filter(d => d.status !== 'pending').length / totalDeals) * 100 : 0;
  return { totalDeals, totalCommission, pendingCommission, conversionRate: Math.round(conversionRate * 10) / 10 };
}

export async function submitPartnerApplication(application: Record<string, unknown>): Promise<{ data: Partner | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.from('partner_applications').insert(application).select().single();
    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data: data as Partner, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };
