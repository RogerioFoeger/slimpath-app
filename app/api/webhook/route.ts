import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin client for user management
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

// Anon client for sending emails (signInWithOtp works better with anon key)
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let payload: any = null
  
  try {
    console.log('🔔 Webhook received at:', new Date().toISOString())
    console.log('📍 Request URL:', request.url)
    console.log('📍 Request headers:', {
      host: request.headers.get('host'),
      'content-type': request.headers.get('content-type'),
      'x-webhook-secret': request.headers.get('x-webhook-secret') ? '***present***' : 'missing',
    })

    // Read payload first (needed for CartPanda which doesn't support custom headers)
    try {
      payload = await request.json()
      console.log('📦 Payload received:', {
        email: payload.email,
        name: payload.name,
        profile_type: payload.profile_type,
        subscription_plan: payload.subscription_plan,
        has_webhook_secret: !!payload.webhook_secret,
        has_secret: !!payload.secret,
        has_auth_token: !!payload.auth_token,
      })
    } catch (parseError: any) {
      console.error('❌ Failed to parse JSON payload:', parseError.message)
      return NextResponse.json(
        { error: 'Invalid JSON payload', details: parseError.message },
        { status: 400 }
      )
    }

    // Verify webhook secret - check body first (for CartPanda), then header (for backward compatibility)
    const webhookSecret = 
      payload.webhook_secret || 
      payload.secret || 
      payload.auth_token ||
      request.headers.get('x-webhook-secret')
    const expectedSecret = process.env.WEBHOOK_SECRET || process.env.NEXT_PUBLIC_WEBHOOK_SECRET
    
    console.log('🔐 Secret check:', {
      received_from_body: !!(payload.webhook_secret || payload.secret || payload.auth_token),
      received_from_header: !!request.headers.get('x-webhook-secret'),
      expected_secret_set: !!expectedSecret,
    })
    
    if (webhookSecret !== expectedSecret) {
      console.error('❌ Webhook secret mismatch')
      console.error('Received:', webhookSecret ? webhookSecret.substring(0, 5) + '***' : 'null/undefined')
      console.error('Expected:', expectedSecret ? expectedSecret.substring(0, 5) + '***' : 'null/undefined')
      console.error('⚠️ Check that webhook_secret in payload matches WEBHOOK_SECRET in environment')
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Webhook secret mismatch. Check that webhook_secret in payload matches your WEBHOOK_SECRET environment variable.'
        },
        { status: 401 }
      )
    }
    
    console.log('✅ Webhook secret verified')

    // Get the current URL - prioritize environment variable, then detect from request, then use production domain
    // This ensures magic links always redirect to the correct domain, not localhost
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL
    
    // If not set, try to detect from request headers (for preview deployments)
    if (!baseUrl) {
      const host = request.headers.get('host')
      if (host && !host.includes('localhost')) {
        const protocol = request.headers.get('x-forwarded-proto') || 'https'
        baseUrl = `${protocol}://${host}`
      }
    }
    
    // Final fallback to production domain (never use localhost)
    if (!baseUrl) {
      baseUrl = 'https://slimpathai.com'
    }
    
    console.log(`Using base URL for redirects: ${baseUrl}`)

    // Extract user data from webhook payload (exclude secret fields)
    const {
      email,
      password,
      name,
      profile_type,
      subscription_plan,
      transaction_id,
      amount,
      // Exclude secret fields from user data
      webhook_secret,
      secret,
      auth_token,
    } = payload

    if (!email || !profile_type || !subscription_plan) {
      console.error('❌ Missing required fields:', { 
        email: email || 'MISSING', 
        profile_type: profile_type || 'MISSING', 
        subscription_plan: subscription_plan || 'MISSING' 
      })
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          received: { email, profile_type, subscription_plan },
          required: ['email', 'profile_type', 'subscription_plan']
        },
        { status: 400 }
      )
    }
    
    console.log('✅ Required fields present')

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
      
      // If password is provided, update the user's password
      // This allows test users to sign up again with a new/same password
      if (password) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingAuthUser.id,
          { password }
        )
        if (updateError) {
          console.error('Failed to update password:', updateError)
        } else {
          console.log(`Updated password for user: ${email}`)
        }
      }
    } else {
      // Create new auth user
      console.log(`Creating new auth user for: ${email}`)
      
      // Use provided password if available, otherwise set default for test users
      const isTestUser = amount === 0 || amount === '0'
      const userPassword = password || (isTestUser ? 'TestUser123!' : undefined)
      
      // For test users, don't auto-confirm email so magic link can confirm it
      // For paid users, auto-confirm since they've already paid
      const shouldAutoConfirm = !isTestUser
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: shouldAutoConfirm,
        password: userPassword,
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
      console.log(`Created auth user with ID: ${userId}${userPassword ? ' (with password)' : ' (magic link only)'}`)
      
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

    // Send magic link email
    const redirectUrl = `${baseUrl}/onboarding`
    console.log(`Sending magic link email to ${email} with redirect to ${redirectUrl}`)
    
    // Determine if user is confirmed (paid users are auto-confirmed, test users are not)
    const isTestUser = amount === 0 || amount === '0'
    const isUserConfirmed = !isTestUser
    
    try {
      if (isUserConfirmed) {
        // For confirmed users, use generateLink to create a magic link
        // Then send it via signInWithOtp
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email,
          options: {
            redirectTo: redirectUrl,
          },
        })

        if (linkError) {
          console.error('Error generating magic link for confirmed user:', linkError)
          throw linkError
        }

        // Send the magic link email using anon client (better for email sending)
        const { data: otpData, error: otpError } = await supabaseAnon.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectUrl,
            shouldCreateUser: false,
          },
        })

        if (otpError) {
          console.error('Error sending magic link email to confirmed user:', otpError)
          throw otpError
        }

        console.log('✅ Magic link email sent successfully to confirmed user')
      } else {
        // For unconfirmed users (test users), signInWithOtp will send confirmation email
        // Use anon client for better email delivery
        const { data: otpData, error: otpError } = await supabaseAnon.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectUrl,
            shouldCreateUser: false,
          },
        })

        if (otpError) {
          console.error('Error sending magic link email to unconfirmed user:', otpError)
          console.error('Full error object:', JSON.stringify(otpError, null, 2))
          throw otpError
        }

        console.log('✅ Magic link confirmation email sent successfully to unconfirmed user')
      }
    } catch (error: any) {
      console.error('❌ Failed to send magic link email:', error)
      console.error('Error type:', error?.constructor?.name)
      console.error('Error message:', error?.message)
      console.error('Error status:', error?.status)
      console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      
      // Log a clear warning
      console.error('⚠️ WARNING: User account created successfully, but email notification failed!')
      console.error('⚠️ User can still log in with email/password, but did not receive magic link email.')
      console.error('⚠️ Please check:')
      console.error('   1. Supabase email settings are configured')
      console.error('   2. Email templates are set up in Supabase dashboard')
      console.error('   3. SMTP settings are correct (if using custom SMTP)')
      console.error('   4. Rate limits are not exceeded')
    }

    const duration = Date.now() - startTime
    console.log(`✅ Webhook completed successfully for ${email} in ${duration}ms`)
    console.log(`📊 Summary:`, {
      user_id: userId,
      action: existingProfile ? 'updated' : 'created',
      email_sent: 'check logs above',
    })
    
    return NextResponse.json({
      success: true,
      user_id: userId,
      message: existingProfile ? 'User updated successfully' : 'User created successfully',
      duration_ms: duration,
    })
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error('❌ Webhook error after', duration, 'ms:', error)
    console.error('Error stack:', error?.stack)
    console.error('Error name:', error?.name)
    console.error('Error message:', error?.message)
    
    // Log payload info for debugging (without sensitive data)
    if (payload) {
      console.error('Payload that caused error:', {
        email: payload.email,
        has_profile_type: !!payload.profile_type,
        has_subscription_plan: !!payload.subscription_plan,
      })
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error?.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

