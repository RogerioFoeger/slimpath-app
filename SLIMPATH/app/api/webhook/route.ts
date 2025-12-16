import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const webhookSecret = request.headers.get('x-webhook-secret')
    if (webhookSecret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = await request.json()

    // Extract user data from webhook payload
    const {
      email,
      name,
      profile_type,
      subscription_plan,
      transaction_id,
      amount,
    } = payload

    if (!email || !profile_type || !subscription_plan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate subscription end date
    const endDate = new Date()
    if (subscription_plan === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else if (subscription_plan === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        profile_type,
      },
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create user profile
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      full_name: name,
      profile_type,
      subscription_plan,
      subscription_end_date: endDate.toISOString(),
      status: 'active',
      current_day: 1,
      slim_points: 0,
      bonus_unlocked: false,
      webhook_data: {
        transaction_id,
        amount,
        received_at: new Date().toISOString(),
      },
    })

    if (profileError) {
      console.error('Profile error:', profileError)
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }

    // Create onboarding record
    await supabase.from('user_onboarding').insert({
      user_id: authData.user.id,
      medications: [],
      physical_limitations: [],
      dietary_restrictions: [],
      onboarding_completed: false,
    })

    // Send magic link
    const { error: magicLinkError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
      },
    })

    if (magicLinkError) {
      console.error('Magic link error:', magicLinkError)
    }

    return NextResponse.json({
      success: true,
      user_id: authData.user.id,
      message: 'User created successfully',
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

