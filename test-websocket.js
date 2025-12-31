// Simple WebSocket test client
const WebSocket = require('ws');

console.log('🧪 Testing WebSocket connection to backend...');

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', function open() {
  console.log('✅ WebSocket connection established');

  // Send a test message
  const testMessage = {
    type: 'test',
    message: 'Hello from test client',
    timestamp: Date.now()
  };

  ws.send(JSON.stringify(testMessage));
  console.log('📤 Sent test message:', testMessage);
});

ws.on('message', function message(data) {
  console.log('📥 Received message:', data.toString());

  try {
    const parsed = JSON.parse(data.toString());
    console.log('📋 Parsed message:', parsed);

    if (parsed.type === 'echo') {
      console.log('✅ Echo response received - WebSocket working correctly!');
    }
  } catch (e) {
    console.log('❌ Failed to parse message:', e.message);
  }

  // Close connection after test
  setTimeout(() => {
    ws.close();
    console.log('🔚 Test completed, connection closed');
  }, 1000);
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err.message);
});

ws.on('close', function close(code, reason) {
  console.log('🔌 WebSocket connection closed:', code, reason.toString());
});

// Timeout after 5 seconds
setTimeout(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.close();
    console.log('⏰ Test timeout - closing connection');
  }
}, 5000);
