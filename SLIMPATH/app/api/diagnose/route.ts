import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const results: string[] = []
  
  try {
    results.push('🔍 Starting Dashboard Diagnostic...\n')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: '❌ Missing Supabase environment variables',
        details: 'Check .env.local file'
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if we have any users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, current_day, profile_type')
      .limit(5)

    if (usersError) {
      results.push(`❌ Error fetching users: ${usersError.message}`)
      return NextResponse.json({ results: results.join('\n') })
    }

    results.push(`✓ Found ${users?.length || 0} users`)
    if (users && users.length > 0) {
      for (const user of users) {
        // Get onboarding status from user_onboarding table
        const { data: onboarding } = await supabase
          .from('user_onboarding')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single()
        
        results.push(`  - ${user.email}: Day ${user.current_day}, Profile: ${user.profile_type || 'null'}, Onboarded: ${onboarding?.onboarding_completed || false}`)
      }
    }
    results.push('')

    // Check daily_content
    const { data: dailyContent, error: contentError } = await supabase
      .from('daily_content')
      .select('id, day_number')
      .order('day_number')

    if (contentError) {
      results.push(`❌ Error fetching daily_content: ${contentError.message}`)
      return NextResponse.json({ results: results.join('\n') })
    }

    results.push(`✓ Found ${dailyContent?.length || 0} daily_content entries`)
    if (dailyContent && dailyContent.length > 0) {
      const days = dailyContent.map(c => c.day_number).join(', ')
      results.push(`  Days available: ${days}`)
    } else {
      results.push('  ⚠️  WARNING: No daily_content found! Database needs seeding.')
    }
    results.push('')

    // Check profile_content
    const { data: profileContent, error: profileError } = await supabase
      .from('profile_content')
      .select('id, profile_type, daily_content_id')

    if (profileError) {
      results.push(`❌ Error fetching profile_content: ${profileError.message}`)
      return NextResponse.json({ results: results.join('\n') })
    }

    results.push(`✓ Found ${profileContent?.length || 0} profile_content entries`)
    if (profileContent && profileContent.length > 0) {
      // Count by profile type
      const byType: Record<string, number> = {}
      profileContent.forEach(pc => {
        byType[pc.profile_type] = (byType[pc.profile_type] || 0) + 1
      })
      Object.keys(byType).forEach(type => {
        results.push(`  ${type}: ${byType[type]} entries`)
      })
    } else {
      results.push('  ⚠️  WARNING: No profile_content found! Database needs seeding.')
    }
    results.push('')

    // Check for specific user issues
    if (users && users.length > 0) {
      const testUser = users[0]
      results.push(`\n🧪 Testing dashboard load for user: ${testUser.email}\n`)

      // Check if daily content exists for user's current day
      const { data: userDayContent, error: dayError } = await supabase
        .from('daily_content')
        .select('*')
        .eq('day_number', testUser.current_day)
        .maybeSingle()

      if (dayError) {
        results.push(`  ❌ Error fetching daily_content: ${dayError.message}`)
      } else if (!userDayContent) {
        results.push(`  ❌ ISSUE: No daily_content for day ${testUser.current_day}`)
        results.push('     👉 THIS IS CAUSING THE ERROR!')
      } else {
        results.push(`  ✓ Daily content found for day ${testUser.current_day}`)

        // Check if profile content exists
        const { data: userProfileContent, error: profError } = await supabase
          .from('profile_content')
          .select('*')
          .eq('daily_content_id', userDayContent.id)
          .eq('profile_type', testUser.profile_type)
          .maybeSingle()

        if (profError) {
          results.push(`  ❌ Error fetching profile_content: ${profError.message}`)
        } else if (!userProfileContent) {
          results.push(`  ❌ ISSUE: No profile_content for day ${testUser.current_day}, profile: ${testUser.profile_type}`)
          results.push('     👉 THIS IS CAUSING THE "Error loading dashboard" MESSAGE!')
        } else {
          results.push(`  ✓ Profile content found for ${testUser.profile_type}`)
        }

        // Check tasks
        const { data: tasks, error: tasksError } = await supabase
          .from('daily_tasks')
          .select('*')
          .eq('daily_content_id', userDayContent.id)

        if (tasksError) {
          results.push(`  ❌ Error fetching tasks: ${tasksError.message}`)
        } else {
          results.push(`  ✓ Found ${tasks?.length || 0} tasks`)
        }
      }
    }

    results.push('\n📊 Diagnosis Complete!\n')
    results.push('🔧 Next Steps:')
    results.push('1. Run the complete_seed.sql file in Supabase Dashboard')
    results.push('2. Go to Supabase Dashboard > SQL Editor')
    results.push('3. Paste contents of supabase/complete_seed.sql')
    results.push('4. Click "Run" to populate missing data')

    return NextResponse.json({
      results: results.join('\n'),
      raw: {
        users,
        dailyContent,
        profileContent
      }
    })

  } catch (error: any) {
    results.push(`💥 Unexpected error: ${error.message}`)
    return NextResponse.json({ results: results.join('\n'), error: error.message }, { status: 500 })
  }
}

