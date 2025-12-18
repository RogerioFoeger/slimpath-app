'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { base64ToUint8Array } from '@/lib/utils'

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
      setIsSubscribed(sub !== null)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const subscribeToPush = async (userId: string) => {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ) as BufferSource,
      })

      // Save subscription to database
      const subscriptionData = sub.toJSON()
      await supabase.from('push_subscriptions').insert({
        user_id: userId,
        endpoint: subscriptionData.endpoint!,
        p256dh: subscriptionData.keys!.p256dh,
        auth: subscriptionData.keys!.auth,
      })

      setSubscription(sub)
      setIsSubscribed(true)
      return sub
    } catch (error) {
      console.error('Error subscribing to push:', error)
      throw error
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe()
        
        // Remove from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint)

        setSubscription(null)
        setIsSubscribed(false)
      }
    } catch (error) {
      console.error('Error unsubscribing from push:', error)
      throw error
    }
  }

  return {
    isSupported,
    isSubscribed,
    subscription,
    subscribeToPush,
    unsubscribeFromPush,
  }
}

