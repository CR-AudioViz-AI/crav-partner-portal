// ============================================================================
// UNIVERSAL SUPABASE CLIENT - CRAV PARTNER PORTAL
// Complete auth and data access layer
// ============================================================================

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Centralized Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZW9iZnlmZXJydWtxZW9sb2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTcyNjYsImV4cCI6MjA3NzU1NzI2Nn0.uy-jlF_z6qVb8qogsNyGDLHqT4HhmdRhLrW7zPv3qhY';

// Standard client for general use
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Browser client for auth (SSR-safe singleton pattern)
let browserClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  
  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return browserClient;
}

// Server client for API routes
export function createSupabaseServerClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set, using anon key');
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return createClient(SUPABASE_URL, serviceKey);
}

// ============================================================================
// AUTH FUNCTIONS
// ============================================================================

export async function signIn(email: string, password: string) {
  const client = createSupabaseBrowserClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, metadata?: Record<string, unknown>) {
  const client = createSupabaseBrowserClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = createSupabaseBrowserClient();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function getUser(): Promise<User | null> {
  const client = createSupabaseBrowserClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
}

export async function getSession() {
  const client = createSupabaseBrowserClient();
  const { data: { session }, error } = await client.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
}

// ============================================================================
// PARTNER FUNCTIONS
// ============================================================================

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

export interface DashboardStats {
  totalDeals: number;
  totalCommission: number;
  pendingCommission: number;
  conversionRate: number;
}

export async function getPartnerByUserId(userId: string): Promise<Partner | null> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching partner:', error);
    return null;
  }
  return data;
}

export async function getDealsByPartnerId(partnerId: string): Promise<Deal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching deals:', error);
    return [];
  }
  return data || [];
}

export async function getDashboardStats(partnerId: string): Promise<DashboardStats> {
  const deals = await getDealsByPartnerId(partnerId);
  
  const totalDeals = deals.length;
  const totalCommission = deals
    .filter(d => d.status === 'paid')
    .reduce((sum, d) => sum + (d.commission || 0), 0);
  const pendingCommission = deals
    .filter(d => d.status === 'pending' || d.status === 'approved')
    .reduce((sum, d) => sum + (d.commission || 0), 0);
  const conversionRate = totalDeals > 0 
    ? (deals.filter(d => d.status !== 'pending').length / totalDeals) * 100 
    : 0;
  
  return {
    totalDeals,
    totalCommission,
    pendingCommission,
    conversionRate: Math.round(conversionRate * 10) / 10,
  };
}

export interface PartnerApplication {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  website?: string;
  experience?: string;
  message?: string;
}

export async function submitPartnerApplication(
  userId: string,
  application: PartnerApplication
): Promise<Partner | null> {
  const { data, error } = await supabase
    .from('partners')
    .insert({
      user_id: userId,
      name: application.name,
      email: application.email,
      company: application.company || null,
      status: 'pending',
      commission_rate: 0.10, // Default 10% commission
      metadata: {
        phone: application.phone,
        website: application.website,
        experience: application.experience,
        message: application.message,
      }
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
  return data;
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };