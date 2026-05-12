'use client'

import { useEffect } from 'react'

export function PushNotificationProvider() {
  useEffect(() => {
    import('@/lib/capacitor-push')
      .then((mod) => mod.registerPushNotifications())
      .catch(() => {
        // Expected to fail on web — Capacitor not available
      })
  }, [])

  return null
}
