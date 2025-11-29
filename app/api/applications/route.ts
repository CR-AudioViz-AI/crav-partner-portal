import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
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
