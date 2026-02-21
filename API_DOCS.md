# Quantum-Safe Messenger - API Documentation

## 📋 Overview

This document provides comprehensive API documentation for the Quantum-Safe Messenger backend services.

## 🔐 Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "deviceId": "string",
  "publicKey": "string"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "deviceId": "device_123",
    "publicKey": "public_key_here",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### POST /api/auth/login

Authenticate user and obtain access tokens.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "deviceId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "jwt_access_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### POST /api/auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "new_jwt_access_token"
}
```

## 💬 Messaging

### GET /api/messages/{chatId}

Retrieve messages for a specific chat.

**Parameters:**
- `chatId` (path): Chat identifier

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg_123",
      "chatId": "chat_1_2",
      "senderId": 1,
      "content": "Hello!",
      "timestamp": 1704067200000,
      "status": "read",
      "isEncrypted": true
    }
  ]
}
```

### POST /api/messages

Send a new message.

**Request Body:**
```json
{
  "chatId": "string",
  "content": "string",
  "isEncrypted": true
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "msg_124",
    "chatId": "chat_1_2",
    "senderId": 1,
    "content": "Hello!",
    "timestamp": 1704067200000,
    "status": "sent"
  }
}
```

### PUT /api/messages/{messageId}/status

Update message status (delivered, read, etc.).

**Parameters:**
- `messageId` (path): Message identifier

**Request Body:**
```json
{
  "status": "read"
}
```

**Response:**
```json
{
  "success": true
}
```

### POST /api/messages/{messageId}/reactions

Add a reaction to a message.

**Parameters:**
- `messageId` (path): Message identifier

**Request Body:**
```json
{
  "reactionType": "👍"
}
```

**Response:**
```json
{
  "success": true,
  "reactions": [
    {
      "reactionType": "👍",
      "count": 2,
      "users": ["user1", "user2"]
    }
  ]
}
```

### POST /api/messages/reply

Reply to a specific message.

**Request Body:**
```json
{
  "originalMessageId": "string",
  "content": "string",
  "chatId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "reply": {
    "id": "msg_125",
    "chatId": "chat_1_2",
    "senderId": 1,
    "content": "Reply message",
    "timestamp": 1704067260000,
    "status": "sent",
    "replyTo": "msg_123"
  }
}
```

## 📇 Contacts

### GET /api/contacts

Get user's contact list.

**Response:**
```json
{
  "success": true,
  "contacts": [
    {
      "id": 2,
      "username": "friend1",
      "email": "friend1@example.com",
      "status": "online",
      "addedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/contacts/search

Search for users to add as contacts.

**Query Parameters:**
- `query`: Search term (username or email)

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": 3,
      "username": "user3",
      "email": "user3@example.com",
      "status": "online"
    }
  ]
}
```

### POST /api/contacts/add

Add a user to contacts.

**Request Body:**
```json
{
  "contactId": 3
}
```

**Response:**
```json
{
  "success": true
}
```

### DELETE /api/contacts/{contactId}

Remove a contact.

**Parameters:**
- `contactId` (path): Contact user ID

**Response:**
```json
{
  "success": true
}
```

## 🛡️ Security & Monitoring

### POST /api/honeypot/report

Report security incidents or threats.

**Request Body:**
```json
{
  "threatType": "suspicious_login",
  "details": "Multiple failed attempts from IP 192.168.1.100",
  "sourceIP": "192.168.1.100",
  "userId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Threat report received and processed"
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "database": "connected",
  "uptime": "123456"
}
```

## 🔔 Push Notifications

### POST /api/push/subscribe

Subscribe to push notifications.

**Request Body:**
```json
{
  "endpoint": "https://push-service.com/endpoint/123",
  "keys": {
    "p256dh": "public_key_here",
    "auth": "auth_secret_here"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

### POST /api/push/unsubscribe

Unsubscribe from push notifications.

**Request Body:**
```json
{
  "endpoint": "https://push-service.com/endpoint/123"
}
```

**Response:**
```json
{
  "success": true
}
```

## 📊 WebSocket Events

The WebSocket connection supports real-time communication with the following events:

### Authentication
```javascript
// Client sends
{
  "type": "authenticate",
  "token": "jwt_token",
  "deviceId": "device_123"
}

// Server responds
{
  "type": "authenticated",
  "userId": 1,
  "username": "testuser"
}
```

### Chat Events
```javascript
// Join chat
{
  "type": "join_chat",
  "chatId": "chat_1_2",
  "userId": 1,
  "deviceId": "device_123"
}

// Send message
{
  "type": "send_chat_message",
  "chatId": "chat_1_2",
  "senderId": 1,
  "content": "Hello!",
  "messageId": "msg_123",
  "timestamp": 1704067200000,
  "encrypted": true
}

// Typing indicator
{
  "type": "typing_indicator",
  "chatId": "chat_1_2",
  "userId": 1,
  "isTyping": true
}
```

### Server Broadcasts
```javascript
// New message
{
  "type": "new_chat_message",
  "id": "msg_123",
  "chatId": "chat_1_2",
  "senderId": 1,
  "content": "Hello!",
  "timestamp": 1704067200000,
  "status": "sent"
}

// User online/offline
{
  "type": "user_online",
  "userId": 1,
  "chatId": "chat_1_2"
}

// Typing indicator
{
  "type": "typing_indicator",
  "userId": 1,
  "chatId": "chat_1_2",
  "isTyping": true
}
```

## 📱 Mobile App Integration

### Device Management
```javascript
// Register device
POST /api/devices/register
{
  "deviceId": "unique_device_id",
  "deviceType": "android",
  "pushToken": "firebase_token"
}

// Update device status
PUT /api/devices/{deviceId}/status
{
  "status": "active"
}
```

## ⚠️ Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `UNAUTHORIZED`: Invalid or missing authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INTERNAL_ERROR`: Server error

## 🔧 Rate Limiting

API endpoints are protected by rate limiting:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per authenticated user
- WebSocket connections: 10 per user

## 🔒 Security Headers

All responses include security headers:
```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

This comprehensive API documentation covers all available endpoints and their usage patterns for the Quantum-Safe Messenger application.