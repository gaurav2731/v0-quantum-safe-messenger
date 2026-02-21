// Push Notification Service for Quantum-Safe Messenger
// Implements Web Push API for cross-platform notifications

const webpush = require('web-push');
require('dotenv').config();

class PushNotificationService {
  constructor() {
    // VAPID keys for Web Push
    this.vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY || webpush.generateVAPIDKeys().publicKey,
      privateKey: process.env.VAPID_PRIVATE_KEY || webpush.generateVAPIDKeys().privateKey
    };

    // Configure web-push with VAPID keys
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL || 'mailto:admin@example.com',
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey
    );

    // In-memory storage for subscriptions (in production, use database)
    this.subscriptions = new Map(); // userId -> [subscription objects]
  }

  // Subscribe a user's device for push notifications
  async subscribeUser(userId, subscription) {
    try {
      if (!this.subscriptions.has(userId)) {
        this.subscriptions.set(userId, []);
      }

      // Check if subscription already exists
      const existingIndex = this.subscriptions.get(userId).findIndex(sub =>
        sub.endpoint === subscription.endpoint
      );

      if (existingIndex === -1) {
        // Add new subscription
        this.subscriptions.get(userId).push(subscription);
      } else {
        // Update existing subscription
        this.subscriptions.get(userId)[existingIndex] = subscription;
      }

      return {
        success: true,
        message: 'Successfully subscribed to notifications'
      };
    } catch (error) {
      console.error('Subscription error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Unsubscribe a user's device
  async unsubscribeUser(userId, endpoint) {
    try {
      if (!this.subscriptions.has(userId)) {
        return {
          success: true,
          message: 'No subscriptions found for user'
        };
      }

      const userSubscriptions = this.subscriptions.get(userId);
      const filteredSubscriptions = userSubscriptions.filter(
        sub => sub.endpoint !== endpoint
      );

      this.subscriptions.set(userId, filteredSubscriptions);

      return {
        success: true,
        message: 'Successfully unsubscribed from notifications'
      };
    } catch (error) {
      console.error('Unsubscription error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send push notification to a specific user
  async sendNotificationToUser(userId, payload, options = {}) {
    try {
      if (!this.subscriptions.has(userId)) {
        return {
          success: false,
          error: 'No subscriptions found for user'
        };
      }

      const userSubscriptions = this.subscriptions.get(userId);
      const results = [];

      for (const subscription of userSubscriptions) {
        try {
          const result = await webpush.sendNotification(
            subscription,
            JSON.stringify(payload),
            options
          );
          results.push({
            endpoint: subscription.endpoint,
            success: true,
            result: result
          });
        } catch (error) {
          // Remove invalid subscription
          await this.unsubscribeUser(userId, subscription.endpoint);
          results.push({
            endpoint: subscription.endpoint,
            success: false,
            error: error.message
          });
        }
      }

      return {
        success: results.some(r => r.success),
        results: results
      };
    } catch (error) {
      console.error('Send notification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send push notification to multiple users
  async sendNotificationToMultipleUsers(userIds, payload, options = {}) {
    const results = {};

    for (const userId of userIds) {
      results[userId] = await this.sendNotificationToUser(userId, payload, options);
    }

    return results;
  }

  // Send notification to all subscribers of a chat
  async sendChatNotification(chatId, userIds, payload, options = {}) {
    try {
      // Send to all users in the chat except the sender
      const results = {};
      
      for (const userId of userIds) {
        results[userId] = await this.sendNotificationToUser(userId, {
          ...payload,
          chatId
        }, options);
      }

      return {
        success: Object.values(results).some(r => r.success),
        results: results
      };
    } catch (error) {
      console.error('Chat notification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send message notification
  async sendNewMessageNotification(userId, messageData) {
    const payload = {
      title: `New message from ${messageData.senderName}`,
      body: messageData.content.substring(0, 50) + (messageData.content.length > 50 ? '...' : ''),
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'new_message',
        chatId: messageData.chatId,
        messageId: messageData.id,
        senderId: messageData.senderId,
        timestamp: messageData.timestamp
      }
    };

    return await this.sendNotificationToUser(userId, payload);
  }

  // Send message reaction notification
  async sendReactionNotification(userId, reactionData) {
    const payload = {
      title: `${reactionData.userName} reacted to your message`,
      body: `Reaction: ${reactionData.reactionType}`,
      icon: '/icon-192x192.png',
      data: {
        type: 'reaction',
        messageId: reactionData.messageId,
        reactionType: reactionData.reactionType,
        reactorId: reactionData.userId,
        timestamp: Date.now()
      }
    };

    return await this.sendNotificationToUser(userId, payload);
  }

  // Send reply notification
  async sendReplyNotification(userId, replyData) {
    const payload = {
      title: `Reply from ${replyData.senderName}`,
      body: replyData.content.substring(0, 50) + (replyData.content.length > 50 ? '...' : ''),
      icon: '/icon-192x192.png',
      data: {
        type: 'reply',
        originalMessageId: replyData.originalMessageId,
        replyMessageId: replyData.id,
        chatId: replyData.chatId,
        timestamp: replyData.timestamp
      }
    };

    return await this.sendNotificationToUser(userId, payload);
  }

  // Send user online notification
  async sendUserOnlineNotification(userId, onlineUserData) {
    const payload = {
      title: `${onlineUserData.username} is now online`,
      body: 'Tap to view chat',
      icon: '/icon-192x192.png',
      data: {
        type: 'user_online',
        userId: onlineUserData.id,
        username: onlineUserData.username,
        timestamp: Date.now()
      }
    };

    return await this.sendNotificationToUser(userId, payload);
  }

  // Send user offline notification
  async sendUserOfflineNotification(userId, offlineUserData) {
    const payload = {
      title: `${offlineUserData.username} went offline`,
      body: '',
      icon: '/icon-192x192.png',
      data: {
        type: 'user_offline',
        userId: offlineUserData.id,
        username: offlineUserData.username,
        timestamp: Date.now()
      }
    };

    return await this.sendNotificationToUser(userId, payload);
  }

  // Get user's subscriptions
  getUserSubscriptions(userId) {
    return this.subscriptions.get(userId) || [];
  }

  // Get all subscriptions count
  getTotalSubscriptions() {
    let count = 0;
    for (const subs of this.subscriptions.values()) {
      count += subs.length;
    }
    return count;
  }

  // Get VAPID public key
  getPublicKey() {
    return this.vapidKeys.publicKey;
  }

  // Validate subscription
  async validateSubscription(subscription) {
    try {
      // Try to send a test notification
      await webpush.sendNotification(
        subscription,
        JSON.stringify({ type: 'validation' }),
        { TTL: 1 }
      );
      return true;
    } catch (error) {
      // Subscription is invalid
      return false;
    }
  }

  // Clean invalid subscriptions
  async cleanInvalidSubscriptions() {
    for (const [userId, subscriptions] of this.subscriptions.entries()) {
      const validSubscriptions = [];
      
      for (const subscription of subscriptions) {
        const isValid = await this.validateSubscription(subscription);
        if (isValid) {
          validSubscriptions.push(subscription);
        } else {
          console.log(`Removing invalid subscription for user ${userId}`);
        }
      }
      
      this.subscriptions.set(userId, validSubscriptions);
    }
  }

  // Send emergency notification to all users
  async sendEmergencyNotification(message) {
    const payload = {
      title: 'Emergency Notification',
      body: message,
      icon: '/icon-192x192.png',
      requireInteraction: true,
      data: {
        type: 'emergency',
        timestamp: Date.now()
      }
    };

    const results = {};
    for (const userId of this.subscriptions.keys()) {
      results[userId] = await this.sendNotificationToUser(userId, payload);
    }

    return results;
  }

  // Schedule notification (basic implementation)
  scheduleNotification(userId, payload, delayMs) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await this.sendNotificationToUser(userId, payload);
        resolve(result);
      }, delayMs);
    });
  }
}

module.exports = new PushNotificationService();