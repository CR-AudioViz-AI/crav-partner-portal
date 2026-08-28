import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { publishableKey, supabaseUrl } from "@craudioviz/platform-sdk";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const SUPABASE_URL = supabaseUrl()
    const supabaseAnonKey = publishableKey()
    const supabase = createClient(SUPABASE_URL, supabaseAnonKey)
    
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard after successful auth
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
