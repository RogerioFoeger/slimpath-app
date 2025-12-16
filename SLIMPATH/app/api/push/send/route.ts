import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // This should be called from a cron job or scheduled task
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select(`
        *,
        users!inner (
          id,
          full_name,
          current_day
        )
      `)

    if (error) throw error

    const notificationPromises = subscriptions.map(async (sub: any) => {
      const payload = JSON.stringify({
        title: 'SlimPath AI',
        body: `Good morning, ${sub.users.full_name}! Ready for Day ${sub.users.current_day}? 💪`,
        icon: '/icons/icon-192x192.png',
        url: '/dashboard',
      })

      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        )
      } catch (error) {
        console.error('Error sending notification:', error)
        // If subscription is invalid, remove it
        if ((error as any).statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id)
        }
      }
    })

    await Promise.all(notificationPromises)

    return NextResponse.json({
      success: true,
      sent: subscriptions.length,
    })
  } catch (error) {
    console.error('Error sending notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}

