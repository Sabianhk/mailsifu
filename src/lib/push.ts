/**
 * Firebase Cloud Messaging push notification sender.
 * Sends push notifications to users' registered devices.
 */
import admin from 'firebase-admin'
import { prisma } from './prisma'

function getFirebaseApp() {
  if (admin.apps.length > 0) return admin.apps[0]!

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY env var is not set')
  }

  return admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
  })
}

export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  const tokens = await prisma.pushDeviceToken.findMany({
    where: { userId },
    select: { token: true },
  })

  if (tokens.length === 0) return

  const app = getFirebaseApp()
  const messaging = admin.messaging(app)

  const response = await messaging.sendEachForMulticast({
    tokens: tokens.map((t) => t.token),
    notification: { title, body },
    data: data ?? {},
    android: {
      priority: 'high',
      notification: {
        channelId: 'otp_alerts',
        sound: 'default',
      },
    },
  })

  // Clean up invalid tokens
  const tokensToRemove: string[] = []
  response.responses.forEach((res, idx) => {
    if (
      res.error &&
      (res.error.code === 'messaging/registration-token-not-registered' ||
        res.error.code === 'messaging/invalid-registration-token')
    ) {
      tokensToRemove.push(tokens[idx].token)
    }
  })

  if (tokensToRemove.length > 0) {
    await prisma.pushDeviceToken.deleteMany({
      where: { token: { in: tokensToRemove } },
    })
  }
}
