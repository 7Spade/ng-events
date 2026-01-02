/**
 * FCM (Firebase Cloud Messaging) Adapter
 *
 * 🛠️ Backend push notification service
 *
 * ⚠️ Uses firebase-admin (server-side only)
 */

// TODO: Import firebase-admin
// import * as admin from 'firebase-admin';

export class FCMAdapter {
  // TODO: Implement FCM push notifications
  async sendNotification(token: string, payload: any): Promise<void> {
    console.log('FCMAdapter.sendNotification:', token, payload);
  }
}

// END OF FILE
