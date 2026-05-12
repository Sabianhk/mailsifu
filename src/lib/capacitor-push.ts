/**
 * Client-side Capacitor push notification registration.
 * No-op on web — only activates inside the native Capacitor shell.
 */

export async function registerPushNotifications() {
  // Dynamic import to avoid bundling Capacitor on web
  const { Capacitor } = await import('@capacitor/core')
  if (!Capacitor.isNativePlatform()) return

  const { PushNotifications } = await import('@capacitor/push-notifications')

  const permission = await PushNotifications.requestPermissions()
  if (permission.receive !== 'granted') {
    console.warn('Push notification permission denied')
    return
  }

  await PushNotifications.register()

  PushNotifications.addListener('registration', async ({ value: token }) => {
    try {
      await fetch('/api/push/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, platform: 'android' }),
      })
    } catch (err) {
      console.error('Failed to register push token:', err)
    }
  })

  PushNotifications.addListener('registrationError', (err) => {
    console.error('Push registration error:', err)
  })

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    const messageId = notification.notification.data?.messageId
    if (messageId) {
      window.location.href = `/app/inbox/${messageId}`
    }
  })
}
