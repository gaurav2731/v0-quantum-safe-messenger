import type { AppNotification } from '@/types/notification';

export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private vapidPublicKey: string;

  private constructor() {
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  }

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Push notification permission denied');
        return;
      }

      // Subscribe to push notifications
      await this.subscribeToPush();
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  private async subscribeToPush(): Promise<void> {
    if (!this.swRegistration) return;

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey) as any
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: localStorage.getItem('userId')
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
    } catch (error) {
      console.error('Failed to send subscription:', error);
    }
  }

  async sendNotification(notification: AppNotification): Promise<void> {
    if (!this.swRegistration) return;

    try {
      await this.swRegistration.showNotification(notification.title, {
        body: notification.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: notification.tag || 'quantumsafe-message',
        requireInteraction: notification.requireInteraction || false,
        silent: notification.silent || false,
        data: notification.data || {},
        actions: notification.actions || []
      } as any);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  async sendMessageNotification(fromUser: string, message: string, chatId: string): Promise<void> {
    const notification: AppNotification = {
      title: `New message from ${fromUser}`,
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      tag: `chat-${chatId}`,
      requireInteraction: true,
      data: { chatId, fromUser, type: 'message' },
      actions: [
        {
          action: 'reply',
          title: 'Reply'
        },
        {
          action: 'view',
          title: 'View Chat'
        }
      ]
    };

    await this.sendNotification(notification);
  }

  async sendSecurityAlert(alert: string, severity: 'low' | 'medium' | 'high' | 'critical'): Promise<void> {
    const notification: AppNotification = {
      title: 'Security Alert',
      body: alert,
      tag: 'security-alert',
      requireInteraction: severity === 'high' || severity === 'critical',
      silent: false,
      data: { type: 'security', severity }
    };

    await this.sendNotification(notification);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async unsubscribe(): Promise<void> {
    if (!this.swRegistration) return;

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.sendUnsubscribeToServer(subscription);
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  }

  private async sendUnsubscribeToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: localStorage.getItem('userId')
        })
      });
    } catch (error) {
      console.error('Failed to send unsubscribe:', error);
    }
  }
}

// Export singleton instance
export const pushNotifications = PushNotificationManager.getInstance();
