// ============================================================================
// UNIVERSAL SUPABASE CLIENT - CR AUDIOVIZ AI ECOSYSTEM
// Centralized database connection for all apps
// Dependency-free version (only requires @supabase/supabase-js)
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
    // Server-side: return new client each time
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  
  // Client-side: return singleton
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
// AUTH HELPER FUNCTIONS
// ============================================================================

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const client = createSupabaseBrowserClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, metadata?: Record<string, unknown>) {
  const client = createSupabaseBrowserClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const client = createSupabaseBrowserClient();
  const { error } = await client.auth.signOut();
  
  if (error) {
    throw error;
  }
}

/**
 * Get the current authenticated user
 */
export async function getUser(): Promise<User | null> {
  const client = createSupabaseBrowserClient();
  const { data: { user }, error } = await client.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return user;
}

/**
 * Get the current session
 */
export async function getSession() {
  const client = createSupabaseBrowserClient();
  const { data: { session }, error } = await client.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  return session;
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };