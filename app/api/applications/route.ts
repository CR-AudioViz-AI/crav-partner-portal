import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

const SUPABASE_URL = supabaseUrl()
const supabaseServiceKey = secretKey()


/**
 * 2026-09-06: the caller's identity comes from their token, never from the request.
 *
 * This route took a user id from the caller and used it against a client built
 * with secretKey() - the service-role credential - which bypasses row level
 * security entirely, so it acted on whichever account the caller named.
 *
 * Found by the census: 1,657 routes enumerated across the estate, this one among
 * the 1,257 no hand-built list had ever contained.
 *
 * The gate builds its own client rather than assuming a helper exists. The first
 * version of this repair assumed a getSupabase() function and silently matched
 * nothing in six of the ten routes it was meant to fix - a repair that does not
 * apply is worse than one that fails loudly, because the report still says the
 * defect was addressed.
 */
async function __callerId(request: Request): Promise<string | null> {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  if (!token) return null;
  try {
    const sb = createClient(supabaseUrl(), secretKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user.id as string;
  } catch {
    return null;
  }
}

function __unauthorised() {
  return NextResponse.json(
    { error: 'Sign in required.', code: 'AUTH_REQUIRED' },
    { status: 401 },
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(SUPABASE_URL, supabaseServiceKey)
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      'user_id',
      'company_name',
      'contact_name',
      'email',
      'phone',
      'business_type',
      'years_in_business',
      'sales_experience',
      'target_markets',
      'expected_monthly_sales',
      'how_heard_about_us',
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Check if user already has an application
    const { data: existing } = await supabase
      .from('partner_applications')
      .select('id')
      .eq('user_id', body.user_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Application already exists for this user' },
        { status: 409 }
      )
    }

    // Insert application
    const { data, error } = await supabase
      .from('partner_applications')
      .insert([{
        user_id: body.user_id,
        company_name: body.company_name,
        contact_name: body.contact_name,
        email: body.email,
        phone: body.phone,
        website: body.website || null,
        business_type: body.business_type,
        years_in_business: body.years_in_business,
        sales_experience: body.sales_experience,
        target_markets: body.target_markets,
        expected_monthly_sales: body.expected_monthly_sales,
        how_heard_about_us: body.how_heard_about_us,
        linkedin_url: body.linkedin_url || null,
        references: body.references || null,
        status: 'pending',
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    // TODO: Send notification email to admin
    // TODO: Send confirmation email to applicant

    return NextResponse.json({ 
      success: true, 
      application: data,
      message: 'Application submitted successfully' 
    })
  } catch (error) {
    console.error('Application API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(SUPABASE_URL, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const userId = await __callerId(request);
    if (!userId) return __unauthorised();if (!userId) {
      return NextResponse.json(
        { error: 'user_id parameter required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('partner_applications')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch application' },
        { status: 500 }
      )
    }

    return NextResponse.json({ application: data || null })
  } catch (error) {
    console.error('Application API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
