import { QuantumSafeCrypto, KeyExchange, QuantumSafeMessage, SecurityStatus } from './crypto';
import { BlockchainVerifier, AuditTrail, TamperDetector } from './blockchain';
import { v4 as uuidv4 } from 'uuid';

// Quantum-Safe Messaging System with Enhanced Simulation
export class QuantumSafeMessenger {
  private blockchainVerifier: BlockchainVerifier;
  private userKeys: Map<string, { publicKey: string; privateKey: string }> = new Map();
  private sharedSecrets: Map<string, string> = new Map();
  private messageHistory: Map<string, QuantumSafeMessage[]> = new Map();
  private simulatedUsers: Map<string, { name: string; avatar: string; status: 'online' | 'offline' }> = new Map();

  constructor() {
    this.blockchainVerifier = new BlockchainVerifier();
    this.initializeSimulatedUsers();
    this.generateSampleMessages();
  }

  private initializeSimulatedUsers() {
    this.simulatedUsers.set('user1', {
      name: 'Alice Quantum',
      avatar: '👩‍💻',
      status: 'online'
    });
    this.simulatedUsers.set('user2', {
      name: 'Bob Secure',
      avatar: '👨‍🔬',
      status: 'online'
    });
    this.simulatedUsers.set('user3', {
      name: 'Charlie Crypto',
      avatar: '👨‍💼',
      status: 'offline'
    });
  }

  private generateSampleMessages() {
    const sampleMessages: QuantumSafeMessage[] = [
      {
        id: 'msg_sample_1',
        content: 'Hello! This is our first quantum-safe message. 🔐',
        encrypted: true,
        iv: 'a1b2c3d4e5f67890',
        salt: 'salt1234567890abcdef',
        tag: 'tag1234567890abcdef',
        hash: 'hash1234567890abcdef1234567890abcdef',
        signature: 'sig1234567890abcdef1234567890abcdef',
        timestamp: Date.now() - 1800000, // 30 minutes ago
        senderId: 'user1',
        recipientId: 'user2',
        blockchainHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        tamperProof: true
      },
      {
        id: 'msg_sample_2',
        content: 'The encryption is working perfectly! All messages are quantum-safe. 🛡️',
        encrypted: true,
        iv: 'b2c3d4e5f6789012',
        salt: 'salt2345678901bcdefg',
        tag: 'tag2345678901bcdefg',
        hash: 'hash2345678901bcdefg2345678901bcdefg',
        signature: 'sig2345678901bcdefg2345678901bcdefg',
        timestamp: Date.now() - 1200000, // 20 minutes ago
        senderId: 'user2',
        recipientId: 'user1',
        blockchainHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        tamperProof: true
      },
      {
        id: 'msg_sample_3',
        content: 'Blockchain verification is active. Every message is immutable! ⛓️',
        encrypted: true,
        iv: 'c3d4e5f678901234',
        salt: 'salt3456789012cdefgh',
        tag: 'tag3456789012cdefgh',
        hash: 'hash3456789012cdefgh3456789012cdefgh',
        signature: 'sig3456789012cdefgh3456789012cdefgh',
        timestamp: Date.now() - 600000, // 10 minutes ago
        senderId: 'user1',
        recipientId: 'user2',
        blockchainHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
        tamperProof: true
      },
      {
        id: 'msg_sample_4',
        content: 'Tamper detection is monitoring all messages in real-time. 🚨',
        encrypted: true,
        iv: 'd4e5f67890123456',
        salt: 'salt4567890123defghi',
        tag: 'tag4567890123defghi',
        hash: 'hash4567890123defghi4567890123defghi',
        signature: 'sig4567890123defghi4567890123defghi',
        timestamp: Date.now() - 300000, // 5 minutes ago
        senderId: 'user2',
        recipientId: 'user1',
        blockchainHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
        tamperProof: true
      }
    ];

    // Store sample messages in history
    const channelId = 'user1_user2';
    this.messageHistory.set(channelId, sampleMessages);
  }

  /**
   * Initialize user with quantum-safe keys
   */
  async initializeUser(userId: string): Promise<SecurityStatus> {
    try {
      // Generate quantum-safe key pair
      const keyPair = KeyExchange.generateKeyPair();
      this.userKeys.set(userId, keyPair);

      // Initialize blockchain wallet
      await this.blockchainVerifier.initializeWallet();

      // Generate quantum-safe encryption key
      const quantumSafeKey = QuantumSafeCrypto.generateQuantumSafeKey();

      // Log initialization
      AuditTrail.logEvent('USER_INITIALIZED', {
        userId,
        publicKey: keyPair.publicKey,
        walletAddress: this.blockchainVerifier.getWalletAddress(),
        timestamp: Date.now()
      });

      return {
        encryptionActive: true,
        blockchainVerified: true,
        tamperDetected: false,
        auditTrailComplete: true,
        quantumSafeKey,
        lastVerification: Date.now()
      };
    } catch (error) {
      console.error('User initialization failed:', error);
      throw new Error('Failed to initialize quantum-safe user');
    }
  }

  /**
   * Establish secure communication channel between users
   */
  async establishSecureChannel(userId1: string, userId2: string): Promise<string> {
    const user1Keys = this.userKeys.get(userId1);
    const user2Keys = this.userKeys.get(userId2);

    if (!user1Keys || !user2Keys) {
      throw new Error('One or both users not initialized');
    }

    // Perform quantum-safe key agreement
    const sharedSecret = KeyExchange.performKeyAgreement(
      user1Keys.privateKey,
      user2Keys.publicKey
    );

    const channelId = `${userId1}_${userId2}`;
    this.sharedSecrets.set(channelId, sharedSecret);

    // Log channel establishment
    AuditTrail.logEvent('SECURE_CHANNEL_ESTABLISHED', {
      channelId,
      userId1,
      userId2,
      timestamp: Date.now()
    });

    return channelId;
  }

  /**
   * Send quantum-safe encrypted message
   */
  async sendMessage(
    senderId: string,
    recipientId: string,
    content: string
  ): Promise<QuantumSafeMessage> {
    try {
      const channelId = `${senderId}_${recipientId}`;
      const sharedSecret = this.sharedSecrets.get(channelId);

      if (!sharedSecret) {
        throw new Error('Secure channel not established');
      }

      // Generate message ID
      const messageId = uuidv4();

      // Encrypt message
      const encryptedData = QuantumSafeCrypto.encryptMessage(content, sharedSecret);

      // Generate message hash for tamper detection
      const messageHash = QuantumSafeCrypto.generateHash(content);

      // Generate digital signature
      const senderKeys = this.userKeys.get(senderId);
      if (!senderKeys) {
        throw new Error('Sender not initialized');
      }

      const signature = QuantumSafeCrypto.signMessage(content, senderKeys.privateKey);

      // Create quantum-safe message
      const message: QuantumSafeMessage = {
        id: messageId,
        content: encryptedData.encrypted,
        encrypted: true,
        iv: encryptedData.iv,
        salt: encryptedData.salt,
        tag: encryptedData.tag,
        hash: messageHash,
        signature,
        timestamp: Date.now(),
        senderId,
        recipientId,
        tamperProof: true
      };

      // Store message metadata on blockchain
      try {
        const blockchainHash = await this.blockchainVerifier.storeMessageMetadata({
          messageId,
          senderId,
          recipientId,
          timestamp: message.timestamp,
          hash: messageHash,
          signature
        });
        message.blockchainHash = blockchainHash;
      } catch (error) {
        console.warn('Blockchain storage failed, continuing with local storage:', error);
      }

      // Store message in history
      if (!this.messageHistory.has(channelId)) {
        this.messageHistory.set(channelId, []);
      }
      this.messageHistory.get(channelId)!.push(message);

      // Log message sending
      AuditTrail.logEvent('MESSAGE_SENT', {
        messageId,
        senderId,
        recipientId,
        encrypted: true,
        blockchainHash: message.blockchainHash,
        timestamp: message.timestamp
      }, message.blockchainHash);

      return message;
    } catch (error) {
      console.error('Message sending failed:', error);
      throw new Error('Failed to send quantum-safe message');
    }
  }

  /**
   * Receive and decrypt quantum-safe message
   */
  async receiveMessage(
    recipientId: string,
    message: QuantumSafeMessage
  ): Promise<{ content: string; verified: boolean; tamperDetected: boolean }> {
    try {
      const channelId = `${message.senderId}_${recipientId}`;
      const sharedSecret = this.sharedSecrets.get(channelId);

      if (!sharedSecret) {
        throw new Error('Secure channel not established');
      }

      // Verify message integrity
      const tamperCheck = TamperDetector.detectTampering(message, message.hash);
      
      if (tamperCheck.tampered) {
        AuditTrail.logEvent('TAMPER_DETECTED', {
          messageId: message.id,
          details: tamperCheck.details,
          severity: tamperCheck.severity,
          timestamp: Date.now()
        });

        throw new Error(`Message tampering detected: ${tamperCheck.details}`);
      }

      // Verify digital signature
      const senderKeys = this.userKeys.get(message.senderId);
      if (!senderKeys) {
        throw new Error('Sender not found');
      }

      const signatureValid = QuantumSafeCrypto.verifySignature(
        message.content,
        message.signature,
        senderKeys.publicKey
      );

      if (!signatureValid) {
        AuditTrail.logEvent('SIGNATURE_VERIFICATION_FAILED', {
          messageId: message.id,
          senderId: message.senderId,
          timestamp: Date.now()
        });
        throw new Error('Digital signature verification failed');
      }

      // Decrypt message
      const decryptedContent = QuantumSafeCrypto.decryptMessage(
        message.content,
        message.iv!,
        message.salt!,
        message.tag!,
        sharedSecret
      );

      // Verify blockchain metadata if available
      let blockchainVerified = false;
      if (message.blockchainHash) {
        try {
          const verification = await this.blockchainVerifier.verifyMessageMetadata(message.id);
          blockchainVerified = verification.verified;
        } catch (error) {
          console.warn('Blockchain verification failed:', error);
        }
      }

      // Log message reception
      AuditTrail.logEvent('MESSAGE_RECEIVED', {
        messageId: message.id,
        recipientId,
        decrypted: true,
        signatureValid,
        blockchainVerified,
        timestamp: Date.now()
      });

      return {
        content: decryptedContent,
        verified: signatureValid && blockchainVerified,
        tamperDetected: tamperCheck.tampered
      };
    } catch (error) {
      console.error('Message reception failed:', error);
      throw new Error('Failed to receive quantum-safe message');
    }
  }

  /**
   * Get message history for a channel
   */
  getMessageHistory(userId1: string, userId2: string): QuantumSafeMessage[] {
    const channelId = `${userId1}_${userId2}`;
    return this.messageHistory.get(channelId) || [];
  }

  /**
   * Get security status for a user
   */
  getSecurityStatus(userId: string): SecurityStatus | null {
    const userKeys = this.userKeys.get(userId);
    if (!userKeys) return null;

    const quantumSafeKey = QuantumSafeCrypto.generateQuantumSafeKey();
    const stats = AuditTrail.getSecurityStats();

    return {
      encryptionActive: true,
      blockchainVerified: stats.securityScore > 80,
      tamperDetected: false,
      auditTrailComplete: stats.totalLogs > 0,
      quantumSafeKey,
      lastVerification: Date.now()
    };
  }

  /**
   * Get audit trail for security monitoring
   */
  getAuditTrail(filter?: {
    action?: string;
    startTime?: number;
    endTime?: number;
    verified?: boolean;
  }) {
    return AuditTrail.getLogs(filter);
  }

  /**
   * Get security statistics
   */
  getSecurityStats() {
    return AuditTrail.getSecurityStats();
  }

  /**
   * Verify message integrity
   */
  verifyMessageIntegrity(message: QuantumSafeMessage): boolean {
    return TamperDetector.detectTampering(message, message.hash).tampered === false;
  }

  /**
   * Get user information
   */
  getUserInfo(userId: string): { name: string; avatar: string; status: 'online' | 'offline' } | null {
    return this.simulatedUsers.get(userId) || null;
  }

  /**
   * Get all users
   */
  getAllUsers(): Array<{ id: string; name: string; avatar: string; status: 'online' | 'offline' }> {
    return Array.from(this.simulatedUsers.entries()).map(([id, user]) => ({
      id,
      ...user
    }));
  }

  /**
   * Simulate user status changes
   */
  simulateUserActivity() {
    // Randomly change user status
    const users = Array.from(this.simulatedUsers.keys());
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const currentStatus = this.simulatedUsers.get(randomUser)?.status;
    
    if (currentStatus) {
      const newStatus = currentStatus === 'online' ? 'offline' : 'online';
      this.simulatedUsers.set(randomUser, {
        ...this.simulatedUsers.get(randomUser)!,
        status: newStatus
      });
      
      console.log(`👤 User ${randomUser} status changed to ${newStatus}`);
    }
  }

  /**
   * Get blockchain wallet information
   */
  async getWalletInfo() {
    return {
      address: this.blockchainVerifier.getWalletAddress(),
      balance: await this.blockchainVerifier.getWalletBalance()
    };
  }
}
