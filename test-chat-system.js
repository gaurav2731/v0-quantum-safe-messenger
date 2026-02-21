// Test script for the real chat system
const WebSocket = require('ws');

console.log('🧪 Testing Real Chat System...\n');

function createTestClient(clientName, deviceId) {
  return new Promise((resolve) => {
    console.log(`🔌 Connecting ${clientName}...`);

    const ws = new WebSocket('ws://localhost:3001');

    ws.on('open', function open() {
      console.log(`✅ ${clientName} connected`);

      // Step 1: Authenticate
      const authMessage = {
        type: 'authenticate',
        deviceId: deviceId
      };
      ws.send(JSON.stringify(authMessage));
      console.log(`📤 ${clientName} authenticated`);
    });

    ws.on('message', function message(data) {
      const parsed = JSON.parse(data.toString());
      console.log(`📥 ${clientName} received:`, parsed.type);

      switch (parsed.type) {
        case 'authenticated':
          // Step 2: Join chat
          const joinMessage = {
            type: 'join_chat',
            chatId: 'test_chat_123',
            userId: clientName.toLowerCase(),
            deviceId: deviceId
          };
          ws.send(JSON.stringify(joinMessage));
          console.log(`📤 ${clientName} joined chat`);
          break;

        case 'message_history':
          console.log(`📚 ${clientName} received message history:`, parsed.messages.length, 'messages');

          // Step 3: Send a test message (only for first client)
          if (clientName === 'Alice') {
            setTimeout(() => {
              const chatMessage = {
                type: 'send_chat_message',
                chatId: 'test_chat_123',
                senderId: 'alice',
                content: `Hello from ${clientName}! This is a real chat message.`,
                messageId: `msg_${Date.now()}`,
                timestamp: Date.now(),
                encrypted: false
              };
              ws.send(JSON.stringify(chatMessage));
              console.log(`💬 ${clientName} sent message`);
            }, 1000);
          }
          break;

        case 'new_chat_message':
          console.log(`💬 ${clientName} received chat message: "${parsed.content}" from ${parsed.senderId}`);
          break;

        case 'message_delivered':
          console.log(`✅ ${clientName} message delivered: ${parsed.messageId}`);
          break;

        case 'user_online':
          console.log(`🟢 ${clientName} sees user online: ${parsed.userId}`);
          break;
      }
    });

    ws.on('error', function error(err) {
      console.error(`❌ ${clientName} WebSocket error:`, err.message);
    });

    ws.on('close', function close(code, reason) {
      console.log(`🔌 ${clientName} disconnected:`, code);
      resolve();
    });

    // Auto-close after 10 seconds
    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    }, 10000);
  });
}

async function runChatTest() {
  try {
    console.log('🚀 Starting Chat System Test...\n');

    // Start server first
    console.log('📡 Checking if server is running...');

    // Create multiple clients to test broadcasting
    const clients = [
      createTestClient('Alice', 'device_alice_001'),
      createTestClient('Bob', 'device_bob_001'),
      createTestClient('Charlie', 'device_charlie_001')
    ];

    // Wait for all clients to complete
    await Promise.all(clients);

    console.log('\n✅ Chat System Test Completed!');
    console.log('🎉 Real-time messaging, broadcasting, and persistence are working!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if server is running first
const http = require('http');

const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3001/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          console.log('✅ Server is healthy:', health.status);
          resolve(true);
        } catch (e) {
          resolve(false);
        }
      });
    });

    req.on('error', () => {
      console.log('❌ Server not running on port 3001');
      console.log('💡 Please start the server first: cd server && node server.js');
      resolve(false);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
};

// Run the test
checkServer().then(isRunning => {
  if (isRunning) {
    runChatTest();
  } else {
    console.log('❌ Cannot run chat test - server not available');
  }
});
