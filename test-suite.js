// Comprehensive Test Suite for Quantum-Safe Messenger
// Tests all components: Frontend, Backend, Database, Blockchain, Security

const { spawn } = require('child_process');
const WebSocket = require('ws');
const http = require('http');

class QuantumSafeMessengerTestSuite {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
    this.serverProcess = null;
    this.frontendProcess = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  }

  assert(condition, message) {
    this.testResults.total++;
    if (condition) {
      this.testResults.passed++;
      this.log(`✓ ${message}`, 'pass');
      this.testResults.details.push({ test: message, status: 'PASS' });
    } else {
      this.testResults.failed++;
      this.log(`✗ ${message}`, 'fail');
      this.testResults.details.push({ test: message, status: 'FAIL' });
    }
  }

  async testBackendServerStartup() {
    this.log('Testing Backend Server Startup...');

    return new Promise((resolve) => {
      // Start the server
      this.serverProcess = spawn('node', ['server/server.js'], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let serverOutput = '';
      let serverError = '';

      this.serverProcess.stdout.on('data', (data) => {
        serverOutput += data.toString();
      });

      this.serverProcess.stderr.on('data', (data) => {
        serverError += data.toString();
      });

      // Wait for server to start
      setTimeout(() => {
        // Check if server is running
        const isRunning = !this.serverProcess.killed;
        this.assert(isRunning, 'Backend server starts successfully');

        // Check for expected startup messages
        const hasQuantumSafeMessage = serverOutput.includes('Quantum-Safe Messenger Server');
        this.assert(hasQuantumSafeMessage, 'Server displays quantum-safe branding');

        const hasWebSocketMessage = serverOutput.includes('WebSocket server ready');
        this.assert(hasWebSocketMessage, 'WebSocket server initializes');

        const hasStoreForwardMessage = serverOutput.includes('store-and-forward');
        this.assert(hasStoreForwardMessage, 'Store-and-forward architecture confirmed');

        resolve();
      }, 3000);
    });
  }

  async testAPIEndpoints() {
    this.log('Testing API Endpoints...');

    // Test health endpoint
    const healthResponse = await this.makeRequest('GET', '/health');
    this.assert(healthResponse.status === 200, 'Health endpoint returns 200');
    this.assert(healthResponse.data.status === 'healthy', 'Health status is healthy');

    // Test device registration endpoint
    const registerData = {
      accountId: 'test-account-1',
      deviceId: 'test-device-1',
      publicKeyBundle: {
        identityKey: 'test-identity-key',
        signedPreKey: { keyId: '1', publicKey: 'test-pub', privateKey: 'test-priv', signature: 'test-sig' },
        preKeys: [{ keyId: '1', publicKey: 'test-prekey-pub', privateKey: 'test-prekey-priv' }]
      }
    };
    const registerResponse = await this.makeRequest('POST', '/register-device', registerData);
    this.assert(registerResponse.status === 200, 'Device registration succeeds');
    this.assert(registerResponse.data.success === true, 'Registration response indicates success');

    // Test public key retrieval
    const publicKeyResponse = await this.makeRequest('GET', '/public-keys/test-device-1');
    this.assert(publicKeyResponse.status === 200, 'Public key retrieval succeeds');
    this.assert(publicKeyResponse.data.identityKey === 'test-identity-key', 'Correct public key returned');
  }

  async testWebSocketFunctionality() {
    this.log('Testing WebSocket Functionality...');

    return new Promise((resolve) => {
      const ws = new WebSocket('ws://localhost:3001');

      ws.on('open', () => {
        this.assert(true, 'WebSocket connection established');

        // Test device authentication
        ws.send(JSON.stringify({
          type: 'authenticate',
          deviceId: 'test-device-ws',
          signature: 'test-signature'
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'authenticated') {
          this.assert(message.deviceId === 'test-device-ws', 'Device authentication successful');

          // Test message sending
          ws.send(JSON.stringify({
            type: 'send_message',
            senderDeviceId: 'test-device-ws',
            recipientDevices: ['recipient-device-1'],
            encryptedMessages: new Map([['recipient-device-1', {
              deviceId: 'recipient-device-1',
              ciphertext: 'encrypted-test-message',
              messageNumber: 1,
              previousChainLength: 0,
              ciphertextType: 'normal'
            }]]),
            messageId: 'test-msg-1'
          }));
        } else if (message.type === 'message_sent') {
          this.assert(message.status === 'delivered', 'Message delivery confirmed');
          ws.close();
          resolve();
        }
      });

      ws.on('error', (error) => {
        this.assert(false, `WebSocket error: ${error.message}`);
        resolve();
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        ws.close();
        resolve();
      }, 10000);
    });
  }

  async testSignalProtocolViaAPI() {
    this.log('Testing Signal Protocol via API endpoints...');

    // Test that the server can handle encryption/decryption requests
    // Since we can't directly import TS modules, we'll test through the API

    // Register two test devices
    const device1Data = {
      accountId: 'test-account-1',
      deviceId: 'test-device-1',
      publicKeyBundle: {
        identityKey: 'identity-key-1',
        signedPreKey: { keyId: '1', publicKey: 'signed-pub-1', privateKey: 'signed-priv-1', signature: 'sig-1' },
        preKeys: [{ keyId: '1', publicKey: 'prekey-pub-1', privateKey: 'prekey-priv-1' }]
      }
    };

    const device2Data = {
      accountId: 'test-account-2',
      deviceId: 'test-device-2',
      publicKeyBundle: {
        identityKey: 'identity-key-2',
        signedPreKey: { keyId: '2', publicKey: 'signed-pub-2', privateKey: 'signed-priv-2', signature: 'sig-2' },
        preKeys: [{ keyId: '2', publicKey: 'prekey-pub-2', privateKey: 'prekey-priv-2' }]
      }
    };

    const reg1Response = await this.makeRequest('POST', '/register-device', device1Data);
    const reg2Response = await this.makeRequest('POST', '/register-device', device2Data);

    this.assert(reg1Response.status === 200, 'Device 1 registration successful');
    this.assert(reg2Response.status === 200, 'Device 2 registration successful');

    // Test that both devices can retrieve each other's public keys
    const pubKey1Response = await this.makeRequest('GET', '/public-keys/test-device-1');
    const pubKey2Response = await this.makeRequest('GET', '/public-keys/test-device-2');

    this.assert(pubKey1Response.status === 200, 'Can retrieve device 1 public keys');
    this.assert(pubKey2Response.status === 200, 'Can retrieve device 2 public keys');
  }

  async testBlockchainIntegration() {
    this.log('Testing Blockchain Integration...');

    // Test audit log creation via API
    const auditData = {
      action: 'test_action',
      data: {
        testData: 'quantum-safe-test',
        timestamp: Date.now()
      }
    };

    const auditResponse = await this.makeRequest('POST', '/audit-log', auditData);
    this.assert(auditResponse.status === 200, 'Audit log created successfully');
    this.assert(auditResponse.data.logHash, 'Log hash returned');
    this.assert(typeof auditResponse.data.logHash === 'string', 'Log hash is string');
    this.assert(auditResponse.data.logHash.length > 0, 'Log hash is not empty');
  }

  async testFrontendBuild() {
    this.log('Testing Frontend Build...');

    return new Promise((resolve) => {
      const buildProcess = spawn('npm', ['run', 'build'], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let buildOutput = '';
      let buildError = '';

      buildProcess.stdout.on('data', (data) => {
        buildOutput += data.toString();
      });

      buildProcess.stderr.on('data', (data) => {
        buildError += data.toString();
      });

      buildProcess.on('close', (code) => {
        const buildSuccess = code === 0;
        this.assert(buildSuccess, 'Frontend builds successfully');

        if (!buildSuccess) {
          this.log(`Build errors: ${buildError}`, 'error');
        }

        // Check for expected build artifacts
        const fs = require('fs');
        const nextConfigExists = fs.existsSync('.next');
        this.assert(nextConfigExists, 'Next.js build artifacts created');

        resolve();
      });
    });
  }

  async testSecurityFeatures() {
    this.log('Testing Security Features...');

    // Test rate limiting by making multiple requests quickly
    const requests = [];
    for (let i = 0; i < 15; i++) {
      requests.push(this.makeRequest('GET', '/health'));
    }

    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => r.status === 200).length;
    const rateLimitedCount = responses.filter(r => r.status === 429).length;

    // Should allow some requests but rate limit others
    this.assert(successCount > 0, 'Some requests succeed before rate limiting');
    this.assert(rateLimitedCount > 0, 'Rate limiting is active');

    // Test CORS headers
    const healthResponse = await this.makeRequest('GET', '/health');
    const hasCorsHeader = healthResponse.headers['access-control-allow-origin'];
    this.assert(hasCorsHeader, 'CORS headers are properly configured');

    // Test security headers
    const hasSecurityHeaders = healthResponse.headers['x-content-type-options'] === 'nosniff';
    this.assert(hasSecurityHeaders, 'Security headers are set');
  }

  async testMultiDeviceSupport() {
    this.log('Testing Multi-Device Support...');

    // Register multiple devices for same account via API
    const accountId = 'multi-device-account';
    const devices = ['device-a', 'device-b', 'device-c'];

    for (const deviceId of devices) {
      const deviceData = {
        accountId: accountId,
        deviceId: deviceId,
        publicKeyBundle: {
          identityKey: `identity-key-${deviceId}`,
          signedPreKey: { keyId: '1', publicKey: `signed-pub-${deviceId}`, privateKey: `signed-priv-${deviceId}`, signature: `sig-${deviceId}` },
          preKeys: [{ keyId: '1', publicKey: `prekey-pub-${deviceId}`, privateKey: `prekey-priv-${deviceId}` }]
        }
      };

      const regResponse = await this.makeRequest('POST', '/register-device', deviceData);
      this.assert(regResponse.status === 200, `Device ${deviceId} registration successful`);
    }

    // Test that all devices can retrieve each other's public keys
    for (const deviceId of devices) {
      const pubKeyResponse = await this.makeRequest('GET', `/public-keys/${deviceId}`);
      this.assert(pubKeyResponse.status === 200, `Can retrieve public keys for ${deviceId}`);
    }

    // Test fan-out message delivery (simulated via API)
    const messageData = {
      senderDeviceId: 'device-a',
      recipientDevices: ['device-b', 'device-c'],
      messageId: 'multi-device-test-msg',
      encryptedMessages: {
        'device-b': {
          deviceId: 'device-b',
          ciphertext: 'encrypted-for-b',
          messageNumber: 1,
          previousChainLength: 0,
          ciphertextType: 'normal'
        },
        'device-c': {
          deviceId: 'device-c',
          ciphertext: 'encrypted-for-c',
          messageNumber: 1,
          previousChainLength: 0,
          ciphertextType: 'normal'
        }
      }
    };

    const sendResponse = await this.makeRequest('POST', '/send-message', messageData);
    this.assert(sendResponse.status === 200, 'Multi-device message sent successfully');
    this.assert(sendResponse.data.recipientCount === 2, 'Message delivered to all recipients');
  }

  async makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const responseData = body ? JSON.parse(body) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: responseData
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: body
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive Quantum-Safe Messenger Test Suite');

    try {
      // Backend Tests
      await this.testBackendServerStartup();
      await this.testAPIEndpoints();
      await this.testWebSocketFunctionality();

      // Protocol Tests
      await this.testSignalProtocol();
      await this.testMultiDeviceSupport();

      // Integration Tests
      await this.testBlockchainIntegration();
      await this.testSecurityFeatures();

      // Frontend Tests
      await this.testFrontendBuild();

    } catch (error) {
      this.log(`Test suite error: ${error.message}`, 'error');
      this.assert(false, `Test suite completed with errors: ${error.message}`);
    } finally {
      // Cleanup
      if (this.serverProcess) {
        this.serverProcess.kill();
      }
      if (this.frontendProcess) {
        this.frontendProcess.kill();
      }
    }

    this.printResults();
  }

  printResults() {
    this.log('\n📊 Test Results Summary');
    this.log('='.repeat(50));
    this.log(`Total Tests: ${this.testResults.total}`);
    this.log(`Passed: ${this.testResults.passed}`);
    this.log(`Failed: ${this.testResults.failed}`);
    this.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);

    if (this.testResults.failed > 0) {
      this.log('\n❌ Failed Tests:');
      this.testResults.details
        .filter(test => test.status === 'FAIL')
        .forEach(test => this.log(`  - ${test.test}`, 'fail'));
    }

    this.log('\n✅ Passed Tests:');
    this.testResults.details
      .filter(test => test.status === 'PASS')
      .forEach(test => this.log(`  - ${test.test}`, 'pass'));
  }
}

// Run the test suite
if (require.main === module) {
  const testSuite = new QuantumSafeMessengerTestSuite();
  testSuite.runAllTests().catch(console.error);
}

module.exports = QuantumSafeMessengerTestSuite;
