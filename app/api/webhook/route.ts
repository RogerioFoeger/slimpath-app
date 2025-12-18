import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const webhookSecret = request.headers.get('x-webhook-secret')
    const expectedSecret = process.env.WEBHOOK_SECRET || process.env.NEXT_PUBLIC_WEBHOOK_SECRET
    
    if (webhookSecret !== expectedSecret) {
      console.error('Webhook secret mismatch')
      console.log('Received:', webhookSecret)
      console.log('Expected:', expectedSecret)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = await request.json()
    console.log('Webhook payload received:', { ...payload, email: payload.email })

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
      console.error('Missing required fields:', { email, profile_type, subscription_plan })
      return NextResponse.json(
        { error: 'Missing required fields', received: { email, profile_type, subscription_plan } },
        { status: 400 }
      )
    }

    // Normalize inputs to match database enums
    const normalizedProfileType = profile_type.toLowerCase()
    const normalizedSubscriptionPlan = subscription_plan.toLowerCase()

    // Calculate subscription end date
    const endDate = new Date()
    if (normalizedSubscriptionPlan === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else if (normalizedSubscriptionPlan === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }

    // Check if user already exists in auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingAuthUser = existingUsers?.users?.find(u => u.email === email)

    let userId: string

    if (existingAuthUser) {
      // User already exists in auth
      console.log(`User ${email} already exists in auth with ID: ${existingAuthUser.id}`)
      userId = existingAuthUser.id
    } else {
      // Create new auth user
      console.log(`Creating new auth user for: ${email}`)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          profile_type: normalizedProfileType,
        },
      })

      if (authError) {
        console.error('Auth error details:', authError)
        return NextResponse.json(
          { error: 'Failed to create auth user', details: authError.message },
          { status: 500 }
        )
      }

      if (!authData?.user) {
        console.error('No user data returned from auth creation')
        return NextResponse.json(
          { error: 'Failed to create auth user - no user data returned' },
          { status: 500 }
        )
      }

      userId = authData.user.id
      console.log(`Created auth user with ID: ${userId}`)
      
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Check if user profile already exists
    console.log(`Checking for existing profile for user ID: ${userId}`)
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (profileCheckError) {
      console.error('Profile check error:', profileCheckError)
    }

    if (existingProfile) {
      // Update existing profile with new subscription data
      console.log(`Updating existing profile for ${email}`)
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: name || existingProfile.full_name,
          profile_type: normalizedProfileType,
          subscription_plan: normalizedSubscriptionPlan,
          subscription_end_date: endDate.toISOString(),
          status: 'active',
          updated_at: new Date().toISOString(),
          webhook_data: {
            transaction_id,
            amount,
            received_at: new Date().toISOString(),
          },
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Profile update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update profile', details: updateError.message },
          { status: 500 }
        )
      }

      console.log(`Successfully updated profile for ${email}`)
    } else {
      // Profile doesn't exist, create it manually (trigger might not have fired)
      console.log(`Creating new profile for ${email}`)
      const { error: profileError } = await supabase.from('users').insert({
        id: userId,
        email,
        full_name: name,
        profile_type: normalizedProfileType,
        subscription_plan: normalizedSubscriptionPlan,
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
        console.error('Profile creation error:', profileError)
        return NextResponse.json(
          { error: 'Failed to create profile', details: profileError.message, code: profileError.code },
          { status: 500 }
        )
      }

      console.log(`Successfully created profile for ${email}`)
    }

    // Create onboarding record (only if doesn't exist)
    const { data: existingOnboarding } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (!existingOnboarding) {
      console.log(`Creating onboarding record for user ID: ${userId}`)
      const { error: onboardingError } = await supabase.from('user_onboarding').insert({
        user_id: userId,
        medications: [],
        physical_limitations: [],
        dietary_restrictions: [],
        onboarding_completed: false,
      })

      if (onboardingError) {
        console.error('Onboarding creation error:', onboardingError)
        // Don't fail the whole request for this
      }
    }

    // Send magic link
    console.log(`Sending magic link to ${email}`)
    const { error: magicLinkError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding`,
      },
    })

    if (magicLinkError) {
      console.error('Magic link error:', magicLinkError)
      // Don't fail the request just because email failed
    }

    console.log(`✅ Webhook completed successfully for ${email}`)
    return NextResponse.json({
      success: true,
      user_id: userId,
      message: existingProfile ? 'User updated successfully' : 'User created successfully',
    })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

