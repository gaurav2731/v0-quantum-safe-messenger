// WebSocket Service for Quantum-Safe Messenger
// Handles real-time messaging and connection management

class WebSocketService {
  constructor() {
    this.connections = new Map(); // deviceId -> WebSocket
    this.userConnections = new Map(); // userId -> Set of deviceIds
    this.chatParticipants = new Map(); // chatId -> Set of userIds
    this.typingIndicators = new Map(); // chatId -> Map of userId -> typing status
    this.pingIntervals = new Map(); // deviceId -> intervalId
  }

  // Register a new WebSocket connection
  registerConnection(deviceId, userId, ws) {
    // Store connection
    this.connections.set(deviceId, ws);
    
    // Track user's devices
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId).add(deviceId);
    
    // Setup ping/pong for connection health
    this.setupPingPong(deviceId, ws);
    
    console.log(`WebSocket registered: User ${userId}, Device ${deviceId}`);
  }

  // Unregister a WebSocket connection
  unregisterConnection(deviceId, userId) {
    // Clean up connection
    this.connections.delete(deviceId);
    
    // Remove from user's devices
    if (this.userConnections.has(userId)) {
      this.userConnections.get(userId).delete(deviceId);
      if (this.userConnections.get(userId).size === 0) {
        this.userConnections.delete(userId);
      }
    }
    
    // Clear ping interval
    if (this.pingIntervals.has(deviceId)) {
      clearInterval(this.pingIntervals.get(deviceId));
      this.pingIntervals.delete(deviceId);
    }
    
    console.log(`WebSocket unregistered: User ${userId}, Device ${deviceId}`);
  }

  // Setup ping/pong mechanism
  setupPingPong(deviceId, ws) {
    const pingInterval = setInterval(() => {
      if (ws.readyState === 1) { // OPEN
        ws.ping();
      } else {
        clearInterval(pingInterval);
        this.pingIntervals.delete(deviceId);
      }
    }, 30000); // Ping every 30 seconds
    
    this.pingIntervals.set(deviceId, pingInterval);
    
    // Handle pong responses
    ws.on('pong', () => {
      // Connection is alive
    });
  }

  // Join a chat room
  joinChat(chatId, userId, deviceId) {
    if (!this.chatParticipants.has(chatId)) {
      this.chatParticipants.set(chatId, new Set());
    }
    this.chatParticipants.get(chatId).add(userId);
    
    console.log(`User ${userId} joined chat ${chatId}`);
  }

  // Leave a chat room
  leaveChat(chatId, userId) {
    if (this.chatParticipants.has(chatId)) {
      this.chatParticipants.get(chatId).delete(userId);
      if (this.chatParticipants.get(chatId).size === 0) {
        this.chatParticipants.delete(chatId);
      }
    }
    
    console.log(`User ${userId} left chat ${chatId}`);
  }

  // Send message to all participants in a chat
  broadcastToChat(chatId, message, excludeUserId = null) {
    if (!this.chatParticipants.has(chatId)) {
      return;
    }
    
    const participants = this.chatParticipants.get(chatId);
    
    participants.forEach(userId => {
      if (userId === excludeUserId) return;
      
      this.sendToUser(userId, message);
    });
  }

  // Send message to a specific user on all their devices
  sendToUser(userId, message) {
    if (!this.userConnections.has(userId)) {
      return;
    }
    
    const deviceIds = this.userConnections.get(userId);
    
    deviceIds.forEach(deviceId => {
      const ws = this.connections.get(deviceId);
      if (ws && ws.readyState === 1) { // OPEN
        try {
          ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Failed to send message to device ${deviceId}:`, error);
        }
      }
    });
  }

  // Send message to a specific device
  sendToDevice(deviceId, message) {
    const ws = this.connections.get(deviceId);
    if (ws && ws.readyState === 1) { // OPEN
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Failed to send message to device ${deviceId}:`, error);
      }
    }
  }

  // Handle typing indicator
  handleTypingIndicator(chatId, userId, isTyping) {
    if (!this.typingIndicators.has(chatId)) {
      this.typingIndicators.set(chatId, new Map());
    }
    
    const chatTyping = this.typingIndicators.get(chatId);
    
    if (isTyping) {
      chatTyping.set(userId, Date.now());
    } else {
      chatTyping.delete(userId);
    }
    
    // Broadcast typing status to chat participants
    this.broadcastToChat(chatId, {
      type: 'typing_indicator',
      chatId,
      userId,
      isTyping
    }, userId);
    
    // Clean up old typing indicators (older than 10 seconds)
    this.cleanupTypingIndicators(chatId);
  }

  // Cleanup old typing indicators
  cleanupTypingIndicators(chatId) {
    if (!this.typingIndicators.has(chatId)) return;
    
    const chatTyping = this.typingIndicators.get(chatId);
    const now = Date.now();
    const timeout = 10000; // 10 seconds
    
    for (const [userId, timestamp] of chatTyping.entries()) {
      if (now - timestamp > timeout) {
        chatTyping.delete(userId);
        // Broadcast that user stopped typing
        this.broadcastToChat(chatId, {
          type: 'typing_indicator',
          chatId,
          userId,
          isTyping: false
        });
      }
    }
  }

  // Get online status for a user
  isUserOnline(userId) {
    return this.userConnections.has(userId) && 
           this.userConnections.get(userId).size > 0;
  }

  // Get all online users in a chat
  getOnlineUsersInChat(chatId) {
    if (!this.chatParticipants.has(chatId)) {
      return [];
    }
    
    const participants = this.chatParticipants.get(chatId);
    const onlineUsers = [];
    
    participants.forEach(userId => {
      if (this.isUserOnline(userId)) {
        onlineUsers.push(userId);
      }
    });
    
    return onlineUsers;
  }

  // Handle connection close
  handleConnectionClose(deviceId, userId) {
    this.unregisterConnection(deviceId, userId);
    
    // Notify chat participants that user went offline
    for (const [chatId, participants] of this.chatParticipants.entries()) {
      if (participants.has(userId)) {
        this.broadcastToChat(chatId, {
          type: 'user_offline',
          userId,
          chatId
        });
      }
    }
  }

  // Handle connection error
  handleConnectionError(deviceId, userId, error) {
    console.error(`WebSocket error for device ${deviceId}:`, error);
    this.handleConnectionClose(deviceId, userId);
  }

  // Get connection statistics
  getStats() {
    return {
      totalConnections: this.connections.size,
      totalUsers: this.userConnections.size,
      activeChats: this.chatParticipants.size,
      connections: Array.from(this.connections.keys()).map(deviceId => ({
        deviceId,
        userId: this.getConnectionUserId(deviceId)
      }))
    };
  }

  // Get user ID for a device
  getConnectionUserId(deviceId) {
    for (const [userId, devices] of this.userConnections.entries()) {
      if (devices.has(deviceId)) {
        return userId;
      }
    }
    return null;
  }

  // Force close all connections for a user (for security)
  disconnectUser(userId) {
    if (!this.userConnections.has(userId)) {
      return;
    }
    
    const deviceIds = this.userConnections.get(userId);
    
    deviceIds.forEach(deviceId => {
      const ws = this.connections.get(deviceId);
      if (ws) {
        ws.close(1000, 'User disconnected by system');
      }
      this.unregisterConnection(deviceId, userId);
    });
  }

  // Broadcast system message to all connected users
  broadcastSystemMessage(message) {
    for (const [deviceId, ws] of this.connections.entries()) {
      if (ws.readyState === 1) { // OPEN
        try {
          ws.send(JSON.stringify({
            type: 'system_message',
            message
          }));
        } catch (error) {
          console.error(`Failed to send system message to device ${deviceId}:`, error);
        }
      }
    }
  }

  // Cleanup disconnected connections
  cleanup() {
    for (const [deviceId, ws] of this.connections.entries()) {
      if (ws.readyState !== 1) { // Not OPEN
        const userId = this.getConnectionUserId(deviceId);
        if (userId) {
          this.unregisterConnection(deviceId, userId);
        }
      }
    }
  }
}

module.exports = new WebSocketService();