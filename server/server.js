// Quantum-Safe Messenger Backend Server
// Production-Ready with Database, Authentication & Security

const http = require('http');
const { WebSocketServer } = require('ws');
const crypto = require('crypto');

// Database and Services
const dbService = require('./services/dbService');
const authService = require('./services/authService');

class QuantumSafeServer {
  constructor() {
    this.server = http.createServer(this.handleRequest.bind(this));
    this.wss = new WebSocketServer({ server: this.server });
    this.connectedDevices = new Map(); // deviceId -> { ws, userId, deviceId }
    this.messageQueue = new Map();
    this.securityAlerts = [];
    this.messageHistory = new Map(); // chatId -> messages[]
    this.activeChats = new Map(); // chatId -> Set of userIds
    this.onlineUsers = new Map(); // userId -> Set of deviceIds

    this.initializeServer();
  }

  async initializeServer() {
    console.log('📡 Starting QuantumSafe Server...');
    // WebSocket initialization is immediate since we use PG pool
    this.setupWebSocket();
  }

  handleRequest(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Health check endpoint
    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        connectedDevices: this.connectedDevices.size
      }));
      return;
    }

    // API endpoints
    if (req.url.startsWith('/api/')) {
      this.handleAPI(req, res);
      return;
    }

    // Default response
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  async handleAPI(req, res) {
    // Registration endpoint
    if (req.url === '/api/auth/register' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);

          // Validate required fields
          if (!data.username || !data.email || !data.password || !data.deviceId || !data.publicKey) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'All fields are required: username, email, password, deviceId, publicKey' }));
            return;
          }

          if (data.username.length < 3) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Username must be at least 3 characters long' }));
            return;
          }

          if (data.password.length < 6) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Password must be at least 6 characters long' }));
            return;
          }

          console.log('Registration attempt:', data.username);

          // Register user with auth service
          const result = await authService.register(data);

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Registration successful',
            userId: result.user.id,
            user: result.user,
            token: result.token,
            refreshToken: result.refreshToken
          }));
        } catch (error) {
          console.error('Registration error:', error.message);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    // Login endpoint
    if (req.url === '/api/auth/login' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);

          // Validate required fields
          if (!data.email || !data.password || !data.deviceId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Email, password, and deviceId are required' }));
            return;
          }

          console.log('Login attempt:', data.email);

          // Login user with auth service
          const result = await authService.login(data);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Login successful',
            user: result.user,
            token: result.token,
            refreshToken: result.refreshToken
          }));
        } catch (error) {
          console.error('Login error:', error.message);
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    // Refresh token endpoint
    if (req.url === '/api/auth/refresh' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);

          if (!data.refreshToken) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Refresh token is required' }));
            return;
          }

          const result = await authService.refreshToken(data.refreshToken);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            token: result.token,
            refreshToken: result.refreshToken
          }));
        } catch (error) {
          console.error('Token refresh error:', error.message);
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    // ML Security Analysis endpoint
    if (req.url === '/api/security/analyze' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const analysis = this.analyzeMessage(data.message, data.sender, data.recipient);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(analysis));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid request format' }));
        }
      });
      return;
    }

    // Security alerts endpoint
    if (req.url === '/api/security/alerts' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(this.getSecurityAlerts()));
      return;
    }

    // User Search endpoint
    if (req.url.startsWith('/api/users/search') && req.method === 'GET') {
      try {
        const authHeader = req.headers['authorization'];
        const url = new URL(req.url, `http://${req.headers.host}`);
        const queryStr = url.searchParams.get('q');

        if (!queryStr || queryStr.length < 2) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Search query must be at least 2 characters' }));
          return;
        }

        let userId = 'me'; // Default or anonymous search
        if (authHeader) {
          const token = authHeader.split(' ')[1];
          const decoded = await authService.verifyToken(token);
          userId = decoded.userId;
        }

        const results = await dbService.searchUsers(queryStr, userId);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
      } catch (error) {
        console.error('User search error:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
      return;
    }

    // Get Contacts endpoint
    if (req.url === '/api/contacts' && req.method === 'GET') {
      try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Authorization required' }));
          return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = await authService.verifyToken(token);

        const results = await dbService.getContacts(decoded.userId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
      } catch (error) {
        console.error('Get contacts error:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
      return;
    }

    // Add Contact endpoint
    if (req.url === '/api/contacts/add' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const authHeader = req.headers['authorization'];
          if (!authHeader) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Authorization required' }));
            return;
          }

          const token = authHeader.split(' ')[1];
          const decoded = await authService.verifyToken(token);
          const data = JSON.parse(body);

          await dbService.addContact(decoded.userId, data.contactId);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Contact added successfully' }));
        } catch (error) {
          console.error('Add contact error:', error.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log('WebSocket client connected');
      let deviceInfo = null;

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          console.log('Received message:', data.type);

          switch (data.type) {
            case 'authenticate':
              this.handleAuthentication(ws, data).then((authResult) => {
                if (authResult.success) {
                  deviceInfo = {
                    ws,
                    userId: authResult.userId,
                    deviceId: authResult.deviceId,
                    username: authResult.username,
                    publicKey: authResult.publicKey
                  };
                  this.connectedDevices.set(authResult.deviceId, deviceInfo);
                }
              }).catch((error) => {
                console.error('WebSocket authentication failed:', error.message);
                ws.send(JSON.stringify({
                  type: 'authentication_failed',
                  error: error.message,
                  timestamp: Date.now()
                }));
                ws.close();
              });
              break;

            case 'join_chat':
              await this.handleJoinChat(ws, data);
              if (deviceInfo) {
                deviceInfo.userId = data.userId;
              }
              break;

            case 'send_chat_message':
              await this.handleSendMessage(ws, data);
              break;

            case 'typing_start':
              this.handleTyping(ws, data, true);
              break;

            case 'typing_stop':
              this.handleTyping(ws, data, false);
              break;

            case 'mark_message_read':
              this.handleMessageRead(ws, data);
              break;

            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        if (deviceInfo) {
          this.handleDisconnect(deviceInfo);
        }
      });
    });
  }

  async handleAuthentication(ws, data) {
    try {
      // Validate required fields
      if (!data.token || !data.deviceId) {
        throw new Error('Token and deviceId are required for authentication');
      }

      console.log('WebSocket authentication attempt for device:', data.deviceId);

      // Verify JWT token
      const decoded = await authService.verifyToken(data.token);

      // Get user from database to ensure they exist and get additional info
      const user = await dbService.getUserById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if device is registered for this user
      if (user.device_id !== data.deviceId) {
        throw new Error('Device not registered for this user');
      }

      console.log('WebSocket authenticated successfully:', user.username, 'device:', data.deviceId);

      // Send authentication success
      ws.send(JSON.stringify({
        type: 'authenticated',
        userId: user.id,
        username: user.username,
        deviceId: data.deviceId,
        publicKey: user.publicKey,
        timestamp: Date.now()
      }));

      return {
        success: true,
        userId: user.id,
        username: user.username,
        deviceId: data.deviceId,
        publicKey: user.publicKey
      };

    } catch (error) {
      console.error('WebSocket authentication failed:', error.message);
      throw error;
    }
  }

  async handleJoinChat(ws, data) {
    const { chatId, userId } = data;
    console.log(`User ${userId} joining chat ${chatId}`);

    // Add user to active chat
    if (!this.activeChats.has(chatId)) {
      this.activeChats.set(chatId, new Set());
    }
    this.activeChats.get(chatId).add(userId);

    // Add user to online users
    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, new Set());
    }
    this.onlineUsers.get(userId).add(data.deviceId);

    // Send message history
    const messages = await dbService.getMessages(chatId);
    ws.send(JSON.stringify({
      type: 'message_history',
      chatId,
      messages
    }));

    // Notify other users in chat that this user is online
    this.broadcastToChat(chatId, {
      type: 'user_online',
      userId,
      chatId
    }, userId); // Exclude the joining user
  }

  async handleSendMessage(ws, data) {
    const { chatId, senderId, content, messageId, timestamp, encrypted } = data;

    console.log(`Message from ${senderId} in chat ${chatId}: ${content.substring(0, 50)}...`);

    // Create message object
    const message = {
      id: messageId,
      chatId,
      senderId,
      content,
      timestamp: timestamp || Date.now(),
      encrypted: encrypted || false,
      status: 'sent'
    };

    // Store message in PostgreSQL
    await dbService.saveMessage(message);

    // Broadcast to all users in the chat
    this.broadcastToChat(chatId, {
      type: 'new_chat_message',
      ...message
    });

    // Send delivery confirmation to sender
    ws.send(JSON.stringify({
      type: 'message_delivered',
      messageId,
      chatId
    }));
  }

  handleTyping(ws, data, isTyping) {
    const { chatId, userId } = data;

    this.broadcastToChat(chatId, {
      type: isTyping ? 'user_typing' : 'user_typing_stop',
      userId,
      chatId,
      isTyping
    }, userId); // Exclude the typing user
  }

  handleMessageRead(ws, data) {
    const { chatId, messageId, readerId } = data;

    // Update message status in history
    const messages = this.messageHistory.get(chatId);
    if (messages) {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        message.status = 'read';
        if (!message.readBy) message.readBy = [];
        if (!message.readBy.includes(readerId)) {
          message.readBy.push(readerId);
        }
      }
    }

    // Broadcast read status to chat
    this.broadcastToChat(chatId, {
      type: 'message_read',
      messageId,
      readerId,
      chatId
    });
  }

  handleDisconnect(deviceInfo) {
    const { deviceId, userId } = deviceInfo;

    // Remove from connected devices
    this.connectedDevices.delete(deviceId);

    if (userId) {
      // Remove from online users
      const userDevices = this.onlineUsers.get(userId);
      if (userDevices) {
        userDevices.delete(deviceId);
        if (userDevices.size === 0) {
          this.onlineUsers.delete(userId);

          // Notify all chats that user is offline
          for (const [chatId, users] of this.activeChats) {
            if (users.has(userId)) {
              this.broadcastToChat(chatId, {
                type: 'user_offline',
                userId,
                chatId
              });
              users.delete(userId);
            }
          }
        }
      }
    }
  }

  broadcastToChat(chatId, message, excludeUserId = null) {
    const chatUsers = this.activeChats.get(chatId);
    if (!chatUsers) return;

    for (const userId of chatUsers) {
      if (excludeUserId && userId === excludeUserId) continue;

      const userDevices = this.onlineUsers.get(userId);
      if (userDevices) {
        for (const deviceId of userDevices) {
          const device = this.connectedDevices.get(deviceId);
          if (device && device.ws.readyState === 1) { // OPEN
            device.ws.send(JSON.stringify(message));
          }
        }
      }
    }
  }

  start(port = 3001) {
    this.server.listen(port, () => {
      console.log(`🚀 Quantum-Safe Messenger Server running on port ${port}`);
      console.log(`📡 WebSocket server ready`);
      console.log(`🔗 Frontend can connect to http://localhost:${port}`);
    });
  }
}

// Create and start server
const server = new QuantumSafeServer();
const PORT = process.env.PORT || 3001;
server.start(PORT);

module.exports = QuantumSafeServer;
