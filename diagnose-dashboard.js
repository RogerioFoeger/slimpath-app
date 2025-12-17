// Diagnostic script to check dashboard data issues
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function diagnose() {
  console.log('🔍 Starting Dashboard Diagnostic...\n')

  try {
    // Check if we have any users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, current_day, profile_type, onboarding_completed')
      .limit(5)

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message)
      return
    }

    console.log(`✓ Found ${users?.length || 0} users`)
    if (users && users.length > 0) {
      users.forEach(user => {
        console.log(`  - ${user.email}: Day ${user.current_day}, Profile: ${user.profile_type}, Onboarded: ${user.onboarding_completed}`)
      })
    }
    console.log()

    // Check daily_content
    const { data: dailyContent, error: contentError } = await supabase
      .from('daily_content')
      .select('id, day_number')
      .order('day_number')

    if (contentError) {
      console.error('❌ Error fetching daily_content:', contentError.message)
      return
    }

    console.log(`✓ Found ${dailyContent?.length || 0} daily_content entries`)
    if (dailyContent && dailyContent.length > 0) {
      const days = dailyContent.map(c => c.day_number).join(', ')
      console.log(`  Days available: ${days}`)
    } else {
      console.log('  ⚠️  WARNING: No daily_content found! Run the seed script.')
    }
    console.log()

    // Check profile_content
    const { data: profileContent, error: profileError } = await supabase
      .from('profile_content')
      .select(`
        id,
        profile_type,
        daily_content!inner(day_number)
      `)
      .order('daily_content(day_number)')

    if (profileError) {
      console.error('❌ Error fetching profile_content:', profileError.message)
      return
    }

    console.log(`✓ Found ${profileContent?.length || 0} profile_content entries`)
    if (profileContent && profileContent.length > 0) {
      // Group by day
      const byDay = {}
      profileContent.forEach(pc => {
        const day = pc.daily_content.day_number
        if (!byDay[day]) byDay[day] = []
        byDay[day].push(pc.profile_type)
      })

      Object.keys(byDay).sort((a, b) => parseInt(a) - parseInt(b)).forEach(day => {
        console.log(`  Day ${day}: ${byDay[day].join(', ')}`)
      })
    } else {
      console.log('  ⚠️  WARNING: No profile_content found! Run the seed script.')
    }
    console.log()

    // Check for specific user issues
    if (users && users.length > 0) {
      const testUser = users[0]
      console.log(`\n🧪 Testing dashboard load for user: ${testUser.email}\n`)

      // Check if daily content exists for user's current day
      const { data: userDayContent, error: dayError } = await supabase
        .from('daily_content')
        .select('*')
        .eq('day_number', testUser.current_day)
        .single()

      if (dayError || !userDayContent) {
        console.log(`  ❌ ISSUE: No daily_content for day ${testUser.current_day}`)
      } else {
        console.log(`  ✓ Daily content found for day ${testUser.current_day}`)
      }

      // Check if profile content exists
      if (userDayContent) {
        const { data: userProfileContent, error: profError } = await supabase
          .from('profile_content')
          .select('*')
          .eq('daily_content_id', userDayContent.id)
          .eq('profile_type', testUser.profile_type)
          .single()

        if (profError || !userProfileContent) {
          console.log(`  ❌ ISSUE: No profile_content for day ${testUser.current_day}, profile: ${testUser.profile_type}`)
          console.log('     This is likely causing the "Error loading dashboard" message!')
        } else {
          console.log(`  ✓ Profile content found for ${testUser.profile_type}`)
        }

        // Check tasks
        const { data: tasks, error: tasksError } = await supabase
          .from('daily_tasks')
          .select('*')
          .eq('daily_content_id', userDayContent.id)

        if (tasksError) {
          console.log(`  ❌ ISSUE: Error fetching tasks:`, tasksError.message)
        } else {
          console.log(`  ✓ Found ${tasks?.length || 0} tasks`)
        }
      }
    }

    console.log('\n📊 Diagnosis Complete!\n')
    console.log('Next Steps:')
    console.log('1. If missing daily_content or profile_content, run:')
    console.log('   npx supabase db execute -f supabase/complete_seed.sql')
    console.log('2. Or run it via Supabase Dashboard > SQL Editor')
    console.log('3. Make sure your user\'s current_day has corresponding content\n')

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

diagnose()

